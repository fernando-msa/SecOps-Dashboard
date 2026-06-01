"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookOpen, ChevronDown, ChevronUp, Zap, User, CheckCircle } from "lucide-react";

interface PlaybookStep {
  order: number;
  title: string;
  description: string;
  type: "manual" | "automated" | "approval";
  command?: string;
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: PlaybookStep[];
  triggerCondition: string;
  isActive: boolean;
}

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/playbooks")
      .then((res) => setPlaybooks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: string) => {
    try {
      const res = await api.patch(`/playbooks/${id}/toggle`);
      setPlaybooks((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: res.data.isActive } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const stepTypeIcon = (type: string) => {
    switch (type) {
      case "automated":
        return <Zap className="h-4 w-4 text-blue-500" />;
      case "approval":
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Playbooks</h1>
        <p className="text-sm text-gray-500">Incident response runbooks</p>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : playbooks.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-gray-500">No playbooks configured</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {playbooks.map((playbook) => (
            <Card key={playbook.id} className="cursor-pointer">
              <div
                className="flex items-center justify-between"
                onClick={() =>
                  setExpandedId(expandedId === playbook.id ? null : playbook.id)
                }
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{playbook.name}</h3>
                    <p className="text-xs text-gray-500">{playbook.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {playbook.category && <Badge>{playbook.category}</Badge>}
                  <Badge variant={playbook.isActive ? "success" : "default"}>
                    {playbook.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {expandedId === playbook.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedId === playbook.id && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  {playbook.triggerCondition && (
                    <p className="mb-3 text-sm text-gray-600">
                      <span className="font-medium">Trigger:</span>{" "}
                      {playbook.triggerCondition}
                    </p>
                  )}
                  <div className="space-y-2">
                    {playbook.steps?.map((step) => (
                      <div
                        key={step.order}
                        className="flex items-start gap-3 rounded-lg bg-gray-50 p-3"
                      >
                        <div className="mt-0.5">{stepTypeIcon(step.type)}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {step.order}. {step.title}
                          </p>
                          <p className="text-xs text-gray-600">{step.description}</p>
                          {step.command && (
                            <code className="mt-1 block rounded bg-gray-800 px-2 py-1 text-xs text-green-400">
                              {step.command}
                            </code>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      variant={playbook.isActive ? "secondary" : "primary"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActive(playbook.id);
                      }}
                    >
                      {playbook.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
