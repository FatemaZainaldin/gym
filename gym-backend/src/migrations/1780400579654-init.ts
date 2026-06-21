import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1780400579654 implements MigrationInterface {
    name = 'Init1780400579654'

     async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE nav_items ADD COLUMN "titleAr" VARCHAR(255) NULL;
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE nav_items DROP COLUMN "titleAr";
        `);
    }
}