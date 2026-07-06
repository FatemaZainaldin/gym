import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tenant, TenantStatus } from "./entities/tenant.entity";
import { Repository } from "typeorm";
import { CreateTenantDTO } from "./dto/create-tenant.dto";
import { TenantFilterDTO } from "./dto/tenant-filter.dto";
import { UpdateTenantDTO } from "./dto/update-tenant-dto";
import { randomBytes } from "crypto";
import * as bcrypt from 'bcrypt';
import { MailService } from "src/mail/mail.service";
import { UsersService } from "src/users/users.service";
import { Role } from "src/users/enums/role.enum";

@Injectable()
export class TenantService {
    constructor
        (
            @InjectRepository(Tenant)
            private tenantRepository: Repository<Tenant>,
            private mailService: MailService,
            private userService: UsersService
        ) { }

    async createTenant(createTenantDTO: CreateTenantDTO) {
        const [emailExists, subdomainExists] = await Promise.all([
            this.tenantRepository.findOne({ where: { adminEmail: createTenantDTO.adminEmail } }),
            this.tenantRepository.findOne({ where: { subdomain: createTenantDTO.subdomain } }),
        ]);
        if (emailExists) throw new ConflictException('Email already registered');
        if (subdomainExists) throw new ConflictException('Subdomain already taken');

        const tenant = this.tenantRepository.create({
            ...createTenantDTO,
            status: TenantStatus.INACTIVE,
        });
        const saved = await this.tenantRepository.save(tenant);

        const tempPassword = randomBytes(6).toString('base64url');

        await this.userService.createUser({
            email: createTenantDTO.adminEmail,
            firstName: createTenantDTO.name,
            lastName: createTenantDTO.subdomain,
            password: tempPassword,
            tenantId: saved.id,
            role: Role.ADMIN,
            phone: createTenantDTO.phone,
            mustChangePassword: true,
        });

        if (createTenantDTO.adminEmail) {
            await this.mailService.sendTenantWelcome({
                email: createTenantDTO.adminEmail,
                name: createTenantDTO.name,
                tempPassword,
                loginUrl: `${process.env.APP_URL}/auth/login`,
            });
        }

        return saved;
    }

    async resendCredentials(tenantId: string) {
        const tenant = await this.findTenantById(tenantId);
        const user = await this.userService.findById({tenantId});
        const tempPassword = randomBytes(6).toString('base64url');

        if (!user) {
            throw new NotFoundException(`Admin user for tenant #${tenantId} not found`);
        }

        await this.userService.updateUser(user.id, {
            password: tempPassword,
            mustChangePassword: true,
        });

        if (user && tenant.adminEmail) {
            await this.mailService.sendTenantWelcome({
                email: tenant?.adminEmail,
                name: tenant?.name,
                tempPassword: tempPassword,
                loginUrl: `${process.env.APP_URL}/auth/login`,
            });
        }

        return this.findTenantById(tenantId);

    }


    async findTenantById(id: string) {
        const tenant = await this.tenantRepository.findOne({ where: { id } });
        if (!tenant) throw new NotFoundException(`Tenant #${id} not found`);
        return tenant;
    }

    async updateTenant(id: string, updateTenantDTO: UpdateTenantDTO) {
        await this.findTenantById(id);
        await this.tenantRepository.update(id, updateTenantDTO);
        return this.findTenantById(id);
    }

    async suspendTenant(id: string) {
        await this.findTenantById(id);
        await this.tenantRepository.update(id, {
            status: TenantStatus.SUSPENDED,
            suspendedAt: new Date()
        });
        return this.findTenantById(id);
    }

    async activateTenant(id: string) {
        await this.findTenantById(id);
        await this.tenantRepository.update(id, {
            status: TenantStatus.TRIAL,
            activatedAt: new Date()
        });
        return this.findTenantById(id);
    }

    async deleteTenant(id: string) {
        await this.findTenantById(id);
        return this.tenantRepository.softDelete(id);
    }

    async findAllTenants(filters: TenantFilterDTO) {
        const {
            currentPage = 1,
            pageSize = 10,
            search,
            status,
            name,
            subdomain,
            country,
            phone,
            adminEmail,
            plan,
            trialEndsAt,
            suspendedAt,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = filters;

        const query = this.tenantRepository.createQueryBuilder('tenant');

        if (search) {
            query.andWhere(
                '(tenant.name ILIKE :search OR tenant.subdomain ILIKE :search OR tenant.adminEmail ILIKE :search OR tenant.phone ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (name) query.andWhere('tenant.name ILIKE :name', { name: `%${name}%` });
        if (subdomain) query.andWhere('tenant.subdomain ILIKE :subdomain', { subdomain: `%${subdomain}%` })
        if (phone) query.andWhere('tenant.phone ILIKE :phone', { phone: `%${phone}%` });
        if (adminEmail) query.andWhere('tenant.adminEmail ILIKE :adminEmail', { adminEmail: `%${adminEmail}%` });
        if (plan) query.andWhere('tenant.plan = :plan', { plan });
        if (status) query.andWhere('tenant.status = :status', { status });
        if (country) query.andWhere('tenant.country = :country', { country });


        // ← sorting
        const allowedColumns = ['name', 'subdomain', 'country', 'adminEmail', 'plan', 'status', 'createdAt', 'trialEndsAt', 'suspendedAt'];
        const safeSortBy = allowedColumns.includes(sortBy) ? sortBy : 'createdAt';
        query.orderBy(`tenant.${safeSortBy}`, sortOrder as 'ASC' | 'DESC');

        query.skip((currentPage - 1) * pageSize).take(pageSize);

        const [data, total] = await query.getManyAndCount();

        return {
            data,
            meta: {
                total,
                currentPage,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    }


}