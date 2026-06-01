"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { AlertsTimeline } from "@/components/dashboard/AlertsTimeline";
import { ThreatChart } from "@/components/dashboard/ThreatChart";
import { SeverityDistribution } from "@/components/dashboard/SeverityDistribution";

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [mttr, setMttr] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/metrics/overview"),
      api.get("/metrics/mttr"),
      api.get("/metrics/timeline"),
      api.get("/events/recent"),
    ])
      .then(([overviewRes, mttrRes, timelineRes, alertsRes]) => {
        setOverview(overviewRes.data);
        setMttr(mttrRes.data.mttr);
        setTimeline(timelineRes.data);
        setRecentAlerts(alertsRes.data);
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Security Operations Overview</p>
      </div>

      {overview && <StatsCards stats={overview} mttr={mttr} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ThreatChart data={timeline} />
        {overview && <SeverityDistribution data={overview} />}
      </div>

      <AlertsTimeline alerts={recentAlerts} />
    </div>
  );
}
