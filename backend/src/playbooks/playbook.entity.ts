import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tenant } from "../tenants/tenant.entity";

@Entity("playbooks")
export class Playbook {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: "jsonb", default: "[]" })
  steps: PlaybookStep[];

  @Column({ nullable: true })
  triggerCondition: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;
}

export interface PlaybookStep {
  order: number;
  title: string;
  description: string;
  type: "manual" | "automated" | "approval";
  command?: string;
}
