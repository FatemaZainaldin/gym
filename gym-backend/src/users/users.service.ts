import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async findAll() {
    return this.usersRepository.find();
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.usersRepository.findOne({
      where: { id:id },
    });
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
}
