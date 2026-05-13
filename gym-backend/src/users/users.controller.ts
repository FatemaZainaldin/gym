import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';


@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Post()
    create(@Body() body: any) {
        return this.usersService.createUser(body);
    }



}
