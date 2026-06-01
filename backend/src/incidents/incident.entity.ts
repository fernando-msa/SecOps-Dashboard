import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tenant } from "../tenants/tenant.entity";

export enum IncidentSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum IncidentStatus {
  NEW = "new",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  ESCALATED = "escalated",
  CONTAINED = "contained",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

@Entity("incidents")
export class Incident {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "enum", enum: IncidentSeverity, default: IncidentSeverity.MEDIUM })
  severity: IncidentSeverity;

  @Column({ type: "enum", enum: IncidentStatus, default: IncidentStatus.NEW })
  status: IncidentStatus;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true })
  escalatedTo: string;

  @Column({ type: "text", nullable: true })
  resolution: string;

  @Column({ nullable: true })
  relatedEventId: string;

  @Column({ nullable: true })
  relatedVulnId: string;

  @Column({ type: "jsonb", default: "[]" })
  timeline: TimelineEntry[];

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export interface TimelineEntry {
  timestamp: string;
  action: string;
  user: string;
  details: string;
}
