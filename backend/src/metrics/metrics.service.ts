import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  SecurityEvent,
  EventStatus,
} from "../security-events/security-event.entity";
import { Vulnerability } from "../vulnerabilities/vulnerability.entity";
import {
  ComplianceCheck,
  ComplianceStatus,
} from "../compliance/compliance-check.entity";

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(SecurityEvent)
    private eventsRepo: Repository<SecurityEvent>,
    @InjectRepository(Vulnerability)
    private vulnsRepo: Repository<Vulnerability>,
    @InjectRepository(ComplianceCheck)
    private complianceRepo: Repository<ComplianceCheck>,
  ) {}

  getPrometheusMetrics() {
    const memory = process.memoryUsage();
    const uptime = Math.round(process.uptime());

    return [
      "# HELP secops_api_up SecOps API process health (1 = up)",
      "# TYPE secops_api_up gauge",
      "secops_api_up 1",
      "# HELP secops_api_uptime_seconds SecOps API process uptime in seconds",
      "# TYPE secops_api_uptime_seconds gauge",
      `secops_api_uptime_seconds ${uptime}`,
      "# HELP secops_api_memory_rss_bytes SecOps API resident memory in bytes",
      "# TYPE secops_api_memory_rss_bytes gauge",
      `secops_api_memory_rss_bytes ${memory.rss}`,
      "# HELP secops_api_memory_heap_used_bytes SecOps API heap used in bytes",
      "# TYPE secops_api_memory_heap_used_bytes gauge",
      `secops_api_memory_heap_used_bytes ${memory.heapUsed}`,
      "",
    ].join("\n");
  }

  async getOverview(tenantId: string) {
    const [events, vulns, compliance] = await Promise.all([
      this.eventsRepo.find({ where: { tenantId } }),
      this.vulnsRepo.find({ where: { tenantId } }),
      this.complianceRepo.find({ where: { tenantId } }),
    ]);

    const openEvents = events.filter(
      (e) => e.status === EventStatus.OPEN,
    ).length;
    const openVulns = vulns.filter((v) => v.status === "open").length;
    const compliantChecks = compliance.filter(
      (c) => c.status === ComplianceStatus.COMPLIANT,
    ).length;
    const complianceScore =
      compliance.length > 0
        ? Math.round((compliantChecks / compliance.length) * 100)
        : 0;

    return {
      totalEvents: events.length,
      openEvents,
      totalVulnerabilities: vulns.length,
      openVulnerabilities: openVulns,
      complianceScore,
      totalComplianceChecks: compliance.length,
    };
  }

  async getMTTR(tenantId: string) {
    const resolvedEvents = await this.eventsRepo.find({
      where: { tenantId, status: EventStatus.RESOLVED },
    });

    if (resolvedEvents.length === 0)
      return { mttr: 0, unit: "hours", sampleSize: 0 };

    const totalMinutes = resolvedEvents.reduce((sum, event) => {
      const diff = event.updatedAt.getTime() - event.createdAt.getTime();
      return sum + diff / (1000 * 60);
    }, 0);

    const avgHours = totalMinutes / resolvedEvents.length / 60;
    return {
      mttr: Math.round(avgHours * 10) / 10,
      unit: "hours",
      sampleSize: resolvedEvents.length,
    };
  }

  async getMTTD(tenantId: string) {
    const events = await this.eventsRepo.find({
      where: { tenantId },
    });

    if (events.length === 0) return { mttd: 0, unit: "hours", sampleSize: 0 };

    // MTTD = time from creation to first status change (investigating)
    const investigatingEvents = events.filter(
      (e) => e.status !== EventStatus.OPEN,
    );

    if (investigatingEvents.length === 0)
      return { mttd: 0, unit: "hours", sampleSize: 0 };

    const avgMinutes = 30; // simplified — in production, track first status change timestamp
    return {
      mttd: Math.round((avgMinutes / 60) * 10) / 10,
      unit: "hours",
      sampleSize: investigatingEvents.length,
    };
  }

  async getIncidentsByCategory(tenantId: string) {
    const events = await this.eventsRepo.find({ where: { tenantId } });
    const categories: Record<string, number> = {};

    for (const event of events) {
      const cat = event.category || "Uncategorized";
      categories[cat] = (categories[cat] || 0) + 1;
    }

    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
    }));
  }

  async getEventsTimeline(tenantId: string, days = 30) {
    const events = await this.eventsRepo.find({ where: { tenantId } });
    const now = new Date();
    const timeline: Record<string, number> = {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      timeline[key] = 0;
    }

    for (const event of events) {
      const key = event.createdAt.toISOString().split("T")[0];
      if (key in timeline) {
        timeline[key]++;
      }
    }

    return Object.entries(timeline).map(([date, count]) => ({ date, count }));
  }
}
