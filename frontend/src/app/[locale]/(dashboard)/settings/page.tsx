"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Shield, Key, ClipboardList, Plus, Copy, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const [twoFA, setTwoFA] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [tab, setTab] = useState<"2fa" | "apikeys" | "audit">("2fa");

  useEffect(() => {
    loadTab();
  }, [tab]);

  const loadTab = async () => {
    if (tab === "2fa") {
      const res = await api.get("/2fa/status");
      setTwoFA(res.data);
    } else if (tab === "apikeys") {
      const res = await api.get("/api-keys");
      setApiKeys(res.data);
    } else if (tab === "audit") {
      const res = await api.get("/audit");
      setAuditLogs(res.data);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    const res = await api.post("/api-keys", { name: newKeyName });
    setNewKey(res.data.key);
    setNewKeyName("");
    loadTab();
  };

  const handleRevokeKey = async (id: string) => {
    await api.patch(`/api-keys/${id}/revoke`);
    loadTab();
  };

  const handleEnable2FA = async () => {
    const res = await api.post("/2fa/generate");
    setTwoFA({ ...twoFA, secret: res.data.secret, otpauthUrl: res.data.otpauthUrl });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button onClick={() => setTab("2fa")} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${tab === "2fa" ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
          <Shield className="h-4 w-4" /> 2FA
        </button>
        <button onClick={() => setTab("apikeys")} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${tab === "apikeys" ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
          <Key className="h-4 w-4" /> API Keys
        </button>
        <button onClick={() => setTab("audit")} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${tab === "audit" ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
          <ClipboardList className="h-4 w-4" /> {t("auditLog")}
        </button>
      </div>

      {/* 2FA Tab */}
      {tab === "2fa" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("twoFactorAuth")}</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {t("status")}:{" "}
                  <Badge variant={twoFA?.enabled ? "success" : "default"}>
                    {twoFA?.enabled ? t("enabled") : t("disabled")}
                  </Badge>
                </p>
                <p className="text-sm text-gray-500">{t("twoFADesc")}</p>
              </div>
              {!twoFA?.enabled && (
                <Button onClick={handleEnable2FA}>{t("enable2FA")}</Button>
              )}
            </div>

            {twoFA?.secret && !twoFA?.enabled && (
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("secretKey")}:
                </p>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-gray-200 px-3 py-1 text-sm font-mono dark:bg-gray-600 dark:text-gray-200">
                    {twoFA.secret}
                  </code>
                  <button onClick={() => copyToClipboard(twoFA.secret)} className="text-gray-400 hover:text-gray-600">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">{t("enterCode")}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* API Keys Tab */}
      {tab === "apikeys" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("createAPIKey")}</CardTitle>
            </CardHeader>
            <div className="flex gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder={t("keyName")}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                {t("create")}
              </Button>
            </div>
            {newKey && (
              <div className="mt-4 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                  {t("keyCreated")}
                </p>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-emerald-100 px-3 py-1 text-xs font-mono break-all dark:bg-emerald-800 dark:text-emerald-200">
                    {newKey}
                  </code>
                  <button onClick={() => copyToClipboard(newKey)} className="text-emerald-600 hover:text-emerald-800">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{t("saveKeyWarning")}</p>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("yourKeys")}</CardTitle>
            </CardHeader>
            {apiKeys.length === 0 ? (
              <p className="py-4 text-center text-gray-500">{t("noKeys")}</p>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{key.name}</p>
                      <p className="font-mono text-xs text-gray-500">{key.key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={key.isActive ? "success" : "default"}>
                        {key.isActive ? t("active") : t("revoked")}
                      </Badge>
                      {key.isActive && (
                        <Button size="sm" variant="danger" onClick={() => handleRevokeKey(key.id)}>
                          {t("revoke")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Audit Log Tab */}
      {tab === "audit" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
          </CardHeader>
          {auditLogs.length === 0 ? (
            <p className="py-8 text-center text-gray-500">{t("noLogs")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium text-gray-500">{t("timestamp")}</th>
                    <th className="pb-3 font-medium text-gray-500">{t("user")}</th>
                    <th className="pb-3 font-medium text-gray-500">{t("action")}</th>
                    <th className="pb-3 font-medium text-gray-500">{t("resource")}</th>
                    <th className="pb-3 font-medium text-gray-500">{t("details")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-2 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-2 text-gray-900 dark:text-gray-100">{log.userName}</td>
                      <td className="py-2"><Badge>{log.action}</Badge></td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">{log.resource}</td>
                      <td className="py-2 text-xs text-gray-500 max-w-xs truncate">{log.details || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
