import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSecOpsSchema1717603200000 implements MigrationInterface {
  name = "InitialSecOpsSchema1717603200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE compliance_checks_framework_enum AS ENUM ('ISO27001', 'LGPD', 'NIST');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE compliance_checks_status_enum AS ENUM ('compliant', 'non_compliant', 'partial', 'not_applicable');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar NOT NULL,
        domain varchar,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        email varchar NOT NULL UNIQUE,
        password varchar NOT NULL,
        name varchar NOT NULL,
        role varchar NOT NULL DEFAULT 'analyst',
        "isActive" boolean NOT NULL DEFAULT true,
        "tenantId" uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS compliance_checks (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        framework compliance_checks_framework_enum NOT NULL,
        "controlId" varchar NOT NULL,
        title varchar NOT NULL,
        description text,
        status compliance_checks_status_enum NOT NULL DEFAULT 'non_compliant',
        evidence text,
        "tenantId" uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "lastReviewedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_iso27001_non_compliant_evidence
          CHECK (framework <> 'ISO27001' OR status <> 'non_compliant' OR nullif(btrim(coalesce(evidence, '')), '') IS NOT NULL)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_compliance_checks_tenant_framework
      ON compliance_checks ("tenantId", framework)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_compliance_checks_tenant_framework`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS compliance_checks`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TABLE IF EXISTS tenants`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS compliance_checks_status_enum`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS compliance_checks_framework_enum`,
    );
  }
}
