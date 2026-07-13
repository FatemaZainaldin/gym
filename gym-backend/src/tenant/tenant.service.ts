import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tenant, TenantStatus } from "./entities/tenant.entity";
import { Repository } from "typeorm";
import { CreateTenantDTO } from "./dto/create-tenant.dto";
import { TenantFilterDTO } from "./dto/tenant-filter.dto";
import { UpdateTenantDTO } from "./dto/update-tenant-dto";
import { randomBytes } from "crypto";
import { MailService } from "src/mail/mail.service";
import { UsersService } from "src/users/users.service";
import { Role } from "src/users/enums/role.enum";
import { UserStatus } from "src/users/entities/user.entity";

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
            this.tenantRepository.findOne({ where: { email: createTenantDTO.email } }),
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
            email: createTenantDTO.email,
            firstName: createTenantDTO.name,
            lastName: createTenantDTO.subdomain,
            password: tempPassword,
            tenantId: saved.id,
            tenant: saved,
            role: Role.ADMIN,
            phone: createTenantDTO.phone,
            mustChangePassword: true,
            status: UserStatus.PENDING
        });

        return saved;
    }

    async resendCredentials(tenantId: string) {
        const tenant = await this.findTenantById({ id: tenantId });
        const user = await this.userService.findById({ tenantId });
        const tempPassword = randomBytes(6).toString('base64url');

        if (!user) {
            throw new NotFoundException(`Admin user for tenant #${tenantId} not found`);
        }

        await this.userService.updateUser(user.id, {
            password: tempPassword,
            mustChangePassword: true,
        });

        if (user && tenant.email) {
            await this.mailService.sendTenantWelcome({
                email: tenant?.email,
                name: tenant?.name,
                tempPassword: tempPassword,
                loginUrl: `${process.env.APP_URL}/auth/login`,
            });
        }

        return this.findTenantById({ id: tenantId });

    }

    async findTenantById(filters: Partial<Pick<Tenant, 'id' | 'subdomain'>>) {
        const tenant = await this.tenantRepository.findOne({ where: filters });
        if (!tenant) throw new NotFoundException(`Tenant not found`);
        return tenant;
    }

    async updateTenant(id: string, updateTenantDTO: UpdateTenantDTO) {
        await this.findTenantById({ id: id });
        await this.tenantRepository.update(id, updateTenantDTO);
        return this.findTenantById({ id: id });
    }

    async suspendTenant(id: string) {
        await this.findTenantById({ id: id });
        await this.tenantRepository.update(id, {
            status: TenantStatus.SUSPENDED,
            suspendedAt: new Date()
        });
        return this.findTenantById({ id: id });
    }

    async activateTenant(id: string) {
        await this.findTenantById({ id: id });
        await this.tenantRepository.update(id, {
            status: TenantStatus.TRIAL,
            activatedAt: new Date()
        });
        return this.findTenantById({ id: id });
    }

    async deleteTenant(id: string) {
        await this.findTenantById({ id: id });
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
            email,
            plan,
            trialEndsAt,
            suspendedAt,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = filters;

        const query = this.tenantRepository.createQueryBuilder('tenant');

        if (search) {
            query.andWhere(
                '(tenant.name ILIKE :search OR tenant.subdomain ILIKE :search OR tenant.email ILIKE :search OR tenant.phone ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (name) query.andWhere('tenant.name ILIKE :name', { name: `%${name}%` });
        if (subdomain) query.andWhere('tenant.subdomain ILIKE :subdomain', { subdomain: `%${subdomain}%` })
        if (phone) query.andWhere('tenant.phone ILIKE :phone', { phone: `%${phone}%` });
        if (email) query.andWhere('tenant.email ILIKE :email', { email: `%${email}%` });
        if (plan) query.andWhere('tenant.plan = :plan', { plan });
        if (status) query.andWhere('tenant.status = :status', { status });
        if (country) query.andWhere('tenant.country = :country', { country });


        // ← sorting
        const allowedColumns = ['name', 'subdomain', 'country', 'email', 'plan', 'status', 'createdAt', 'trialEndsAt', 'suspendedAt'];
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