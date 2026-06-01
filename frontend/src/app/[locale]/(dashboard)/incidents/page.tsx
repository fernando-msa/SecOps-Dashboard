"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AlertOctagon, ChevronDown, ChevronUp, Plus } from "lucide-react";

interface TimelineEntry {
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  assignedTo: string;
  escalatedTo: string;
  resolution: string;
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export default function IncidentsPage() {
  const t = useTranslations("incidents");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", severity: "medium", category: "" });

  const fetchIncidents = async () => {
    try {
      const res = await api.get("/incidents");
      setIncidents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/incidents", form);
      setShowForm(false);
      setForm({ title: "", description: "", severity: "medium", category: "" });
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = async (id: string) => {
    try {
      await api.patch(`/incidents/${id}/close`);
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  const statusVariant: Record<string, any> = {
    new: "default",
    assigned: "warning",
    in_progress: "warning",
    escalated: "critical",
    contained: "medium",
    resolved: "success",
    closed: "default",
  };

  const severityVariant: Record<string, any> = {
    critical: "critical",
    high: "high",
    medium: "medium",
    low: "low",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("newIncident")}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{t("createIncident")}</CardTitle></CardHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("title")}</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("severity")}</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("description")}</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleCreate}>{t("create")}</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>
      ) : incidents.length === 0 ? (
        <Card><p className="py-8 text-center text-gray-500">{t("noIncidents")}</p></Card>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <Card key={inc.id}>
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === inc.id ? null : inc.id)}>
                <div className="flex items-center gap-3">
                  <AlertOctagon className={`h-5 w-5 ${inc.severity === "critical" ? "text-red-500" : inc.severity === "high" ? "text-orange-500" : "text-yellow-500"}`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{inc.title}</h3>
                    <p className="text-xs text-gray-500">{new Date(inc.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={severityVariant[inc.severity]}>{inc.severity}</Badge>
                  <Badge variant={statusVariant[inc.status]}>{inc.status.replace("_", " ")}</Badge>
                  {expandedId === inc.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>

              {expandedId === inc.id && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
                  <p className="text-sm text-gray-600">{inc.description}</p>

                  {inc.assignedTo && <p className="text-sm"><span className="font-medium">{t("assignedTo")}:</span> {inc.assignedTo}</p>}
                  {inc.resolution && <p className="text-sm"><span className="font-medium">{t("resolution")}:</span> {inc.resolution}</p>}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t("timeline")}</h4>
                    <div className="space-y-2">
                      {(inc.timeline || []).map((entry, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs">
                          <span className="text-gray-400 w-32 shrink-0">{new Date(entry.timestamp).toLocaleString()}</span>
                          <Badge>{entry.action}</Badge>
                          <span className="text-gray-600">{entry.details}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {inc.status !== "closed" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleClose(inc.id)}>{t("close")}</Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
