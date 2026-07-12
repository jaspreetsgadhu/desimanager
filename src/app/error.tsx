"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page-title">Something went wrong</h1>
        <p className="max-w-sm text-caption text-muted-foreground">
          An unexpected error occurred. You can try again, or head back to the dashboard.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Back to Dashboard
        </Button>
        <Button onClick={() => unstable_retry()}>Try again</Button>
      </div>
    </div>
  );
}
