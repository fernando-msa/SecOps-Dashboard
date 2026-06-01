"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Zap, Shield, Wifi, Bell, Ticket, Terminal } from "lucide-react";

interface ActionDef {
  type: string;
  description: string;
  params: string[];
}

const actionIcons: Record<string, any> = {
  block_ip: Shield,
  isolate_host: Wifi,
  notify: Bell,
  create_ticket: Ticket,
  run_command: Terminal,
};

export default function SoarPage() {
  const t = useTranslations("soar");
  const [actions, setActions] = useState<ActionDef[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    api
      .get("/soar/actions")
      .then((res) => setActions(res.data))
      .catch(console.error);
  }, []);

  const handleExecute = async () => {
    if (!selectedAction) return;
    setExecuting(true);
    setResult(null);
    try {
      const res = await api.post("/soar/execute", {
        type: selectedAction,
        params,
      });
      setResult(res.data);
    } catch (err: any) {
      setResult({ success: false, output: err.response?.data?.message || "Execution failed" });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = actionIcons[action.type] || Zap;
          return (
            <Card
              key={action.type}
              onClick={() => {
                setSelectedAction(action.type);
                setParams({});
                setResult(null);
              }}
              className={selectedAction === action.type ? "ring-2 ring-primary-500" : ""}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary-50 p-2">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{action.type.replace(/_/g, " ")}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {action.params.map((p) => (
                      <Badge key={p} variant="default">{p}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedAction && (
        <Card>
          <CardHeader>
            <CardTitle>{t("executeAction")}: {selectedAction.replace(/_/g, " ")}</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {actions
              .find((a) => a.type === selectedAction)
              ?.params.map((param) => (
                <div key={param}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{param}</label>
                  <input
                    type="text"
                    value={params[param] || ""}
                    onChange={(e) => setParams({ ...params, [param]: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder={param}
                  />
                </div>
              ))}
            <Button onClick={handleExecute} disabled={executing}>
              {executing ? t("executing") : t("execute")}
            </Button>
          </div>

          {result && (
            <div className={`mt-4 rounded-lg p-4 ${result.success ? "bg-emerald-50" : "bg-red-50"}`}>
              <p className={`text-sm font-medium ${result.success ? "text-emerald-800" : "text-red-800"}`}>
                {result.success ? t("success") : t("failed")}
              </p>
              <p className="mt-1 text-sm text-gray-600">{result.output}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
