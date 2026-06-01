import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  SecurityEvent,
  EventSeverity,
  EventStatus,
} from "../security-events/security-event.entity";

export interface RawLog {
  source: string;
  format: "syslog" | "cef" | "json" | "raw";
  message: string;
  timestamp?: string;
}

export interface ParsedEvent {
  title: string;
  description: string;
  severity: EventSeverity;
  source: string;
  category: string;
  rawLog: string;
}

@Injectable()
export class SiemService {
  private readonly logger = new Logger(SiemService.name);

  constructor(
    @InjectRepository(SecurityEvent)
    private eventsRepo: Repository<SecurityEvent>
  ) {}

  async ingestLogs(logs: RawLog[], tenantId: string) {
    const results = { processed: 0, failed: 0, events: [] as SecurityEvent[] };

    for (const log of logs) {
      try {
        const parsed = this.parseLog(log);
        const event = this.eventsRepo.create({
          title: parsed.title,
          description: `${parsed.description}\n\n--- Raw Log ---\n${log.message}`,
          severity: parsed.severity,
          source: parsed.source || log.source,
          category: parsed.category,
          status: EventStatus.OPEN,
          tenantId,
        });
        const saved = await this.eventsRepo.save(event);
        results.events.push(saved);
        results.processed++;
      } catch (err) {
        this.logger.warn(`Failed to parse log: ${err.message}`);
        results.failed++;
      }
    }

    this.logger.log(
      `Ingested ${results.processed}/${logs.length} logs for tenant ${tenantId}`
    );
    return results;
  }

  parseLog(log: RawLog): ParsedEvent {
    switch (log.format) {
      case "cef":
        return this.parseCEF(log.message, log.source);
      case "syslog":
        return this.parseSyslog(log.message, log.source);
      case "json":
        return this.parseJSON(log.message, log.source);
      default:
        return this.parseRaw(log.message, log.source);
    }
  }

  private parseCEF(message: string, source: string): ParsedEvent {
    // CEF:0|Vendor|Product|Version|SignatureID|Name|Severity|Extension
    const parts = message.split("|");
    if (parts.length < 8) {
      throw new Error("Invalid CEF format");
    }

    const name = parts[5] || "CEF Event";
    const severityNum = parseInt(parts[6] || "5", 10);
    const extension = parts.slice(7).join("|");

    const severity =
      severityNum >= 9
        ? EventSeverity.CRITICAL
        : severityNum >= 7
          ? EventSeverity.HIGH
          : severityNum >= 4
            ? EventSeverity.MEDIUM
            : EventSeverity.LOW;

    const extPairs = this.parseCEFExtension(extension);
    const src = extPairs["sourceHostName"] || extPairs["src"] || source;
    const cat = extPairs["deviceEventCategory"] || extPairs["cat"] || "CEF";

    return {
      title: name,
      description: `CEF Event from ${src}. ${extPairs["msg"] || ""}`.trim(),
      severity,
      source: src,
      category: cat,
      rawLog: message,
    };
  }

  private parseCEFExtension(ext: string): Record<string, string> {
    const result: Record<string, string> = {};
    const pairs = ext.split(" ");
    for (const pair of pairs) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx > 0) {
        const key = pair.substring(0, eqIdx);
        const val = pair.substring(eqIdx + 1).replace(/\\=/g, "=").replace(/\\\\/g, "\\");
        result[key] = val;
      }
    }
    return result;
  }

  private parseSyslog(message: string, source: string): ParsedEvent {
    // RFC 3164: <priority>timestamp hostname tag: message
    const syslogRegex =
      /^<(\d+)>(\w{3}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(\S+?)(?:\[\d+\])?\s*:\s*(.+)$/s;
    const match = message.match(syslogRegex);

    if (match) {
      const priority = parseInt(match[1], 10);
      const facility = Math.floor(priority / 8);
      const severityCode = priority % 8;
      const hostname = match[3];
      const tag = match[4];
      const body = match[5];

      const severity =
        severityCode <= 1
          ? EventSeverity.CRITICAL
          : severityCode <= 3
            ? EventSeverity.HIGH
            : severityCode <= 5
              ? EventSeverity.MEDIUM
              : EventSeverity.LOW;

      const category = this.syslogFacilityToCategory(facility);

      return {
        title: `${tag}: ${body.substring(0, 100)}`,
        description: body,
        severity,
        source: hostname || source,
        category,
        rawLog: message,
      };
    }

    return this.parseRaw(message, source);
  }

  private syslogFacilityToCategory(facility: number): string {
    const map: Record<number, string> = {
      0: "Kernel",
      1: "User",
      2: "Mail",
      3: "System",
      4: "Auth",
      5: "Syslog",
      6: "Printer",
      7: "Network",
      8: "UUCP",
      9: "Clock",
      10: "Auth",
      11: "FTP",
      12: "NTP",
      13: "Audit",
      14: "Alert",
      15: "Clock",
    };
    return map[facility] || "System";
  }

  private parseJSON(message: string, source: string): ParsedEvent {
    try {
      const data = JSON.parse(message);
      return {
        title: data.title || data.name || data.event || "JSON Event",
        description: data.description || data.message || JSON.stringify(data, null, 2),
        severity: this.mapSeverity(data.severity || data.level || "medium"),
        source: data.source || data.host || data.src || source,
        category: data.category || data.type || data.event_type || "JSON",
        rawLog: message,
      };
    } catch {
      throw new Error("Invalid JSON format");
    }
  }

  private parseRaw(message: string, source: string): ParsedEvent {
    return {
      title: message.substring(0, 100),
      description: message,
      severity: EventSeverity.MEDIUM,
      source,
      category: "Raw",
      rawLog: message,
    };
  }

  private mapSeverity(val: string): EventSeverity {
    const map: Record<string, EventSeverity> = {
      critical: EventSeverity.CRITICAL,
      high: EventSeverity.HIGH,
      medium: EventSeverity.MEDIUM,
      low: EventSeverity.LOW,
      info: EventSeverity.LOW,
      warning: EventSeverity.MEDIUM,
      error: EventSeverity.HIGH,
      fatal: EventSeverity.CRITICAL,
    };
    return map[val.toLowerCase()] || EventSeverity.MEDIUM;
  }

  async getIngestionStats(tenantId: string) {
    const events = await this.eventsRepo.find({ where: { tenantId } });
    const sources = new Set(events.map((e) => e.source).filter(Boolean));
    const categories = new Set(events.map((e) => e.category).filter(Boolean));

    return {
      totalIngested: events.length,
      uniqueSources: sources.size,
      uniqueCategories: categories.size,
      sources: Array.from(sources),
      categories: Array.from(categories),
      last24h: events.filter(
        (e) => Date.now() - new Date(e.createdAt).getTime() < 86400000
      ).length,
    };
  }
}
