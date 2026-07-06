import { IsEnum, IsOptional, IsString } from "class-validator"
import { PaginationDto } from "src/common/dto/pagination.dto";
import { UserStatus } from "../entities/user.entity";
import { Role } from "../enums/role.enum";

export class UserFilterDTO extends PaginationDto {

    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;


    @IsString()
    @IsOptional()
    email?: string;

    
    @IsString()
    @IsOptional()
    subdomain?: string;


    @IsString()
    @IsOptional()
    phone?: string;


    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @IsEnum(UserStatus)
    @IsOptional()
    status?: UserStatus;


}