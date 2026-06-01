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

export enum AssetType {
  SERVER = "server",
  WORKSTATION = "workstation",
  NETWORK = "network",
  APPLICATION = "application",
  DATABASE = "database",
  CLOUD = "cloud",
  OTHER = "other",
}

export enum AssetCriticality {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

@Entity("assets")
export class Asset {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "enum", enum: AssetType, default: AssetType.OTHER })
  type: AssetType;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  hostname: string;

  @Column({ nullable: true })
  operatingSystem: string;

  @Column({ nullable: true })
  owner: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: "enum", enum: AssetCriticality, default: AssetCriticality.MEDIUM })
  criticality: AssetCriticality;

  @Column({ default: "active" })
  status: string;

  @Column({ type: "simple-json", nullable: true })
  tags: string[];

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
