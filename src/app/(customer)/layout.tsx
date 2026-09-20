import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="border-b border-border bg-background px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-[var(--radius-lg)] bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="text-card-title font-bold">Desi Manager</span>
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
