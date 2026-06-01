"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Filter } from "lucide-react";

interface SecurityEvent {
  id: string;
  title: string;
  severity: string;
  status: string;
  source: string;
  category: string;
  createdAt: string;
}

export default function EventsPage() {
  const t = useTranslations("events");
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/events", { params });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [severityFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="">{t("allSeverities")}</option>
            <option value="critical">{t("critical")}</option>
            <option value="high">{t("high")}</option>
            <option value="medium">{t("medium")}</option>
            <option value="low">{t("low")}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="">{t("allStatuses")}</option>
            <option value="open">{t("open")}</option>
            <option value="investigating">{t("investigating")}</option>
            <option value="resolved">{t("resolved")}</option>
            <option value="closed">{t("closed")}</option>
          </select>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : events.length === 0 ? (
          <p className="py-8 text-center text-gray-500">{t("noEvents")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">{t("tableTitle")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("tableSeverity")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("tableStatus")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("tableSource")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("tableCategory")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("tableCreated")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{event.title}</td>
                    <td className="py-3">
                      <Badge variant={event.severity as any}>{event.severity}</Badge>
                    </td>
                    <td className="py-3">
                      <span className="capitalize text-gray-600">{event.status}</span>
                    </td>
                    <td className="py-3 text-gray-600">{event.source || "—"}</td>
                    <td className="py-3 text-gray-600">{event.category || "—"}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(event.createdAt).toLocaleDateString()}
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
