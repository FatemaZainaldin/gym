import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { UserStatus } from "../../users/entities/user.entity";
import { SalaryType } from "../entities/trainer.entity";

export class TrainerFilterDto extends PaginationDto {

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;


    @IsOptional()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    lastName:string;


    @IsArray()
    @IsOptional()
    specializations?: string[];

    @IsOptional()
    @IsEnum(SalaryType)
    salaryType?: SalaryType;

    @IsOptional()
    @IsString()
    nationality?: string;

}
