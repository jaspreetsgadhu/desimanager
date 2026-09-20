"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Briefcase,
  Headset,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/chat-panel";
import { ChatInputBar } from "@/components/chat-input-bar";
import { useAuth } from "@/lib/auth-context";
import { useRagChat } from "@/hooks/use-rag-chat";

type AgentKey = "buddy" | "hr" | "customer-care" | "reporter";

const AGENTS: {
  key: AgentKey;
  icon: typeof Sparkles;
  title: string;
  description: string;
  status: string;
  prompts: string[];
}[] = [
  {
    key: "buddy",
    icon: Sparkles,
    title: "Buddy AI",
    description: "Ask anything about your company",
    status: "Available",
    prompts: [
      "What is our leave policy?",
      "How do I raise a customer refund?",
      "Summarize the Product Manual v3",
      "What's our remote work policy?",
    ],
  },
  {
    key: "hr",
    icon: Briefcase,
    title: "HR Manager AI",
    description: "Leave, attendance, HR policies",
    status: "Available",
    prompts: [
      "How many leave days do I have left?",
      "When is the next public holiday?",
      "What's our remote work policy?",
    ],
  },
  {
    key: "customer-care",
    icon: Headset,
    title: "Customer Care AI",
    description: "FAQs, escalation, tickets",
    status: "Available",
    prompts: [
      "How do I raise a customer refund?",
      "What's our escalation process?",
      "Summarize the Product Manual v3",
    ],
  },
  {
    key: "reporter",
    icon: BarChart3,
    title: "Reporter AI",
    description: "Usage summaries, analytics",
    status: "Available",
    prompts: ["Give me this week's AI usage summary"],
  },
];

export default function AiWorkspacePage() {
  const { user } = useAuth();
  const [activeAgentKey, setActiveAgentKey] = React.useState<AgentKey>("buddy");
  const activeAgent = AGENTS.find((a) => a.key === activeAgentKey)!;
  const chat = useRagChat({ agent: activeAgentKey, assistantName: activeAgent.title });

  function selectAgent(key: AgentKey) {
    setActiveAgentKey(key);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {!chat.hasConversation ? (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8">
          <div className="text-center">
            <h1 className="text-page-title">AI Workspace</h1>
            <p className="text-caption text-muted-foreground">
              One workspace, four specialized AI agents — click one to chat directly with it, or ask
              Buddy AI and it will route you automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((agent, index) => (
              <motion.div
                key={agent.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04, ease: "easeOut" }}
              >
                <button type="button" className="w-full text-left" onClick={() => selectAgent(agent.key)}>
                  <Card
                    className={`shadow-soft-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-soft-md ${
                      activeAgentKey === agent.key ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="mb-1 flex size-9 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-primary">
                        <agent.icon className="size-5" />
                      </div>
                      <CardTitle className="text-card-title">{agent.title}</CardTitle>
                      <CardDescription>{agent.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <Badge variant="secondary" className="gap-1 text-success">
                        <span className="size-1.5 rounded-full bg-success" />
                        {agent.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </button>
              </motion.div>
            ))}
          </div>

          {activeAgentKey !== "buddy" && (
            <div className="flex items-center justify-center gap-2 text-caption text-muted-foreground">
              <span>
                Chatting with <span className="font-medium text-foreground">{activeAgent.title}</span>
              </span>
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => selectAgent("buddy")}>
                <ArrowLeft className="size-3.5" />
                Back to Buddy AI
              </Button>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            {activeAgent.prompts.map((prompt) => (
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
            placeholder={`Ask ${activeAgent.title} anything...`}
          />
        </div>
      ) : (
        <ChatPanel
          messages={chat.messages}
          streamingText={chat.streamingText}
          userName={user?.name ?? "You"}
          assistantName={activeAgent.title}
          input={chat.input}
          onInputChange={chat.setInput}
          onSubmit={chat.handleSubmit}
          onRegenerate={chat.regenerateLast}
        />
      )}
    </div>
  );
}
