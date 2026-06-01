"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ClipboardCheck, Shield, FileText, Scale } from "lucide-react";

interface FrameworkSummary {
  framework: string;
  total: number;
  compliant: number;
  nonCompliant: number;
  partial: number;
  notApplicable: number;
  percentage: number;
}

const frameworkIcons: Record<string, any> = {
  ISO27001: Shield,
  LGPD: Scale,
  NIST: FileText,
};

const frameworkColors: Record<string, string> = {
  ISO27001: "text-blue-600 bg-blue-50",
  LGPD: "text-purple-600 bg-purple-50",
  NIST: "text-emerald-600 bg-emerald-50",
};

export default function CompliancePage() {
  const t = useTranslations("compliance");
  const [summary, setSummary] = useState<FrameworkSummary[]>([]);
  const [checks, setChecks] = useState<any[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/compliance/summary"), api.get("/compliance")])
      .then(([summaryRes, checksRes]) => {
        setSummary(summaryRes.data);
        setChecks(checksRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredChecks = selectedFramework
    ? checks.filter((c) => c.framework === selectedFramework)
    : checks;

  const statusBadge = (status: string) => {
    const labels: Record<string, string> = {
      compliant: t("compliant"),
      non_compliant: t("nonCompliant"),
      partial: t("partial"),
      not_applicable: t("notApplicable"),
    };
    const variants: Record<string, any> = {
      compliant: "success",
      non_compliant: "critical",
      partial: "warning",
      not_applicable: "default",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((fw) => {
          const Icon = frameworkIcons[fw.framework] || ClipboardCheck;
          const color = frameworkColors[fw.framework] || "text-gray-600 bg-gray-50";
          return (
            <Card
              key={fw.framework}
              onClick={() =>
                setSelectedFramework(
                  selectedFramework === fw.framework ? null : fw.framework
                )
              }
              className={`transition-all ${
                selectedFramework === fw.framework ? "ring-2 ring-primary-500" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{fw.framework}</h3>
                  <p className="text-sm text-gray-500">
                    {fw.compliant}/{fw.total} {t("controls")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{fw.percentage}%</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${fw.percentage}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedFramework
              ? `${selectedFramework} ${t("controls")}`
              : t("allChecks")}
          </CardTitle>
        </CardHeader>
        {filteredChecks.length === 0 ? (
          <p className="py-8 text-center text-gray-500">{t("noChecks")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">{t("controlId")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("framework")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("tableTitle")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("tableStatus")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("lastReviewed")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredChecks.map((check) => (
                  <tr key={check.id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs text-gray-600">
                      {check.controlId}
                    </td>
                    <td className="py-3">
                      <Badge>{check.framework}</Badge>
                    </td>
                    <td className="py-3 font-medium text-gray-900">{check.title}</td>
                    <td className="py-3">{statusBadge(check.status)}</td>
                    <td className="py-3 text-gray-500">
                      {check.lastReviewedAt
                        ? new Date(check.lastReviewedAt).toLocaleDateString()
                        : "—"}
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
