import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";
import { Tenant } from "../tenants/tenant.entity";

export enum ComplianceFramework {
  ISO27001 = "ISO27001",
  LGPD = "LGPD",
  NIST = "NIST",
}

export enum ComplianceStatus {
  COMPLIANT = "compliant",
  NON_COMPLIANT = "non_compliant",
  PARTIAL = "partial",
  NOT_APPLICABLE = "not_applicable",
}

@Entity("compliance_checks")
export class ComplianceCheck {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: ComplianceFramework })
  framework: ComplianceFramework;

  @Column()
  controlId: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "enum", enum: ComplianceStatus, default: ComplianceStatus.NON_COMPLIANT })
  status: ComplianceStatus;

  @Column({ type: "text", nullable: true })
  evidence: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @UpdateDateColumn()
  lastReviewedAt: Date;
}
