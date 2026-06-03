import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1780400579654 implements MigrationInterface {
    name = 'Init1780400579654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."trainers_salarytype_enum" AS ENUM('monthly', 'per_session', 'commission', 'hybrid')`);
        await queryRunner.query(`CREATE TYPE "public"."trainers_status_enum" AS ENUM('active', 'inactive', 'suspended', 'on_leave')`);
        await queryRunner.query(`CREATE TABLE "trainers" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deletedAt" TIMESTAMP WITH TIME ZONE,
            "firstName" character varying(100) NOT NULL,
            "lastName" character varying(100) NOT NULL,
            "email" character varying(255) NOT NULL,
            "phone" character varying(20),
            "nationality" character varying(100),
            "nationalId" character varying(100),
            "bio" character varying(255),
            "avatar" character varying(500),
            "dateOfBirth" date,
            "gender" character varying(100),
            "educationLevel" character varying(100),
            "fieldOfStudy" character varying(100),
            "yearsExperience" integer,
            "certifications" character varying(100),
            "specializations" text,
            "languages" text,
            "availability" jsonb,
            "sessionDurationMinutes" integer,
            "maxClientsPerDay" integer,
            "contractStart" date,
            "contractEnd" date,
            "salaryType" "public"."trainers_salarytype_enum",
            "monthlySalary" numeric,
            "sessionRate" numeric,
            "commissionPercent" numeric,
            "instagram" character varying(100),
            "tiktok" character varying(100),
            "initialRating" integer,
            "targetMonthlySessions" integer,
            "adminNotes" character varying(100),
            "status" "public"."trainers_status_enum",
            CONSTRAINT "PK_trainers" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_trainers_email" ON "trainers" ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_trainers_email"`);
        await queryRunner.query(`DROP TABLE "trainers"`);
        await queryRunner.query(`DROP TYPE "public"."trainers_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."trainers_salarytype_enum"`);
    }
}