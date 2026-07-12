"use client";

import * as React from "react";
import {
  Search,
  Upload,
  FileText,
  FileVideo,
  Link as LinkIcon,
  File,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DocumentType, IndexStatus } from "@/lib/supabase/types";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

const CATEGORIES = ["HR", "Sales", "Operations", "Training", "Products", "Customer Support"];

const TYPE_ICONS: Record<DocumentType, typeof FileText> = {
  PDF: FileText,
  DOC: File,
  Video: FileVideo,
  URL: LinkIcon,
};

const EXTENSION_TYPE: Record<string, DocumentType> = {
  pdf: "PDF",
  doc: "DOC",
  docx: "DOC",
  mp4: "Video",
  mov: "Video",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocRow {
  id: string;
  title: string;
  category: string | null;
  type: DocumentType;
  size: string | null;
  storage_path: string | null;
  uploaded_by: string | null;
  updated_at: string;
  index_status: IndexStatus;
  uploaderName: string;
}

const INDEX_STATUS_LABEL: Record<IndexStatus, string> = {
  not_indexed: "Not indexed",
  indexing: "Indexing...",
  indexed: "Indexed for AI",
  failed: "Indexing failed",
};

export default function KnowledgeBasePage() {
  const supabase = React.useMemo(() => createClient(), []);
  const { user } = useAuth();
  const [documents, setDocuments] = React.useState<DocRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [category, setCategory] = React.useState<string>("All");
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<DocRow | null>(null);

  const loadDocuments = React.useCallback(async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("id, title, category, type, size, storage_path, uploaded_by, updated_at, index_status")
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Could not load documents");
      return;
    }

    const uploaderIds = [...new Set((data ?? []).map((d) => d.uploaded_by).filter(Boolean))] as string[];
    let namesById = new Map<string, string>();
    if (uploaderIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", uploaderIds);
      namesById = new Map((profiles ?? []).map((p) => [p.id, p.name]));
    }

    const rows = (data ?? []).map((d) => ({
      ...d,
      uploaderName: d.uploaded_by ? namesById.get(d.uploaded_by) ?? "Unknown" : "Unknown",
    }));
    setDocuments(rows);
    setSelectedId((prev) => prev ?? rows[0]?.id ?? null);
  }, [supabase]);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      await loadDocuments();
      setIsLoading(false);
    }
    load();
  }, [loadDocuments]);

  const filtered = documents.filter((doc) => {
    const matchesCategory = category === "All" || doc.category === category;
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selected = documents.find((doc) => doc.id === selectedId) ?? null;

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const category = String(form.get("category") ?? "");
    const file = form.get("file") as File | null;

    if (!title || !category || !file || file.size === 0) {
      toast.error("Please fill in a title, category, and choose a file.");
      return;
    }

    setIsUploading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const type: DocumentType = EXTENSION_TYPE[extension] ?? "DOC";
    const storagePath = `${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file);

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }

    const { data: orgRow } = await supabase.from("organizations").select("id").single();

    const { data: inserted, error: insertError } = await supabase
      .from("documents")
      .insert({
        org_id: orgRow?.id,
        title,
        category,
        type,
        size: formatBytes(file.size),
        storage_path: storagePath,
        uploaded_by: user.id,
      })
      .select("id")
      .single();

    setIsUploading(false);
    if (insertError || !inserted) {
      toast.error(`Could not save document: ${insertError?.message}`);
      return;
    }

    setUploadOpen(false);
    toast.success("Document uploaded — indexing for AI search...");
    await loadDocuments();
    await indexDocument(inserted.id);
  }

  async function indexDocument(documentId: string) {
    try {
      const res = await fetch(`/api/documents/${documentId}/ingest`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        toast.error(`Indexing failed: ${body.error ?? "unknown error"}`);
      } else {
        toast.success(`Indexed for AI search (${body.chunksIndexed} chunks)`);
      }
    } catch {
      toast.error("Indexing failed: network error");
    }
    await loadDocuments();
  }

  async function handleView(doc: DocRow) {
    if (!doc.storage_path) {
      toast.info("This document has no file attached");
      return;
    }
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.storage_path, 60);

    if (error || !data) {
      toast.error("Could not open document");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function handleDelete(doc: DocRow) {
    if (doc.storage_path) {
      await supabase.storage.from("documents").remove([doc.storage_path]);
    }
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (error) {
      toast.error(`Could not delete: ${error.message}`);
      return;
    }
    toast.success("Document deleted");
    setSelectedId(null);
    setPendingDelete(null);
    await loadDocuments();
  }

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100vh-8rem)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title">Knowledge Base</h1>
          <p className="text-caption text-muted-foreground">
            Upload and organize your organization&apos;s knowledge
          </p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger render={<Button className="gap-1.5" />}>
            <Upload className="size-4" />
            Upload Document
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload a document</DialogTitle>
              <DialogDescription>
                PDF or DOC files are automatically indexed for AI search after upload. Video and other
                file types are stored but not yet searchable by Buddy AI.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="upload-title">Title</Label>
                <Input id="upload-title" name="title" placeholder="e.g. Refund Policy 2026" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="upload-category">Category</Label>
                <Select name="category" defaultValue={CATEGORIES[0]}>
                  <SelectTrigger id="upload-category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="upload-file">File</Label>
                <Input id="upload-file" name="file" type="file" required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:overflow-hidden lg:grid-cols-[200px_1fr_320px]">
        <Card className="shadow-soft-sm">
          <CardContent className="flex flex-col gap-1">
            <span className="mb-1 text-small-label font-medium text-muted-foreground">
              Categories
            </span>
            {["All", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-[var(--radius-lg)] px-2.5 py-1.5 text-left text-caption transition-colors",
                  category === cat
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {cat}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-soft-sm lg:overflow-hidden">
          <CardHeader>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto lg:max-h-none lg:flex-1">
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-[var(--radius-lg)]" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents found"
                description="Try a different category or search term, or upload your first document."
              />
            ) : (
              <div className="flex flex-col gap-1">
                {filtered.map((doc) => {
                  const Icon = TYPE_ICONS[doc.type];
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedId(doc.id)}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-[var(--radius-lg)] px-3 py-2.5 text-left transition-colors",
                        selectedId === doc.id ? "bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate font-medium">{doc.title}</span>
                          <span className="text-small-label text-muted-foreground">
                            {doc.category} · {doc.size}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {doc.type}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft-sm">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Document details and actions</CardDescription>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="flex flex-col gap-4">
                <div className="flex aspect-4/3 items-center justify-center rounded-[var(--radius-lg)] bg-muted text-muted-foreground">
                  {React.createElement(TYPE_ICONS[selected.type], { className: "size-10" })}
                </div>
                <div>
                  <p className="font-medium">{selected.title}</p>
                  <p className="text-caption text-muted-foreground">
                    {selected.category} · {selected.size}
                  </p>
                  <p className="mt-1 text-small-label text-muted-foreground">
                    Uploaded by {selected.uploaderName} · {formatRelativeTime(selected.updated_at)}
                  </p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "mt-2 gap-1",
                      selected.index_status === "indexed" && "text-success",
                      selected.index_status === "failed" && "text-destructive",
                      selected.index_status === "indexing" && "text-info"
                    )}
                  >
                    {selected.index_status === "indexing" && <Loader2 className="size-3 animate-spin" />}
                    {selected.index_status === "indexed" && <Sparkles className="size-3" />}
                    {selected.index_status === "failed" && <AlertCircle className="size-3" />}
                    {INDEX_STATUS_LABEL[selected.index_status]}
                  </Badge>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  {(selected.index_status === "not_indexed" || selected.index_status === "failed") && (
                    <Button
                      variant="outline"
                      className="justify-start gap-2"
                      size="sm"
                      onClick={() => indexDocument(selected.id)}
                    >
                      <Sparkles className="size-4" />
                      {selected.index_status === "failed" ? "Retry indexing" : "Index for AI search"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    size="sm"
                    onClick={() => handleView(selected)}
                  >
                    <Eye className="size-4" />
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    className="justify-start gap-2"
                    size="sm"
                    onClick={() => setPendingDelete(selected)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-caption text-muted-foreground">
                Select a document to preview it here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this document?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be permanently removed from the knowledge base and Storage. This cannot be undone.`
            : ""
        }
        onConfirm={() => pendingDelete && handleDelete(pendingDelete)}
      />
    </div>
  );
}
