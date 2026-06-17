import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { success } from 'src/common/helpers/response.helper';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { Role } from 'src/users/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateTenantDTO } from './dto/create-tenant.dto';
import { UpdateTenantDTO } from './dto/update-tenant-dto';
import { TenantFilterDTO } from './dto/tenant-filter.dto';
import { TenantStatus } from './entities/tenant.entity';

@Controller('superadmin/tenant')
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN)

export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Post('')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createTenantDTO: CreateTenantDTO) {
        const tenant = await this.tenantService.createTenant(createTenantDTO);
        return success('TENANTS_CREATED',
            {
                en: 'Tenant created successfully.',
                ar: 'تم إنشاء المدرب بنجاح.',
            },
            { ...tenant });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string) {
        await this.tenantService.deleteTenant(id);
        return success('TENANTS_DELETED',
            {
                en: 'Tenant deleted successfully.',
                ar: 'تم حذف المدرب بنجاح.',
            },
        );
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateData: UpdateTenantDTO) {
        const result = await this.tenantService.updateTenant(id, updateData);
        return success('TENANTS_UPDATED',
            {
                en: 'Tenant updated successfully.',
                ar: 'تم تحديث المدرب بنجاح.',
            },
            { ...result });
    }
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        const tenant = await this.tenantService.findTenantById(id);
        return success('TENANTS_FETCHED', { en: 'Tenant fetched.', ar: 'تم جلب المدرب.' }, tenant);
    }

    @Get('')
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() tenantFilterDto : TenantFilterDTO) {
        const {data, meta } = await this.tenantService.findAllTenants(tenantFilterDto);
        return success('ALL_TENANT_FETCHED', { en: 'All tenant fetched.', ar: 'تم جلب المدربين.' },data, meta);
    }

     @Patch(':id/suspend')
    @HttpCode(HttpStatus.OK)
    async suspend(@Param('id') id: string) {
        const result = await this.tenantService.suspendTenant(id);
        return success('TENANT_SUSPENDED',
            {
                en: 'Tenant suspended successfully.',
                ar: 'تم تحديث المدرب بنجاح.',
            },
            { ...result });
    }

}
