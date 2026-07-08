import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { BaseEntity } from 'src/common/entities/base.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, BaseEntity]), MailModule],
  controllers: [UsersController],
  providers: [ UsersService],
  exports: [UsersService],
})
export class UsersModule {}
