import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface Alert {
  id: string;
  title: string;
  severity: string;
  status: string;
  createdAt: string;
}

interface AlertsTimelineProps {
  alerts: Alert[];
}

export function AlertsTimeline({ alerts }: AlertsTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500">No recent alerts</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={alert.severity as any}>{alert.severity}</Badge>
                <span className="text-xs text-gray-400 capitalize">{alert.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
