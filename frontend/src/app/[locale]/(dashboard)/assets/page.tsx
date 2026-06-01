"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Server, Plus, Filter } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: string;
  ipAddress: string;
  hostname: string;
  criticality: string;
  status: string;
  owner: string;
  location: string;
}

export default function AssetsPage() {
  const t = useTranslations("assets");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "server",
    ipAddress: "",
    hostname: "",
    criticality: "medium",
    owner: "",
    location: "",
  });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (typeFilter) params.type = typeFilter;
      const [assetsRes, statsRes] = await Promise.all([
        api.get("/assets", { params }),
        api.get("/assets/stats"),
      ]);
      setAssets(assetsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [typeFilter]);

  const handleCreate = async () => {
    try {
      await api.post("/assets", form);
      setShowForm(false);
      setForm({ name: "", type: "server", ipAddress: "", hostname: "", criticality: "medium", owner: "", location: "" });
      fetchAssets();
    } catch (err) {
      console.error(err);
    }
  };

  const criticalityVariant: Record<string, any> = {
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
          {t("addAsset")}
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card><div className="text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-gray-500">{t("totalAssets")}</p></div></Card>
          <Card><div className="text-center"><p className="text-2xl font-bold text-green-600">{stats.active}</p><p className="text-sm text-gray-500">{t("active")}</p></div></Card>
          <Card><div className="text-center"><p className="text-2xl font-bold text-gray-400">{stats.inactive}</p><p className="text-sm text-gray-500">{t("inactive")}</p></div></Card>
          <Card><div className="text-center"><p className="text-2xl font-bold text-red-600">{stats.byCriticality?.critical || 0}</p><p className="text-sm text-gray-500">{t("criticalAssets")}</p></div></Card>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{t("newAsset")}</CardTitle></CardHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("name")}</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("type")}</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="server">Server</option>
                <option value="workstation">Workstation</option>
                <option value="network">Network</option>
                <option value="application">Application</option>
                <option value="database">Database</option>
                <option value="cloud">Cloud</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP</label>
              <input type="text" value={form.ipAddress} onChange={(e) => setForm({ ...form, ipAddress: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hostname</label>
              <input type="text" value={form.hostname} onChange={(e) => setForm({ ...form, hostname: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("criticality")}</label>
              <select value={form.criticality} onChange={(e) => setForm({ ...form, criticality: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("owner")}</label>
              <input type="text" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleCreate}>{t("create")}</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
          </div>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">{t("allTypes")}</option>
          <option value="server">Server</option>
          <option value="workstation">Workstation</option>
          <option value="network">Network</option>
          <option value="application">Application</option>
          <option value="database">Database</option>
          <option value="cloud">Cloud</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>
        ) : assets.length === 0 ? (
          <p className="py-8 text-center text-gray-500">{t("noAssets")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">{t("name")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("type")}</th>
                  <th className="pb-3 font-medium text-gray-500">IP</th>
                  <th className="pb-3 font-medium text-gray-500">Hostname</th>
                  <th className="pb-3 font-medium text-gray-500">{t("criticality")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("owner")}</th>
                  <th className="pb-3 font-medium text-gray-500">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{asset.name}</td>
                    <td className="py-3"><Badge>{asset.type}</Badge></td>
                    <td className="py-3 font-mono text-xs text-gray-600">{asset.ipAddress || "—"}</td>
                    <td className="py-3 text-gray-600">{asset.hostname || "—"}</td>
                    <td className="py-3"><Badge variant={criticalityVariant[asset.criticality]}>{asset.criticality}</Badge></td>
                    <td className="py-3 text-gray-600">{asset.owner || "—"}</td>
                    <td className="py-3"><Badge variant={asset.status === "active" ? "success" : "default"}>{asset.status}</Badge></td>
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
