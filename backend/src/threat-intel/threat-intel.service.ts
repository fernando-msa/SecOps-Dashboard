import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface ThreatResult {
  indicator: string;
  type: "ip" | "domain" | "url" | "hash";
  malicious: boolean;
  score: number;
  source: string;
  details: Record<string, any>;
  queriedAt: Date;
}

@Injectable()
export class ThreatIntelService {
  private readonly logger = new Logger(ThreatIntelService.name);

  constructor(private config: ConfigService) {}

  async lookupIP(ip: string): Promise<ThreatResult[]> {
    const results: ThreatResult[] = [];

    const vtResult = await this.virusTotalIP(ip);
    if (vtResult) results.push(vtResult);

    const abuseResult = await this.abuseIPDB(ip);
    if (abuseResult) results.push(abuseResult);

    return results;
  }

  async lookupDomain(domain: string): Promise<ThreatResult[]> {
    const results: ThreatResult[] = [];

    const vtResult = await this.virusTotalDomain(domain);
    if (vtResult) results.push(vtResult);

    return results;
  }

  async lookupHash(hash: string): Promise<ThreatResult[]> {
    const results: ThreatResult[] = [];

    const vtResult = await this.virusTotalHash(hash);
    if (vtResult) results.push(vtResult);

    return results;
  }

  async enrichEvent(eventData: {
    source?: string;
    description?: string;
    title?: string;
  }): Promise<ThreatResult[]> {
    const results: ThreatResult[] = [];
    const text = `${eventData.source || ""} ${eventData.description || ""} ${eventData.title || ""}`;

    const ips = text.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) || [];
    const domains =
      text.match(/\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g) || [];
    const hashes = text.match(/\b[a-fA-F0-9]{32,64}\b/g) || [];

    for (const ip of [...new Set(ips)].slice(0, 3)) {
      const ipResults = await this.lookupIP(ip);
      results.push(...ipResults);
    }

    for (const domain of [...new Set(domains)].slice(0, 3)) {
      if (
        !domain.match(
          /^(localhost|example\.com|secops|internal|local)$/
        )
      ) {
        const domainResults = await this.lookupDomain(domain);
        results.push(...domainResults);
      }
    }

    for (const hash of [...new Set(hashes)].slice(0, 3)) {
      const hashResults = await this.lookupHash(hash);
      results.push(...hashResults);
    }

    return results;
  }

  private async virusTotalIP(ip: string): Promise<ThreatResult | null> {
    const apiKey = this.config.get("VIRUSTOTAL_API_KEY");
    if (!apiKey) return null;

    try {
      const res = await fetch(
        `https://www.virustotal.com/api/v3/ip_addresses/${ip}`,
        { headers: { "x-apikey": apiKey } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const stats = data.data?.attributes?.last_analysis_stats;
      const malicious = stats?.malicious || 0;
      const total =
        (stats?.malicious || 0) +
        (stats?.harmless || 0) +
        (stats?.undetected || 0);

      return {
        indicator: ip,
        type: "ip",
        malicious: malicious > 0,
        score: total > 0 ? Math.round((malicious / total) * 100) : 0,
        source: "VirusTotal",
        details: {
          country: data.data?.attributes?.country,
          asOwner: data.data?.attributes?.as_owner,
          lastAnalysisStats: stats,
        },
        queriedAt: new Date(),
      };
    } catch (err) {
      this.logger.warn(`VirusTotal IP lookup failed: ${err.message}`);
      return null;
    }
  }

  private async virusTotalDomain(
    domain: string
  ): Promise<ThreatResult | null> {
    const apiKey = this.config.get("VIRUSTOTAL_API_KEY");
    if (!apiKey) return null;

    try {
      const res = await fetch(
        `https://www.virustotal.com/api/v3/domains/${domain}`,
        { headers: { "x-apikey": apiKey } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const stats = data.data?.attributes?.last_analysis_stats;
      const malicious = stats?.malicious || 0;
      const total =
        (stats?.malicious || 0) +
        (stats?.harmless || 0) +
        (stats?.undetected || 0);

      return {
        indicator: domain,
        type: "domain",
        malicious: malicious > 0,
        score: total > 0 ? Math.round((malicious / total) * 100) : 0,
        source: "VirusTotal",
        details: { lastAnalysisStats: stats },
        queriedAt: new Date(),
      };
    } catch (err) {
      this.logger.warn(`VirusTotal domain lookup failed: ${err.message}`);
      return null;
    }
  }

  private async virusTotalHash(hash: string): Promise<ThreatResult | null> {
    const apiKey = this.config.get("VIRUSTOTAL_API_KEY");
    if (!apiKey) return null;

    try {
      const res = await fetch(
        `https://www.virustotal.com/api/v3/files/${hash}`,
        { headers: { "x-apikey": apiKey } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const stats = data.data?.attributes?.last_analysis_stats;
      const malicious = stats?.malicious || 0;
      const total =
        (stats?.malicious || 0) +
        (stats?.harmless || 0) +
        (stats?.undetected || 0);

      return {
        indicator: hash,
        type: "hash",
        malicious: malicious > 0,
        score: total > 0 ? Math.round((malicious / total) * 100) : 0,
        source: "VirusTotal",
        details: {
          name: data.data?.attributes?.meaningful_name,
          type: data.data?.attributes?.type_description,
          size: data.data?.attributes?.size,
          lastAnalysisStats: stats,
        },
        queriedAt: new Date(),
      };
    } catch (err) {
      this.logger.warn(`VirusTotal hash lookup failed: ${err.message}`);
      return null;
    }
  }

  private async abuseIPDB(ip: string): Promise<ThreatResult | null> {
    const apiKey = this.config.get("ABUSEIPDB_API_KEY");
    if (!apiKey) return null;

    try {
      const res = await fetch(
        `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`,
        { headers: { Key: apiKey, Accept: "application/json" } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const d = data.data;

      return {
        indicator: ip,
        type: "ip",
        malicious: d.abuseConfidenceScore > 50,
        score: d.abuseConfidenceScore,
        source: "AbuseIPDB",
        details: {
          country: d.countryCode,
          isp: d.isp,
          domain: d.domain,
          totalReports: d.totalReports,
          abuseConfidenceScore: d.abuseConfidenceScore,
          isWhitelisted: d.isWhitelisted,
        },
        queriedAt: new Date(),
      };
    } catch (err) {
      this.logger.warn(`AbuseIPDB lookup failed: ${err.message}`);
      return null;
    }
  }

  getConfigStatus() {
    return {
      virustotal: !!this.config.get("VIRUSTOTAL_API_KEY"),
      abuseipdb: !!this.config.get("ABUSEIPDB_API_KEY"),
    };
  }
}
