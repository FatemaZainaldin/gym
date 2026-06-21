import { IsArray, IsBoolean, IsDate, IsDateString, IsEmail, IsEnum, IsJSON, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator"
import { SubscriptionPlan, TenantStatus } from "../entities/tenant.entity";

export class CreateTenantDTO {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    subdomain: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @IsNotEmpty()
    timezone?: string;


    @IsString()
    @IsOptional()
    logoUrl?: string;


    @IsString()
    @IsNotEmpty()
    phone?: string;


    @IsString()
    @IsNotEmpty()
    adminEmail?: string;


    @IsEnum(TenantStatus)
    @IsOptional()
    status: TenantStatus;

    @IsEnum(SubscriptionPlan)
    @IsOptional()
    plan: SubscriptionPlan;

    @IsDateString()
    @IsOptional()
    trialEndsAt?: Date;                   // null = not on trial


    @IsString()
    @IsOptional()
    internalNotes?: string;              // SA-only notes about this gym

    // Feature flags — driven by plan, overridable per tenant
    @IsObject()
    @IsOptional()
    featureFlags: Record<string, boolean>; // { ai_insights: true, qr_checkin: false }

}