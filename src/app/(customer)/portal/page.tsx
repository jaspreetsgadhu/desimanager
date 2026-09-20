"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, MessageSquareWarning } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCustomerIdentity, type CustomerIdentity } from "@/lib/customer-identity";

export default function CustomerPortalPage() {
  const router = useRouter();
  const [identity, setIdentity] = React.useState<CustomerIdentity | null>(null);

  React.useEffect(() => {
    function check() {
      const found = getCustomerIdentity();
      if (!found) {
        router.replace("/login");
        return;
      }
      setIdentity(found);
    }
    check();
  }, [router]);

  if (!identity) return null;

  return (
    <div className="flex flex-1 flex-col justify-center gap-8">
      <div className="text-center">
        <h1 className="text-page-title">Hi {identity.name.split(" ")[0]}, how can we help?</h1>
        <p className="text-caption text-muted-foreground">
          Choose an option below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/portal/install-help">
          <Card className="h-full shadow-soft-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-soft-md">
            <CardHeader>
              <div className="mb-1 flex size-10 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-primary">
                <Wrench className="size-5" />
              </div>
              <CardTitle className="text-card-title">Product Installation Help</CardTitle>
              <CardDescription>
                Get step-by-step help installing or setting up a product you bought.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/portal/complaint">
          <Card className="h-full shadow-soft-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-soft-md">
            <CardHeader>
              <div className="mb-1 flex size-10 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-primary">
                <MessageSquareWarning className="size-5" />
              </div>
              <CardTitle className="text-card-title">Submit a Complaint</CardTitle>
              <CardDescription>
                Tell us what went wrong and our team will follow up with you.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
