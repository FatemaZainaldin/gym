import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsDateString, IsEmail, IsEnum, IsJSON, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { SalaryType } from "../entities/trainer.entity";
import { UserStatus } from "src/users/entities/user.entity";

class TrainerShiftDto {
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @IsString()
    @IsNotEmpty()
    endTime: string;

}


class TrainerAvailabilityDto {
    @IsString()
    @IsNotEmpty()
    day: string;

    @IsBoolean()
    active: boolean;


    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TrainerShiftDto)
    shifts: TrainerShiftDto[];
}

export class CreateTrainerDTO {

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    nationality?: string;

    @IsString()
    @IsOptional()
    nationalId?: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsDateString()
    @IsOptional()
    dateOfBirth?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    educationLevel?: string;

    @IsString()
    @IsOptional()
    fieldOfStudy?: string;

    @IsNumber()
    @IsOptional()
    yearsExperience?: number;

    @IsString()
    @IsOptional()
    certifications?: string;


    @IsArray()
    @IsOptional()
    specializations?: string[];

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    languages?: string[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => TrainerAvailabilityDto)
    availability?: TrainerAvailabilityDto[];

    @IsNumber()
    @IsOptional()
    sessionDurationMinutes?: number;

    @IsNumber()
    @IsOptional()
    maxClientsPerDay?: number;

    @IsDateString()
    @IsOptional()
    contractStart?: string;

    @IsDateString()
    @IsOptional()
    contractEnd?: string;

    @IsEnum(SalaryType)
    @IsOptional()
    salaryType?: SalaryType;

    @IsNumber()
    @IsOptional()
    monthlySalary?: number;

    @IsNumber()
    @IsOptional()
    sessionRate?: number;

    @IsNumber()
    @IsOptional()
    commissionPercent?: number;

    @IsString()
    @IsOptional()
    instagram?: string;

    @IsString()
    @IsOptional()
    tiktok?: string;

    @IsNumber()
    @IsOptional()
    initialRating?: number;


    @IsNumber()
    @IsOptional()
    targetMonthlySessions?: number;

    @IsString()
    @IsOptional()
    adminNotes?: string;

    @IsEnum(UserStatus)
    @IsOptional()
    status?: UserStatus;

}
