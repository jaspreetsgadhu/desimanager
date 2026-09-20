"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

interface LeaveRequestFormProps {
  onSubmitted: () => void;
}

export function LeaveRequestForm({ onSubmitted }: LeaveRequestFormProps) {
  const { user } = useAuth();
  const supabase = React.useMemo(() => createClient(), []);
  const [startDate, setStartDate] = React.useState("");
  const [days, setDays] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const daysNum = Number(days);
    if (!user || !startDate || !daysNum || daysNum < 1 || !reason.trim()) {
      toast.error("Please fill in a start date, number of days, and a reason.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        toast.error("Could not resolve your organization. Please try again.");
        return;
      }

      const { error } = await supabase.from("leave_requests").insert({
        org_id: profile.org_id,
        employee_id: user.id,
        start_date: startDate,
        days: daysNum,
        reason: reason.trim(),
      });

      if (error) {
        toast.error(error.message || "Could not submit your leave request.");
        return;
      }

      toast.success("Leave request submitted.");
      setStartDate("");
      setDays("");
      setReason("");
      onSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="leave-start-date">Start date</Label>
          <Input
            id="leave-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="leave-days">Number of days</Label>
          <Input
            id="leave-days"
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="leave-reason">Reason</Label>
        <Textarea
          id="leave-reason"
          rows={4}
          placeholder="Let your manager know why you're taking leave..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Submitting..." : "Submit Leave Request"}
      </Button>
    </form>
  );
}
