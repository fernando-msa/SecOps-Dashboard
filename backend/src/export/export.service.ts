import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SecurityEvent } from "../security-events/security-event.entity";
import { Vulnerability } from "../vulnerabilities/vulnerability.entity";
import { Incident } from "../incidents/incident.entity";
import { Asset } from "../assets/asset.entity";
import { ComplianceCheck } from "../compliance/compliance-check.entity";

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(SecurityEvent) private eventsRepo: Repository<SecurityEvent>,
    @InjectRepository(Vulnerability) private vulnsRepo: Repository<Vulnerability>,
    @InjectRepository(Incident) private incidentsRepo: Repository<Incident>,
    @InjectRepository(Asset) private assetsRepo: Repository<Asset>,
    @InjectRepository(ComplianceCheck) private complianceRepo: Repository<ComplianceCheck>
  ) {}

  async exportEvents(tenantId: string): Promise<string> {
    const events = await this.eventsRepo.find({ where: { tenantId }, order: { createdAt: "DESC" } });
    return this.toCSV(events, ["id", "title", "severity", "status", "source", "category", "createdAt"]);
  }

  async exportVulnerabilities(tenantId: string): Promise<string> {
    const vulns = await this.vulnsRepo.find({ where: { tenantId }, order: { discoveredAt: "DESC" } });
    return this.toCSV(vulns, ["id", "title", "cveId", "severity", "cvssScore", "status", "affectedAsset", "discoveredAt"]);
  }

  async exportIncidents(tenantId: string): Promise<string> {
    const incidents = await this.incidentsRepo.find({ where: { tenantId }, order: { createdAt: "DESC" } });
    return this.toCSV(incidents, ["id", "title", "severity", "status", "category", "assignedTo", "createdAt"]);
  }

  async exportAssets(tenantId: string): Promise<string> {
    const assets = await this.assetsRepo.find({ where: { tenantId }, order: { createdAt: "DESC" } });
    return this.toCSV(assets, ["id", "name", "type", "ipAddress", "hostname", "criticality", "status", "owner"]);
  }

  async exportCompliance(tenantId: string): Promise<string> {
    const checks = await this.complianceRepo.find({ where: { tenantId }, order: { controlId: "ASC" } });
    return this.toCSV(checks, ["id", "framework", "controlId", "title", "status", "lastReviewedAt"]);
  }

  private toCSV(data: any[], columns: string[]): string {
    if (data.length === 0) return columns.join(",");

    const header = columns.join(",");
    const rows = data.map((row) =>
      columns
        .map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return "";
          const str = String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    );

    return [header, ...rows].join("\n");
  }
}
