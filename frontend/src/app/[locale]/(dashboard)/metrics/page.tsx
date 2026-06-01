"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Clock, Eye, TrendingUp } from "lucide-react";

export default function MetricsPage() {
  const t = useTranslations("metrics");
  const [mttr, setMttr] = useState<any>(null);
  const [mttd, setMttd] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/metrics/mttr"),
      api.get("/metrics/mttd"),
      api.get("/metrics/incidents-by-category"),
    ])
      .then(([mttrRes, mttdRes, catRes]) => {
        setMttr(mttrRes.data);
        setMttd(mttdRes.data);
        setCategories(catRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("mttr")}</p>
              <p className="text-2xl font-bold text-gray-900">
                {mttr?.mttr || 0}h
              </p>
              <p className="text-xs text-gray-400">
                {mttr?.sampleSize || 0} {t("resolvedEvents")}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-amber-50 p-3">
              <Eye className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("mttd")}</p>
              <p className="text-2xl font-bold text-gray-900">
                {mttd?.mttd || 0}h
              </p>
              <p className="text-xs text-gray-400">
                {mttd?.sampleSize || 0} {t("detectedEvents")}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-50 p-3">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("categories")}</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              <p className="text-xs text-gray-400">{t("activeCategories")}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("incidentsByCategory")}</CardTitle>
        </CardHeader>
        <div className="h-64">
          {categories.length === 0 ? (
            <p className="flex h-full items-center justify-center text-gray-500">
              {t("noData")}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
