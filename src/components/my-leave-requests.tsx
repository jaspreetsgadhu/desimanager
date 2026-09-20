"use client";

import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { LeaveStatus } from "@/lib/supabase/types";

const STATUS_STYLES: Record<LeaveStatus, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

interface LeaveRequestRow {
  id: string;
  start_date: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  created_at: string;
}

export function MyLeaveRequests({ refreshKey }: { refreshKey: number }) {
  const { user } = useAuth();
  const supabase = React.useMemo(() => createClient(), []);
  const [requests, setRequests] = React.useState<LeaveRequestRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      if (!user) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from("leave_requests")
        .select("id, start_date, days, reason, status, created_at")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("Could not load your leave requests");
      } else {
        setRequests(data ?? []);
      }
      setIsLoading(false);
    }
    load();
  }, [supabase, user, refreshKey]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-[var(--radius-lg)]" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No leave requests yet"
        description="Requests you submit will show up here with their approval status."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col">
            <span className="font-medium">
              {request.days} day{request.days === 1 ? "" : "s"} starting {request.start_date}
            </span>
            <span className="text-caption text-muted-foreground">{request.reason}</span>
          </div>
          <Badge variant="secondary" className={STATUS_STYLES[request.status]}>
            {request.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
