import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon className="size-6" />
      </div>
      <h3 className="text-card-title">{title}</h3>
      <p className="max-w-sm text-caption text-muted-foreground">{description}</p>
      {actionLabel && (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
