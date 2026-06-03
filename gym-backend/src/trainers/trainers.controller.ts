import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { CreateTrainerDTO } from './dto/create-trainer.dto';
import { success } from 'src/common/helpers/response.helper';
import { UpdateTrainerDTO } from './dto/update-trainer.dto';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { Role } from 'src/users/enums/role.enum';
import { Roles } from 'src/common/decorators/public.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TrainerFilterDto } from './dto/trainer-filter.dto';

@Controller('trainers')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)

export class TrainersController {
    constructor(private readonly trainersService: TrainersService) { }

    @Post('')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createTrainerDTO: CreateTrainerDTO) {
        const trainer = await this.trainersService.createTrainer(createTrainerDTO);
        return success('TRAINER_CREATED',
            {
                en: 'Trainer created successfully.',
                ar: 'تم إنشاء المدرب بنجاح.',
            },
            { ...trainer });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string) {
        await this.trainersService.deleteTrainer(id);
        return success('TRAINER_DELETED',
            {
                en: 'Trainer deleted successfully.',
                ar: 'تم حذف المدرب بنجاح.',
            },
        );
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateData: UpdateTrainerDTO) {
        const result = await this.trainersService.updateTrainer(id, updateData);
        return success('TRAINER_UPDATED',
            {
                en: 'Trainer updated successfully.',
                ar: 'تم تحديث المدرب بنجاح.',
            },
            { ...result });
    }
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        const trainer = await this.trainersService.findTrainerById(id);
        return success('TRAINER_FETCHED', { en: 'Trainer fetched.', ar: 'تم جلب المدرب.' }, trainer);
    }

    @Get('')
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() trainerFilterDto : TrainerFilterDto) {
        const {data, total, currentPage, pageSize, totalPages } = await this.trainersService.findAllTrainers(trainerFilterDto);
        return success('ALL_TRAINERS_FETCHED', { en: 'All trainers fetched.', ar: 'تم جلب المدربين.' },data, { total, currentPage, pageSize, totalPages });
    }

}
