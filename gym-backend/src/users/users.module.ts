import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { BaseEntity } from 'src/common/entities/base.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, BaseEntity])],
  controllers: [UsersController],
  providers: [ UsersService],
  exports: [UsersService],
})
export class UsersModule {}
