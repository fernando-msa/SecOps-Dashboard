import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "./audit.entity";

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>
  ) {}

  async log(data: {
    userId: string;
    userName: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: string;
    ipAddress?: string;
    tenantId: string;
  }): Promise<AuditLog> {
    const entry = this.auditRepo.create(data);
    return this.auditRepo.save(entry);
  }

  async findAll(tenantId: string, filters?: { userId?: string; action?: string; resource?: string }) {
    const where: any = { tenantId };
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.resource) where.resource = filters.resource;
    return this.auditRepo.find({ where, order: { createdAt: "DESC" }, take: 500 });
  }

  async getStats(tenantId: string) {
    const logs = await this.auditRepo.find({ where: { tenantId } });
    const byAction: Record<string, number> = {};
    const byResource: Record<string, number> = {};
    const byUser: Record<string, number> = {};

    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byResource[log.resource] = (byResource[log.resource] || 0) + 1;
      byUser[log.userName] = (byUser[log.userName] || 0) + 1;
    }

    return {
      total: logs.length,
      byAction,
      byResource,
      byUser,
      last24h: logs.filter(
        (l) => Date.now() - new Date(l.createdAt).getTime() < 86400000
      ).length,
    };
  }
}
