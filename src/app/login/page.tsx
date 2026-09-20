"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Briefcase, UserRound, ArrowLeft } from "lucide-react";
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
import { CUSTOMER_IDENTITY_KEY } from "@/lib/customer-identity";

type LoginMode = "choose" | "employee" | "customer";

export default function LoginPage() {
  const [mode, setMode] = React.useState<LoginMode>("choose");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-[var(--radius-lg)] bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="text-card-title font-bold">Desi Manager</span>
        </Link>

        {mode === "choose" && <ChooseMode onSelect={setMode} />}
        {mode === "employee" && <EmployeeLogin onBack={() => setMode("choose")} />}
        {mode === "customer" && <CustomerEntry onBack={() => setMode("choose")} />}
      </div>
    </div>
  );
}

function ChooseMode({ onSelect }: { onSelect: (mode: LoginMode) => void }) {
  return (
    <Card className="shadow-soft-md">
      <CardHeader>
        <CardTitle className="text-section-title">Welcome</CardTitle>
        <CardDescription>Are you an employee or a customer?</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <button type="button" className="w-full text-left" onClick={() => onSelect("employee")}>
          <Card className="shadow-soft-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-soft-md">
            <CardContent className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-primary">
                <Briefcase className="size-5" />
              </div>
              <div>
                <p className="font-medium">I am an Employee</p>
                <p className="text-caption text-muted-foreground">
                  Log in with your Employee ID and password
                </p>
              </div>
            </CardContent>
          </Card>
        </button>
        <button type="button" className="w-full text-left" onClick={() => onSelect("customer")}>
          <Card className="shadow-soft-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-soft-md">
            <CardContent className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-primary">
                <UserRound className="size-5" />
              </div>
              <div>
                <p className="font-medium">I am a Customer</p>
                <p className="text-caption text-muted-foreground">
                  Get installation help or submit a complaint
                </p>
              </div>
            </CardContent>
          </Card>
        </button>
      </CardContent>
    </Card>
  );
}

function EmployeeLogin({ onBack }: { onBack: () => void }) {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both Employee ID and password.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Could not log in. Check your Employee ID and password.");
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
    <Card className="shadow-soft-md">
      <CardHeader>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 mb-1 w-fit gap-1"
          onClick={onBack}
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
        <CardTitle className="text-section-title">Employee login</CardTitle>
        <CardDescription>Log in to your organization&apos;s workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Employee ID</Label>
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
  );
}

function CustomerEntry({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [error, setError] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      setError("Please enter your name and an email or phone number.");
      return;
    }
    setError("");
    window.sessionStorage.setItem(
      CUSTOMER_IDENTITY_KEY,
      JSON.stringify({ name: name.trim(), contact: contact.trim() })
    );
    router.push("/portal");
  }

  return (
    <Card className="shadow-soft-md">
      <CardHeader>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 mb-1 w-fit gap-1"
          onClick={onBack}
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
        <CardTitle className="text-section-title">Welcome</CardTitle>
        <CardDescription>Just a couple details so we can help you</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customer-name">Name</Label>
            <Input
              id="customer-name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customer-contact">Email or phone</Label>
            <Input
              id="customer-contact"
              placeholder="jane@example.com"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          {error && <p className="text-caption text-destructive">{error}</p>}
          <Button type="submit" className="mt-2 w-full">
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
