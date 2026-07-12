"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Upload,
  UserPlus,
  BarChart3,
  Users,
  FileText,
  MessageCircle,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/kpi-card";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { DASHBOARD_STATS, RECENT_ACTIVITY, TRAINING_PROGRESS } from "@/lib/mock-data";
import { toast } from "sonner";

const STAT_ICONS = {
  Users,
  FileText,
  MessageCircle,
  Sparkles,
} as const;

const QUICK_ACTIONS = [
  { title: "Ask Buddy AI", href: "/ai-workspace", icon: Sparkles },
  { title: "Upload Document", href: "/knowledge-base", icon: Upload },
  { title: "Add Employee", href: "/employees", icon: UserPlus },
  { title: "View Reports", href: "/reports", icon: BarChart3 },
];

interface DashboardDoc {
  id: string;
  title: string;
  category: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const supabase = React.useMemo(() => createClient(), []);
  const [documents, setDocuments] = React.useState<DashboardDoc[]>([]);
  const [documentCount, setDocumentCount] = React.useState<number | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = React.useState(true);
  const [pendingDelete, setPendingDelete] = React.useState<DashboardDoc | null>(null);

  const loadDocuments = React.useCallback(async () => {
    const { data, count } = await supabase
      .from("documents")
      .select("id, title, category", { count: "exact" })
      .order("updated_at", { ascending: false })
      .limit(4);
    setDocuments(data ?? []);
    setDocumentCount(count ?? 0);
  }, [supabase]);

  React.useEffect(() => {
    async function load() {
      setIsLoadingDocs(true);
      await loadDocuments();
      setIsLoadingDocs(false);
    }
    load();
  }, [loadDocuments]);

  async function handleDeleteDocument(doc: DashboardDoc) {
    const { data: fullDoc } = await supabase
      .from("documents")
      .select("storage_path")
      .eq("id", doc.id)
      .single();

    if (fullDoc?.storage_path) {
      await supabase.storage.from("documents").remove([fullDoc.storage_path]);
    }
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (error) {
      toast.error(`Could not delete: ${error.message}`);
      return;
    }
    toast.success(`"${doc.title}" deleted`);
    setPendingDelete(null);
    await loadDocuments();
  }

  const stats = DASHBOARD_STATS.map((stat) =>
    stat.label === "Documents" && documentCount !== null
      ? { ...stat, value: String(documentCount) }
      : stat
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-page-title">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-caption text-muted-foreground">
          Here&apos;s what&apos;s happening across your organization today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.title}
            variant="outline"
            className="h-auto justify-start gap-3 py-3"
            render={<Link href={action.href} />}
            nativeButton={false}
          >
            <div className="flex size-8 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-primary">
              <action.icon className="size-4" />
            </div>
            {action.title}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <KpiCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            icon={STAT_ICONS[stat.icon as keyof typeof STAT_ICONS]}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="shadow-soft-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across your organization</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {RECENT_ACTIVITY.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between gap-2 text-caption">
                <p>
                  <span className="font-medium">{activity.actor}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <span className="shrink-0 text-small-label text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft-sm">
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
            <CardDescription>Organization-wide learning</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {TRAINING_PROGRESS.map((item) => (
              <div key={item.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-caption">
                  <span>{item.title}</span>
                  <span className="text-muted-foreground">{item.progress}%</span>
                </div>
                <Progress value={item.progress} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft-sm">
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Latest knowledge base uploads</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoadingDocs ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-[var(--radius-lg)]" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents uploaded yet"
              description="Upload your first document to the knowledge base."
              actionLabel="Upload Document"
              onAction={() => {
                window.location.href = "/knowledge-base";
              }}
            />
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between gap-2 text-caption">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium">{doc.title}</span>
                  {doc.category && (
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-small-label text-secondary-foreground">
                      {doc.category}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${doc.title}`}
                  onClick={() => setPendingDelete(doc)}
                >
                  <Trash2 className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))
          )}
          <Button variant="ghost" className="mt-1 w-fit gap-1" render={<Link href="/knowledge-base" />} nativeButton={false}>
            View all documents
            <ArrowRight className="size-3.5" />
          </Button>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this document?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be permanently removed from the knowledge base and Storage. This cannot be undone.`
            : ""
        }
        onConfirm={() => pendingDelete && handleDeleteDocument(pendingDelete)}
      />
    </div>
  );
}
