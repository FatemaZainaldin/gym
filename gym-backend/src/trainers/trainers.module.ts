import { Module } from '@nestjs/common';
import { TrainersController } from './trainers.controller';
import { TrainersService } from './trainers.service';
import { Trainer } from './entities/trainer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Trainer])],
    controllers: [TrainersController],
    providers: [TrainersService],
    exports: [TrainersService],
})
export class TrainersModule { }
