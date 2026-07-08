import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { success } from 'src/common/helpers/response.helper';
import { UserFilterDTO } from './dto/user-filter.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';


@Controller('users')
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)

export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() userFilterDto: UserFilterDTO, @CurrentUser() user: User) {
        const { data, meta } = await this.usersService.findAllUsers(userFilterDto, user);
        return success('ALL_USERS_FETCHED', { en: 'All users fetched.', ar: 'تم جلب المستخدمين.' }, data, meta);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findById({ id });
        return success('USER_FETCHED', { en: 'User fetched.', ar: 'تم جلب المستخدم.' }, user);
    }


    @Post('')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDTO: CreateUserDTO , @CurrentUser() currentUser: User) {
        const user = await this.usersService.createUser(createUserDTO,currentUser);
        return success('USER_CREATED',
            {
                en: 'User created successfully.',
                ar: 'تم إنشاء المستخدم بنجاح.',
            },
            { ...user });
    }



}
