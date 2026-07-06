import { Activity, ArrowUpRight, Clock3, ImageIcon } from "lucide-react";

import { DashboardMetric } from "@/components/dashboard/dashboard-metric";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activity = [
  { title: "Summer launch variations", status: "Ready", time: "12 min ago" },
  { title: "Competitor angle scan", status: "Running", time: "34 min ago" },
  { title: "Pricing page hero refresh", status: "Draft", time: "Yesterday" }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Creative planning, competitive signals, and generated output in one place."
        action={
          <Button>
            New creative
            <ArrowUpRight className="ml-2 size-4" />
          </Button>
        }
      />
      <section className="grid gap-4 md:grid-cols-3">
        <DashboardMetric label="Product pages" value="42" trend="+8 this month" />
        <DashboardMetric label="Competitors" value="128" trend="+14 tracked" />
        <DashboardMetric label="Generated creatives" value="3,482" trend="91 ready today" />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Creative pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[
                ["Queued", 12, "bg-secondary"],
                ["Generating", 7, "bg-primary"],
                ["Ready for review", 31, "bg-accent"],
                ["Published", 84, "bg-foreground"]
              ].map(([label, value, color]) => (
                <div key={label} className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`${color} h-full rounded-full`}
                      style={{ width: `${Number(value) + 14}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="mt-1 flex size-9 items-center justify-center rounded-md bg-muted">
                  {item.status === "Ready" ? (
                    <ImageIcon className="size-4 text-primary" />
                  ) : item.status === "Running" ? (
                    <Activity className="size-4 text-accent" />
                  ) : (
                    <Clock3 className="size-4 text-secondary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.time}</p>
                </div>
                <Badge variant="outline">{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
