"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface SeverityDistributionProps {
  data: { critical: number; high: number; medium: number; low: number };
}

const COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export function SeverityDistribution({ data }: SeverityDistributionProps) {
  const t = useTranslations("events");
  const td = useTranslations("dashboard");

  const chartData = [
    { name: t("critical"), value: data.critical },
    { name: t("high"), value: data.high },
    { name: t("medium"), value: data.medium },
    { name: t("low"), value: data.low },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{td("severityDist")}</CardTitle>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={Object.values(COLORS)[index]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
