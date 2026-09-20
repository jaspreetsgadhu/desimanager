"use client";

import * as React from "react";
import { Headset, MessageCircle, Send, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ChatPanel } from "@/components/chat-panel";
import { ChatInputBar } from "@/components/chat-input-bar";
import { useAuth } from "@/lib/auth-context";
import { useRagChat } from "@/hooks/use-rag-chat";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { WHATSAPP_CONTACT, WHATSAPP_SEED_MESSAGES, type ChatMessage } from "@/lib/mock-data";
import type { ComplaintStatus, ComplaintCategory } from "@/lib/supabase/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ComplaintStatus, string> = {
  open: "bg-destructive/10 text-destructive",
  in_progress: "bg-warning/10 text-warning",
  resolved: "bg-success/10 text-success",
};

const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  product_defect: "Product defect",
  delivery: "Delivery issue",
  billing: "Billing issue",
  warranty: "Warranty claim",
  other: "Other",
};

const CUSTOMER_CARE_PROMPTS = [
  "How do I raise a customer refund?",
  "What's our escalation process?",
  "Summarize the Product Manual v3",
];

interface ComplaintRow {
  id: string;
  customer_name: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  priority: string;
  updated_at: string;
}

async function fetchChatAnswer(
  agent: string,
  message: string,
  history: { role: "user" | "assistant"; content: string }[]
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent, message, history }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Something went wrong");
    return { content: `Sorry, I ran into an error: ${text}`, citations: [] };
  }

  let citations: ChatMessage["citations"] = [];
  const header = res.headers.get("X-Citations");
  if (header) {
    try {
      citations = JSON.parse(decodeURIComponent(header));
    } catch {
      citations = [];
    }
  }

  const content = await res.text();
  return { content, citations };
}

export default function CustomerCarePage() {
  const { user } = useAuth();
  const chat = useRagChat({ agent: "customer-care", assistantName: "Customer Care AI" });
  const supabase = React.useMemo(() => createClient(), []);
  const [complaints, setComplaints] = React.useState<ComplaintRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("complaints")
        .select("id, customer_name, category, description, status, priority, updated_at")
        .order("updated_at", { ascending: false });
      if (error) {
        toast.error("Could not load complaints");
      } else {
        setComplaints(data ?? []);
      }
      setIsLoading(false);
    }
    load();
  }, [supabase]);

  if (chat.hasConversation) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <ChatPanel
          messages={chat.messages}
          streamingText={chat.streamingText}
          userName={user?.name ?? "You"}
          assistantName="Customer Care AI"
          input={chat.input}
          onInputChange={chat.setInput}
          onSubmit={chat.handleSubmit}
          onRegenerate={chat.regenerateLast}
          placeholder="Ask Customer Care AI about FAQs, refunds, tickets..."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-page-title">Customer Care</h1>
        <p className="text-caption text-muted-foreground">
          Product FAQs, escalation handling, and customer complaints.
        </p>
      </div>

      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageCircle className="size-4" />
            Live Chat
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-1.5">
            <Smartphone className="size-4" />
            WhatsApp Simulation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex flex-col gap-6">
          <Card className="shadow-soft-sm">
            <CardHeader>
              <CardTitle>Customer Complaints</CardTitle>
              <CardDescription>Complaints submitted by customers through the portal</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {isLoading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-[var(--radius-lg)]" />
                  ))}
                </div>
              ) : complaints.length === 0 ? (
                <EmptyState
                  icon={Headset}
                  title="No complaints yet"
                  description="Complaints submitted by customers through the portal will show up here."
                />
              ) : (
                complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{complaint.description}</span>
                      <span className="text-caption text-muted-foreground">
                        {complaint.customer_name} · {CATEGORY_LABELS[complaint.category]} ·{" "}
                        {formatRelativeTime(complaint.updated_at)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-small-label font-medium text-muted-foreground">
                        {complaint.priority}
                      </span>
                      <Badge variant="secondary" className={STATUS_STYLES[complaint.status]}>
                        {complaint.status.replace("_", " ")}
                      </Badge>
                      {complaint.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.info("Escalation not implemented in demo")}
                        >
                          Escalate
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headset className="size-4" />
                Ask Customer Care AI
              </CardTitle>
              <CardDescription>Get instant answers about FAQs, refunds, and policies</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {CUSTOMER_CARE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => chat.sendMessage(prompt)}
                    className="rounded-full border border-border px-3 py-1.5 text-caption text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <ChatInputBar
                value={chat.input}
                onChange={chat.setInput}
                onSubmit={chat.handleSubmit}
                placeholder="Ask Customer Care AI about FAQs, refunds, tickets..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppSimulation />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WhatsAppSimulation() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(WHATSAPP_SEED_MESSAGES);
  const [input, setInput] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const idCounter = React.useRef(messages.length);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    idCounter.current += 1;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { id: `wa-${idCounter.current}`, role: "user", content: trimmed }]);
    setInput("");
    setIsSending(true);

    const { content, citations } = await fetchChatAnswer("customer-care", trimmed, history);
    idCounter.current += 1;
    setMessages((prev) => [
      ...prev,
      {
        id: `wa-${idCounter.current}`,
        role: "assistant",
        content,
        citations,
        agent: "Customer Care AI",
      },
    ]);
    setIsSending(false);
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col overflow-hidden rounded-[var(--radius-card)] border-8 border-foreground/80 bg-[#e5ddd5] shadow-soft-lg">
      <div className="flex items-center gap-2 bg-[#075e54] px-3 py-2.5 text-white">
        <div className="flex size-8 items-center justify-center rounded-full bg-white/20 text-sm font-medium">
          {WHATSAPP_CONTACT.name[0]}
        </div>
        <div className="flex flex-col">
          <span className="text-caption font-medium">{WHATSAPP_CONTACT.name}</span>
          <span className="text-small-label opacity-80">{WHATSAPP_CONTACT.phone}</span>
        </div>
      </div>

      <div className="flex h-96 flex-col gap-2 overflow-y-auto p-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.role === "user" ? "justify-start" : "justify-end")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-2.5 py-1.5 text-caption shadow-soft-sm",
                message.role === "user" ? "bg-white text-foreground" : "bg-[#dcf8c6] text-foreground"
              )}
            >
              {message.content}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-1 text-small-label text-muted-foreground">
                  Source: {message.citations[0].title}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex items-center gap-2 bg-white p-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon" aria-label="Send WhatsApp message" disabled={!input.trim() || isSending}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
