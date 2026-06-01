"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Filter } from "lucide-react";

interface Vulnerability {
  id: string;
  title: string;
  cveId: string;
  severity: string;
  cvssScore: number;
  status: string;
  affectedAsset: string;
  discoveredAt: string;
}

export default function VulnerabilitiesPage() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("");

  useEffect(() => {
    const params: any = {};
    if (severityFilter) params.severity = severityFilter;
    api
      .get("/vulnerabilities", { params })
      .then((res) => setVulns(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [severityFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vulnerabilities</h1>
        <p className="text-sm text-gray-500">Track and manage security vulnerabilities</p>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setLoading(true);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : vulns.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No vulnerabilities found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">Title</th>
                  <th className="pb-3 font-medium text-gray-500">CVE</th>
                  <th className="pb-3 font-medium text-gray-500">Severity</th>
                  <th className="pb-3 font-medium text-gray-500">CVSS</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Asset</th>
                  <th className="pb-3 font-medium text-gray-500">Discovered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vulns.map((vuln) => (
                  <tr key={vuln.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{vuln.title}</td>
                    <td className="py-3 font-mono text-xs text-gray-600">
                      {vuln.cveId || "—"}
                    </td>
                    <td className="py-3">
                      <Badge variant={vuln.severity as any}>{vuln.severity}</Badge>
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-bold ${
                          vuln.cvssScore >= 9
                            ? "text-red-600"
                            : vuln.cvssScore >= 7
                              ? "text-orange-600"
                              : vuln.cvssScore >= 4
                                ? "text-yellow-600"
                                : "text-green-600"
                        }`}
                      >
                        {vuln.cvssScore || "—"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="capitalize text-gray-600">
                        {vuln.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{vuln.affectedAsset || "—"}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(vuln.discoveredAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
