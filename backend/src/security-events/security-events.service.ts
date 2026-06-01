import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SecurityEvent, EventSeverity, EventStatus } from "./security-event.entity";

@Injectable()
export class SecurityEventsService {
  constructor(
    @InjectRepository(SecurityEvent)
    private eventsRepo: Repository<SecurityEvent>
  ) {}

  async create(data: Partial<SecurityEvent>): Promise<SecurityEvent> {
    const event = this.eventsRepo.create(data);
    return this.eventsRepo.save(event);
  }

  async findAll(tenantId: string, filters?: { severity?: EventSeverity; status?: EventStatus }) {
    const where: any = { tenantId };
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.status) where.status = filters.status;
    return this.eventsRepo.find({ where, order: { createdAt: "DESC" } });
  }

  async findOne(id: string, tenantId: string) {
    return this.eventsRepo.findOne({ where: { id, tenantId } });
  }

  async update(id: string, tenantId: string, data: Partial<SecurityEvent>) {
    await this.eventsRepo.update({ id, tenantId }, data);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    await this.eventsRepo.delete({ id, tenantId });
    return { deleted: true };
  }

  async getStats(tenantId: string) {
    const events = await this.eventsRepo.find({ where: { tenantId } });
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    const byStatus = { open: 0, investigating: 0, resolved: 0, closed: 0 };

    for (const event of events) {
      bySeverity[event.severity]++;
      byStatus[event.status]++;
    }

    return { total: events.length, bySeverity, byStatus };
  }

  async getRecentAlerts(tenantId: string, limit = 10) {
    return this.eventsRepo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }
}
