"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

interface PendingLeaveRequest {
  id: string;
  employee_id: string;
  start_date: string;
  days: number;
  reason: string;
  employeeName: string;
}

interface LeaveApprovalsProps {
  refreshKey: number;
  onReviewed: () => void;
}

export function LeaveApprovals({ refreshKey, onReviewed }: LeaveApprovalsProps) {
  const { user } = useAuth();
  const supabase = React.useMemo(() => createClient(), []);
  const [requests, setRequests] = React.useState<PendingLeaveRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [reviewingId, setReviewingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      const { data: pending, error } = await supabase
        .from("leave_requests")
        .select("id, employee_id, start_date, days, reason")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) {
        toast.error("Could not load pending leave requests");
        setIsLoading(false);
        return;
      }

      const validRows = (pending ?? []).filter(
        (r): r is typeof r & { employee_id: string } => r.employee_id !== null
      );
      const employeeIds = [...new Set(validRows.map((r) => r.employee_id))];
      const namesById = new Map<string, string>();
      if (employeeIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", employeeIds);
        (profiles ?? []).forEach((p) => namesById.set(p.id, p.name));
      }

      setRequests(
        validRows.map((r) => ({
          ...r,
          employeeName: namesById.get(r.employee_id) ?? "Unknown employee",
        }))
      );
      setIsLoading(false);
    }
    load();
  }, [supabase, refreshKey]);

  async function review(id: string, status: "approved" | "rejected") {
    if (!user) return;
    setReviewingId(id);
    const { error } = await supabase
      .from("leave_requests")
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    setReviewingId(null);

    if (error) {
      toast.error("Could not update this leave request");
      return;
    }
    toast.success(`Leave request ${status}`);
    onReviewed();
  }

  return (
    <Card className="shadow-soft-sm">
      <CardHeader>
        <CardTitle>Leave Approvals</CardTitle>
        <CardDescription>Pending leave requests from your team</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-[var(--radius-lg)]" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No pending requests"
            description="Leave requests awaiting approval will show up here."
          />
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col">
                <span className="font-medium">
                  {request.employeeName} — {request.days} day{request.days === 1 ? "" : "s"} starting{" "}
                  {request.start_date}
                </span>
                <span className="text-caption text-muted-foreground">{request.reason}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={reviewingId === request.id}
                  onClick={() => review(request.id, "rejected")}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  disabled={reviewingId === request.id}
                  onClick={() => review(request.id, "approved")}
                >
                  Approve
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
