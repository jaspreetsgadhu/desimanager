import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
        <Compass className="size-7" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page-title">Page not found</h1>
        <p className="max-w-sm text-caption text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />} nativeButton={false}>
        Back to Dashboard
      </Button>
    </div>
  );
}
