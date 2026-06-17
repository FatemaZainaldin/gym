import { IsArray, IsBoolean, IsDate, IsDateString, IsEmail, IsEnum, IsJSON, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { SubscriptionPlan, TenantStatus } from "../entities/tenant.entity";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class TenantFilterDTO extends PaginationDto {

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    subdomain: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @IsOptional()
    phone?: string;


    @IsString()
    @IsOptional()
    adminEmail?: string;


    @IsEnum(TenantStatus)
    @IsOptional()
    status: TenantStatus;

    @IsEnum(SubscriptionPlan)
    @IsOptional()
    plan: SubscriptionPlan;

    @IsString()
    @IsOptional()
    trialEndsAt?: Date;                   // null = not on trial


    @IsString()
    @IsOptional()
    suspendedAt?: Date;

}