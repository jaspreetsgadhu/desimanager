"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { DEMO_USERS } from "@/lib/mock-data";
import { ROLE_LABELS } from "@/types/user";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Could not log in. Check your email and password.");
      return;
    }
    router.push("/dashboard");
  }

  async function quickLogin(demoEmail: string) {
    setError("");
    setIsSubmitting(true);
    const result = await login(demoEmail);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Could not log in as demo user.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-[var(--radius-lg)] bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="text-card-title font-bold">Desi Manager</span>
        </Link>

        <Card className="shadow-soft-md">
          <CardHeader>
            <CardTitle className="text-section-title">Welcome back</CardTitle>
            <CardDescription>Log in to your organization&apos;s workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-caption text-destructive">{error}</p>}
              <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log in"}
              </Button>
            </form>

            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-2 text-small-label font-medium text-muted-foreground">
                Quick demo login
              </p>
              <div className="flex flex-col gap-2">
                {DEMO_USERS.map((demoUser) => (
                  <Button
                    key={demoUser.id}
                    type="button"
                    variant="outline"
                    className="justify-between"
                    disabled={isSubmitting}
                    onClick={() => quickLogin(demoUser.email)}
                  >
                    <span>{demoUser.name}</span>
                    <span className="text-muted-foreground">{ROLE_LABELS[demoUser.role]}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
