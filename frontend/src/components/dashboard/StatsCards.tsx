import { Card } from "@/components/ui/Card";
import { Shield, Bug, Clock, ClipboardCheck } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalEvents: number;
    openEvents: number;
    totalVulnerabilities: number;
    openVulnerabilities: number;
    complianceScore: number;
  };
  mttr: number;
}

export function StatsCards({ stats, mttr }: StatsCardsProps) {
  const cards = [
    {
      title: "Open Events",
      value: stats.openEvents,
      subtitle: `${stats.totalEvents} total`,
      icon: Shield,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Open Vulnerabilities",
      value: stats.openVulnerabilities,
      subtitle: `${stats.totalVulnerabilities} total`,
      icon: Bug,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "MTTR",
      value: `${mttr}h`,
      subtitle: "Mean Time to Resolve",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Compliance",
      value: `${stats.complianceScore}%`,
      subtitle: "Overall score",
      icon: ClipboardCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="mt-1 text-xs text-gray-400">{card.subtitle}</p>
            </div>
            <div className={`rounded-lg p-3 ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
