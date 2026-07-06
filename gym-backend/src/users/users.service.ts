import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserFilterDTO } from './dto/user-filter.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }


  async findAllUsers(filters: UserFilterDTO) {
    const {
      currentPage = 1,
      pageSize = 10,
      search,
      status,
      firstName,
      lastName,
      role,
      phone,
      email,
      subdomain,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = filters;

    const query =
      this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.tenant', 'tenant')
        .select([
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.email',
          'user.phone',
          'user.status',
          'user.role',
          'user.createdAt',
          'tenant.id',
          'tenant.subdomain',
        ]);

    if (search) {
      query.andWhere(
        `(user.firstName ILIKE :search
    OR user.lastName ILIKE :search
    OR user.email ILIKE :search
    OR user.phone ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (firstName) query.andWhere('user.firstName ILIKE :firstName', { firstName: `%${firstName}%` });
    if (lastName) query.andWhere('user.lastName ILIKE :lastName', { lastName: `%${lastName}%` });
    if (subdomain) query.andWhere('tenant.subdomain ILIKE :subdomain', { subdomain: `%${subdomain}%` });
    if (phone) query.andWhere('user.phone ILIKE :phone', { phone: `%${phone}%` });
    if (email) query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    if (role) query.andWhere('user.role = :role', { role });
    if (status) query.andWhere('user.status = :status', { status });


    // ← sorting

    const allowedColumns = ['firstName', 'lastName', 'email', 'phone', 'role', 'status', 'createdAt', 'tenant.subdomain'];
    const safeSortBy = allowedColumns.includes(sortBy) ? sortBy : 'createdAt';
    if (safeSortBy.startsWith('tenant.')) {
      query.orderBy(safeSortBy, sortOrder as 'ASC' | 'DESC');
    } else {
      query.orderBy(`user.${safeSortBy}`, sortOrder as 'ASC' | 'DESC');
    }

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

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findById(filters: Partial<Pick<User, 'id' | 'email' | 'tenantId'>>) {
    return this.usersRepository.findOne({ where: filters });
  }

  async createUser(userData: Partial<User>) {

    const hashedPassword =
      await bcrypt.hash(
        userData.password!,
        10,
      );

    const user = this.usersRepository.create(
      {
        ...userData,
        password: hashedPassword,
      }
    );
    return this.usersRepository.save(user);
  }

  async updateUser(id: string, userData: Partial<User>) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');

    // manually hash if password is being changed
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    Object.assign(user, userData);
    return this.usersRepository.save(user); // ← save() fires hooks, update() doesn't
  }

  async deleteUser(id: string) {
    const user = await this.findById({ id });
    if (!user) {
      throw new Error('User not found');
    }
    return this.usersRepository.remove(user);
  }
}
