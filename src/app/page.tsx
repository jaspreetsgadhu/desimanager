import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Briefcase,
  GraduationCap,
  Headset,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AGENTS = [
  {
    icon: Sparkles,
    title: "Buddy AI",
    description: "Your company's digital assistant — ask anything, get answers with citations.",
  },
  {
    icon: Briefcase,
    title: "HR Manager AI",
    description: "Leave policy, attendance, holidays, and HR FAQs, answered instantly.",
  },
  {
    icon: GraduationCap,
    title: "Training Manager AI",
    description: "SOP learning, product training, quizzes, and certificates.",
  },
  {
    icon: Headset,
    title: "Customer Care AI",
    description: "Product FAQs, escalation handling, and ticket summaries.",
  },
  {
    icon: BarChart3,
    title: "Reporter AI",
    description: "Daily and weekly summaries, usage analytics, knowledge gap detection.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Upload SOPs, policies, and manuals — searchable by every employee.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-[var(--radius-lg)] bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="text-card-title font-bold">Desi Manager</span>
        </div>
        <Button render={<Link href="/login" />} nativeButton={false}>Log in</Button>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center md:py-32">
          <span className="rounded-full bg-secondary px-3 py-1 text-caption font-medium text-secondary-foreground">
            AI Workforce & Knowledge Operating System
          </span>
          <h1 className="text-balance text-page-title md:text-5xl">
            Reduce manpower dependency with an AI-first digital workforce
          </h1>
          <p className="max-w-2xl text-balance text-base text-muted-foreground">
            Desi Manager gives every employee an AI teammate — one that knows your
            SOPs, policies, and products, and answers instantly instead of routing
            through people.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/login" />} nativeButton={false}>
              Try the demo
              <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/login" />} nativeButton={false}>
              See it in action
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 md:px-12">
          <h2 className="mb-8 text-center text-section-title">
            One workspace, five specialized AI agents
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((agent) => (
              <Card key={agent.title} className="shadow-soft-sm transition-shadow hover:shadow-soft-md">
                <CardHeader>
                  <div className="mb-2 flex size-9 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-primary">
                    <agent.icon className="size-5" />
                  </div>
                  <CardTitle>{agent.title}</CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-caption text-muted-foreground">
        © 2026 Desi Manager. Prototype build.
      </footer>
    </div>
  );
}
