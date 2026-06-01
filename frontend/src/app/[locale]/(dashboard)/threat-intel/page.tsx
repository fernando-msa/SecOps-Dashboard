"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, Shield, AlertTriangle, CheckCircle, Globe } from "lucide-react";

interface ThreatResult {
  indicator: string;
  type: string;
  malicious: boolean;
  score: number;
  source: string;
  details: Record<string, any>;
  queriedAt: string;
}

export default function ThreatIntelPage() {
  const t = useTranslations("threatIntel");
  const [query, setQuery] = useState("");
  const [queryType, setQueryType] = useState<"ip" | "domain" | "hash">("ip");
  const [results, setResults] = useState<ThreatResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const handleLookup = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await api.get(`/threat-intel/lookup/${queryType}`, {
        params: { [queryType]: query },
      });
      setResults(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkConfig = async () => {
    try {
      const res = await api.get("/threat-intel/config");
      setConfig(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      {/* Config Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {t("apiStatus")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={config?.virustotal ? "success" : "default"}>
              VirusTotal: {config?.virustotal ? t("configured") : t("notConfigured")}
            </Badge>
            <Badge variant={config?.abuseipdb ? "success" : "default"}>
              AbuseIPDB: {config?.abuseipdb ? t("configured") : t("notConfigured")}
            </Badge>
            <Button size="sm" variant="secondary" onClick={checkConfig}>
              {t("checkConfig")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Lookup Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("lookup")}</CardTitle>
        </CardHeader>
        <div className="flex gap-3">
          <select
            value={queryType}
            onChange={(e) => setQueryType(e.target.value as any)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="ip">IP Address</option>
            <option value="domain">Domain</option>
            <option value="hash">File Hash</option>
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              queryType === "ip"
                ? "8.8.8.8"
                : queryType === "domain"
                  ? "example.com"
                  : "SHA256 hash"
            }
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          />
          <Button onClick={handleLookup} disabled={loading || !query.trim()}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? t("searching") : t("search")}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("results")} ({results.length})
          </h2>
          {results.map((result, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {result.malicious ? (
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{result.source}</p>
                    <p className="text-sm text-gray-500">
                      {result.indicator} ({result.type})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-2xl font-bold ${
                      result.score >= 70
                        ? "text-red-600"
                        : result.score >= 30
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {result.score}%
                  </p>
                  <Badge variant={result.malicious ? "critical" : "success"}>
                    {result.malicious ? t("malicious") : t("clean")}
                  </Badge>
                </div>
              </div>
              {Object.keys(result.details).length > 0 && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <Card>
          <p className="py-4 text-center text-gray-500">{t("noResults")}</p>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("setup")}</CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm text-gray-600">
          <p>{t("setupDesc")}</p>
          <div className="rounded-lg bg-gray-900 p-4">
            <pre className="text-xs text-green-400">{`# backend/.env
VIRUSTOTAL_API_KEY=your_virustotal_api_key
ABUSEIPDB_API_KEY=your_abuseipdb_api_key`}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
