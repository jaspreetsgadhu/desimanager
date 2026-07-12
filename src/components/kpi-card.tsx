import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
}

export function KpiCard({ label, value, change, icon: Icon }: KpiCardProps) {
  return (
    <Card className="shadow-soft-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-soft-md">
      <CardContent className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-small-label font-medium text-muted-foreground">{label}</span>
          <span className="text-page-title">{value}</span>
          <span className="text-caption text-success">{change}</span>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
