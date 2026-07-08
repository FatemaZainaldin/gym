import { IsArray, IsBoolean, IsDate, IsEmail, IsEnum, IsJSON, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator"
import { Role } from "../enums/role.enum";
import { UserStatus } from "../entities/user.entity";

export class CreateUserDTO {
    @IsString()
    @IsNotEmpty()
    tenantId: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;


    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    password: string;


    @IsString()
    @IsNotEmpty()
    phone: string;


    @IsString()
    @IsOptional()
    avatar?: string;

    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;

    @IsEnum(UserStatus)
    @IsOptional()
    status: UserStatus;



}