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
import { ChatPanel } from "@/components/chat-panel";
import { ChatInputBar } from "@/components/chat-input-bar";
import { useAuth } from "@/lib/auth-context";
import { useRagChat } from "@/hooks/use-rag-chat";
import {
  SUPPORT_TICKETS,
  WHATSAPP_CONTACT,
  WHATSAPP_SEED_MESSAGES,
  type TicketStatus,
  type TicketPriority,
  type ChatMessage,
} from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: "bg-destructive/10 text-destructive",
  pending: "bg-warning/10 text-warning",
  resolved: "bg-success/10 text-success",
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

const CUSTOMER_CARE_PROMPTS = [
  "How do I raise a customer refund?",
  "Summarize ticket TCK-4521",
  "What's our escalation process?",
];

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
          Product FAQs, escalation handling, and ticket summaries.
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
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Recent customer tickets and their status</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {SUPPORT_TICKETS.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{ticket.subject}</span>
                    <span className="text-caption text-muted-foreground">
                      {ticket.id} · {ticket.customer} · {ticket.updated}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("text-small-label font-medium", PRIORITY_STYLES[ticket.priority])}>
                      {ticket.priority}
                    </span>
                    <Badge variant="secondary" className={STATUS_STYLES[ticket.status]}>
                      {ticket.status}
                    </Badge>
                    {ticket.status !== "resolved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info(`${ticket.id} escalated to team lead (demo only)`)}
                      >
                        Escalate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-soft-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headset className="size-4" />
                Ask Customer Care AI
              </CardTitle>
              <CardDescription>Get instant answers about FAQs, refunds, and tickets</CardDescription>
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
