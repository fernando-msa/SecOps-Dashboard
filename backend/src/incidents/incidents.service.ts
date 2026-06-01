import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Incident, IncidentStatus, TimelineEntry } from "./incident.entity";

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private incidentsRepo: Repository<Incident>
  ) {}

  async create(data: Partial<Incident>, userId: string): Promise<Incident> {
    const timeline: TimelineEntry[] = [
      {
        timestamp: new Date().toISOString(),
        action: "created",
        user: userId,
        details: "Incident created",
      },
    ];
    const incident = this.incidentsRepo.create({ ...data, timeline });
    return this.incidentsRepo.save(incident);
  }

  async findAll(tenantId: string, filters?: { status?: IncidentStatus; severity?: string }) {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.severity) where.severity = filters.severity;
    return this.incidentsRepo.find({ where, order: { createdAt: "DESC" } });
  }

  async findOne(id: string, tenantId: string) {
    return this.incidentsRepo.findOne({ where: { id, tenantId } });
  }

  async update(id: string, tenantId: string, data: Partial<Incident>, userId: string) {
    const incident = await this.findOne(id, tenantId);
    if (!incident) throw new NotFoundException("Incident not found");

    const changes: string[] = [];
    if (data.status && data.status !== incident.status) changes.push(`status: ${incident.status} -> ${data.status}`);
    if (data.assignedTo && data.assignedTo !== incident.assignedTo) changes.push(`assigned to: ${data.assignedTo}`);
    if (data.severity && data.severity !== incident.severity) changes.push(`severity: ${data.severity}`);

    if (changes.length > 0) {
      incident.timeline = [
        ...incident.timeline,
        {
          timestamp: new Date().toISOString(),
          action: "updated",
          user: userId,
          details: changes.join(", "),
        },
      ];
    }

    Object.assign(incident, data);
    return this.incidentsRepo.save(incident);
  }

  async assign(id: string, tenantId: string, assignTo: string, userId: string) {
    return this.update(id, tenantId, { assignedTo: assignTo, status: IncidentStatus.ASSIGNED }, userId);
  }

  async escalate(id: string, tenantId: string, escalateTo: string, reason: string, userId: string) {
    const incident = await this.findOne(id, tenantId);
    if (!incident) throw new NotFoundException("Incident not found");

    incident.escalatedTo = escalateTo;
    incident.status = IncidentStatus.ESCALATED;
    incident.timeline = [
      ...incident.timeline,
      {
        timestamp: new Date().toISOString(),
        action: "escalated",
        user: userId,
        details: `Escalated to ${escalateTo}. Reason: ${reason}`,
      },
    ];

    return this.incidentsRepo.save(incident);
  }

  async resolve(id: string, tenantId: string, resolution: string, userId: string) {
    return this.update(
      id,
      tenantId,
      { resolution, status: IncidentStatus.RESOLVED },
      userId
    );
  }

  async close(id: string, tenantId: string, userId: string) {
    return this.update(id, tenantId, { status: IncidentStatus.CLOSED }, userId);
  }

  async addNote(id: string, tenantId: string, note: string, userId: string) {
    const incident = await this.findOne(id, tenantId);
    if (!incident) throw new NotFoundException("Incident not found");

    incident.timeline = [
      ...incident.timeline,
      {
        timestamp: new Date().toISOString(),
        action: "note",
        user: userId,
        details: note,
      },
    ];

    return this.incidentsRepo.save(incident);
  }

  async getStats(tenantId: string) {
    const incidents = await this.incidentsRepo.find({ where: { tenantId } });
    const byStatus: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const inc of incidents) {
      byStatus[inc.status] = (byStatus[inc.status] || 0) + 1;
      bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1;
    }

    return { total: incidents.length, byStatus, bySeverity };
  }
}
