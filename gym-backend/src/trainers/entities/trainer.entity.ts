import { TenantBaseEntity } from "../../tenant/entities/tenant-base.entity";
import { UserStatus } from "../../users/entities/user.entity";
import { Column, Entity, Index } from "typeorm";

export enum SalaryType {
    MONTHLY = 'monthly',
    PER_SESSION = 'per_session',
    COMMISSION = 'commission',
    HYBRID = 'hybrid'
}

export interface TrainerShift { startTime: string; endTime: string; }
export interface TrainerAvailability {
    day: string;
    active: boolean;
    shifts: TrainerShift[];
}

@Entity('trainers')
export class Trainer extends TenantBaseEntity {
    @Column({ length: 100 })
    firstName: string;

    @Column({ length: 100 })
    lastName: string;

    @Column({ length: 255 })
    email: string;

    @Column({ length: 20, nullable: true })
    phone?: string;

    @Column({ nullable: true, length: 100 })
    nationality?: string;

    @Column({ nullable: true, length: 100 })
    nationalId?: string;

    @Column({ nullable: true, length: 255 })
    bio?: string;

    @Column({ nullable: true, length: 500 })
    avatar?: string;

    @Column({ nullable: true, type: 'date' })
    dateOfBirth?: string;

    @Column({ nullable: true, length: 100 })
    gender?: string;

    @Column({ nullable: true, length: 100 })
    educationLevel?: string;

    @Column({ nullable: true, length: 100 })
    fieldOfStudy?: string;

    @Column({ nullable: true, type: 'int' })
    yearsExperience?: number;

    @Column({ nullable: true, length: 100 })
    certifications?: string;


    @Column({ nullable: true, type: 'simple-array' })
    specializations?: string[];

    @Column({ nullable: true, type: 'simple-array' })
    languages?: string[];

    @Column({ nullable: true, type: 'jsonb' })
    availability?: TrainerAvailability[];

    @Column({ nullable: true, type: 'int' })
    sessionDurationMinutes?: number;

    @Column({ nullable: true, type: 'int' })
    maxClientsPerDay?: number;

    @Column({ nullable: true, type: 'date' })
    contractStart?: string;

    @Column({ nullable: true, type: 'date' })
    contractEnd?: string;

    @Column({ nullable: true, type: 'enum', enum: SalaryType })
    salaryType?: SalaryType;

    @Column({ nullable: true, type: 'decimal' })
    monthlySalary?: number;

    @Column({ nullable: true, type: 'decimal' })
    sessionRate?: number;

    @Column({ nullable: true, type: 'decimal' })
    commissionPercent?: number;

    @Column({ nullable: true, length: 100 })
    instagram?: string;

    @Column({ nullable: true, length: 100 })
    tiktok?: string;

    @Column({ nullable: true, type: 'int' })
    initialRating?: number;


    @Column({ nullable: true, type: 'int' })
    targetMonthlySessions?: number;

    @Column({ nullable: true, length: 100 })
    adminNotes?: string;

    @Column({ nullable: true, type: 'enum', enum: UserStatus })
    status?: UserStatus;

}