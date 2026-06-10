import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1781007481519 implements MigrationInterface {
    name = 'Init1781007481519'

  async up(queryRunner: QueryRunner): Promise<void> {

    // 1. Create tenants table
    await queryRunner.query(`
      CREATE TYPE tenant_status_enum AS ENUM ('active','trial','suspended','inactive');
      CREATE TYPE subscription_plan_enum AS ENUM ('free','starter','pro','enterprise');

      CREATE TABLE tenants (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name            VARCHAR(150) NOT NULL,
        subdomain       VARCHAR(100) NOT NULL UNIQUE,
        country         VARCHAR(100),
        timezone        VARCHAR(100),
        logo_url        VARCHAR(500),
        phone           VARCHAR(20),
        admin_email     VARCHAR(255),
        status          tenant_status_enum NOT NULL DEFAULT 'trial',
        plan            subscription_plan_enum NOT NULL DEFAULT 'free',
        trial_ends_at   TIMESTAMPTZ,
        suspended_at    TIMESTAMPTZ,
        internal_notes  TEXT,
        feature_flags   JSONB NOT NULL DEFAULT '{}',
        "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt"     TIMESTAMPTZ
      );
    `);

    // 2. Add tenant_id to users
    await queryRunner.query(`
      ALTER TABLE users
        ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      CREATE INDEX idx_users_tenant_id ON users(tenant_id);
    `);
    await queryRunner.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS "UQ_users_email";
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_users_email_tenant
        ON users(tenant_id, email) WHERE "deletedAt" IS NULL;
    `);

    // 3. Add tenant_id to trainers
    await queryRunner.query(`
      ALTER TABLE trainers
        ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      CREATE INDEX idx_trainers_tenant_id ON trainers(tenant_id);
    `);
    await queryRunner.query(`
      ALTER TABLE trainers DROP CONSTRAINT IF EXISTS "UQ_trainers_email";
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_trainers_email_tenant
        ON trainers(tenant_id, email) WHERE "deletedAt" IS NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_trainers_email_tenant;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_trainers_tenant_id;`);
    await queryRunner.query(`ALTER TABLE trainers DROP COLUMN IF EXISTS tenant_id;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email_tenant;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_tenant_id;`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS tenant_id;`);

    await queryRunner.query(`DROP TABLE IF EXISTS tenants;`);
    await queryRunner.query(`DROP TYPE IF EXISTS subscription_plan_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS tenant_status_enum;`);
  }
}