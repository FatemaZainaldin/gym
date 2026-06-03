import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Trainer } from './entities/trainer.entity';
import { CreateTrainerDTO } from './dto/create-trainer.dto';
import { UpdateTrainerDTO } from './dto/update-trainer.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainerFilterDto } from './dto/trainer-filter.dto';

@Injectable()
export class TrainersService {

    constructor(
        @InjectRepository(Trainer)
        private trainerRepository: Repository<Trainer>
    ) { }


    async createTrainer(createTrainerDTO: CreateTrainerDTO) {
        const exists = await this.trainerRepository.findOne({ where: { email: createTrainerDTO.email } });
        if (exists) throw new ConflictException('Email already registered');
        const trainer = this.trainerRepository.create(createTrainerDTO);
        return this.trainerRepository.save(trainer);
    }

    async findAllTrainers(filters: TrainerFilterDto) {
        const { currentPage = 1, pageSize = 10, search, status, salaryType, nationality, specializations, firstName } = filters;

        const query = this.trainerRepository.createQueryBuilder('trainer');


        if (search) {
            query.andWhere(
                '(trainer.firstName ILIKE :search OR trainer.lastName ILIKE :search OR trainer.email ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (firstName) query.andWhere('trainer.firstName ILIKE :firstName', { firstName: `%${firstName}%` });
        if (status) query.andWhere('trainer.status = :status', { status });
        if (salaryType) query.andWhere('trainer.salaryType = :salaryType', { salaryType });
        if (nationality) query.andWhere('trainer.nationality ILIKE :nationality', { nationality: `%${nationality}%` });

        query.skip((currentPage - 1) * pageSize).take(pageSize);
        const [data, total] = await query.getManyAndCount();
        return { data, total, currentPage, pageSize, totalPages: Math.ceil(total / pageSize) }
    }

    async findTrainerById(id: string) {
        const trainer = await this.trainerRepository.findOne({ where: { id } });
        if (!trainer) throw new NotFoundException(`Trainer #${id} not found`);
        return trainer;
    }

    async updateTrainer(id: string, updateTrainerDto: UpdateTrainerDTO) {
        await this.findTrainerById(id);
        await this.trainerRepository.update(id, updateTrainerDto);
        return this.findTrainerById(id);
    }

    async deleteTrainer(id: string) {
        await this.findTrainerById(id);
        return this.trainerRepository.softDelete(id);
    }

}
