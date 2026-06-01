import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Vulnerability, VulnSeverity, VulnStatus } from "./vulnerability.entity";

@Injectable()
export class VulnerabilitiesService {
  constructor(
    @InjectRepository(Vulnerability)
    private vulnsRepo: Repository<Vulnerability>
  ) {}

  async create(data: Partial<Vulnerability>): Promise<Vulnerability> {
    const vuln = this.vulnsRepo.create(data);
    return this.vulnsRepo.save(vuln);
  }

  async findAll(tenantId: string, filters?: { severity?: VulnSeverity; status?: VulnStatus }) {
    const where: any = { tenantId };
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.status) where.status = filters.status;
    return this.vulnsRepo.find({ where, order: { discoveredAt: "DESC" } });
  }

  async findOne(id: string, tenantId: string) {
    return this.vulnsRepo.findOne({ where: { id, tenantId } });
  }

  async update(id: string, tenantId: string, data: Partial<Vulnerability>) {
    await this.vulnsRepo.update({ id, tenantId }, data);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    await this.vulnsRepo.delete({ id, tenantId });
    return { deleted: true };
  }

  async getStats(tenantId: string) {
    const vulns = await this.vulnsRepo.find({ where: { tenantId } });
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    const byStatus = { open: 0, in_progress: 0, resolved: 0, accepted: 0 };

    for (const vuln of vulns) {
      bySeverity[vuln.severity]++;
      byStatus[vuln.status]++;
    }

    return { total: vulns.length, bySeverity, byStatus };
  }
}
