import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { success } from 'src/common/helpers/response.helper';
import { UserFilterDTO } from './dto/user-filter.dto';


@Controller('users')
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER)

export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() userFilterDto: UserFilterDTO) {
        const { data, meta } = await this.usersService.findAllUsers(userFilterDto);
        return success('ALL_USERS_FETCHED', { en: 'All users fetched.', ar: 'تم جلب المستخدمين.' }, data, meta);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(@Param('id') id: string) {
        return this.usersService.findById({ id });
    }

    @Post()
    create(@Body() body: any) {
        return this.usersService.createUser(body);
    }



}
