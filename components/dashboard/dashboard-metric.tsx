import { TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function DashboardMetric({
  label,
  value,
  trend
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <TrendingUp className="size-4 text-primary" />
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-normal">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{trend}</p>
      </CardContent>
    </Card>
  );
}
