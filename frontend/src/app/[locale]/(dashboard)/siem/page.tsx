"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Radio, Upload, Activity, Server } from "lucide-react";

interface IngestionStats {
  totalIngested: number;
  uniqueSources: number;
  uniqueCategories: number;
  sources: string[];
  categories: string[];
  last24h: number;
}

export default function SiemPage() {
  const t = useTranslations("siem");
  const [stats, setStats] = useState<IngestionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [logInput, setLogInput] = useState("");
  const [logFormat, setLogFormat] = useState<"syslog" | "cef" | "json" | "raw">("json");
  const [logSource, setLogSource] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api
      .get("/siem/stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleIngest = async () => {
    if (!logInput.trim()) return;
    setIngesting(true);
    setResult(null);
    try {
      const lines = logInput
        .split("\n")
        .filter((l) => l.trim());
      const logs = lines.map((line) => ({
        source: logSource || "manual",
        format: logFormat,
        message: line.trim(),
      }));
      const res = await api.post("/siem/ingest", { logs });
      setResult(res.data);
      setLogInput("");
      // Refresh stats
      const statsRes = await api.get("/siem/stats");
      setStats(statsRes.data);
    } catch (err: any) {
      setResult({ error: err.response?.data?.message || "Ingestion failed" });
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <Radio className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("totalIngested")}</p>
                <p className="text-2xl font-bold">{stats.totalIngested}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-3">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("last24h")}</p>
                <p className="text-2xl font-bold">{stats.last24h}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-3">
                <Server className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("sources")}</p>
                <p className="text-2xl font-bold">{stats.uniqueSources}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-3">
                <Upload className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("categories")}</p>
                <p className="text-2xl font-bold">{stats.uniqueCategories}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Ingestion Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("ingestLogs")}</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("format")}
              </label>
              <select
                value={logFormat}
                onChange={(e) => setLogFormat(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="json">JSON</option>
                <option value="syslog">Syslog (RFC 3164)</option>
                <option value="cef">CEF</option>
                <option value="raw">Raw</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("logSource")}
              </label>
              <input
                type="text"
                value={logSource}
                onChange={(e) => setLogSource(e.target.value)}
                placeholder="firewall, ids, waf..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleIngest} disabled={ingesting || !logInput.trim()}>
                {ingesting ? t("ingesting") : t("ingest")}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("logContent")}
            </label>
            <textarea
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              rows={8}
              placeholder={
                logFormat === "json"
                  ? '{"title":"SSH Brute Force","severity":"high","source":"firewall"}'
                  : logFormat === "cef"
                    ? "CEF:0|Vendor|Product|1.0|100|SSH Login|High|src=192.168.1.100"
                    : logFormat === "syslog"
                      ? "<13>Jun  1 12:00:00 server sshd[1234]: Failed password for root"
                      : "Paste your log lines here, one per line"
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          {result && (
            <div
              className={`rounded-lg p-4 text-sm ${
                result.error
                  ? "bg-red-50 text-red-800"
                  : "bg-emerald-50 text-emerald-800"
              }`}
            >
              {result.error ? (
                <p>{result.error}</p>
              ) : (
                <p>
                  {t("processed")}: {result.processed} | {t("failed")}: {result.failed}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Active Sources & Categories */}
      {stats && (stats.sources.length > 0 || stats.categories.length > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("activeSources")}</CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {stats.sources.map((src) => (
                <Badge key={src}>{src}</Badge>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("activeCategories")}</CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {stats.categories.map((cat) => (
                <Badge key={cat}>{cat}</Badge>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* API Reference */}
      <Card>
        <CardHeader>
          <CardTitle>{t("apiEndpoint")}</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div className="rounded-lg bg-gray-900 p-4">
            <p className="text-xs text-gray-400 mb-2">POST /api/siem/ingest</p>
            <pre className="text-xs text-green-400 overflow-x-auto">{`{
  "logs": [
    {
      "source": "firewall",
      "format": "json",
      "message": "{\\"title\\":\\"Blocked IP\\",\\"severity\\":\\"high\\"}"
    }
  ]
}`}</pre>
          </div>
          <p className="text-xs text-gray-500">
            {t("apiDescription")}
          </p>
        </div>
      </Card>
    </div>
  );
}
