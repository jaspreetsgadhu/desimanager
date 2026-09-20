"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatPanel } from "@/components/chat-panel";
import { ChatInputBar } from "@/components/chat-input-bar";
import { ComplaintForm } from "@/components/complaint-form";
import { useRagChat } from "@/hooks/use-rag-chat";
import { getCustomerIdentity, type CustomerIdentity } from "@/lib/customer-identity";

const SUGGESTED_PROMPTS = [
  "My product arrived damaged",
  "I was charged the wrong amount",
  "My order never arrived",
];

export default function ComplaintPage() {
  const router = useRouter();
  const [identity, setIdentity] = React.useState<CustomerIdentity | null>(null);
  const [description, setDescription] = React.useState("");
  const chat = useRagChat({
    agent: "complaint",
    assistantName: "Complaint Assistant AI",
    endpoint: "/api/customer-chat",
  });

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
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push("/portal")}>
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-page-title">Submit a Complaint</h1>
        <p className="text-caption text-muted-foreground">
          Chat with our assistant to describe the issue, then submit the form below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex h-[28rem] flex-col rounded-[var(--radius-card)] border border-border p-3">
          {!chat.hasConversation ? (
            <div className="flex flex-1 flex-col justify-center gap-6">
              <p className="text-center text-caption text-muted-foreground">
                Tell us what happened and we&apos;ll help you describe it clearly.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
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
                placeholder="Describe what went wrong..."
              />
            </div>
          ) : (
            <ChatPanel
              messages={chat.messages}
              streamingText={chat.streamingText}
              userName={identity.name}
              assistantName="Complaint Assistant AI"
              input={chat.input}
              onInputChange={chat.setInput}
              onSubmit={chat.handleSubmit}
              onRegenerate={chat.regenerateLast}
              extraActionLabel="Use this in my complaint"
              onExtraAction={(content) => setDescription(content.trim())}
            />
          )}
        </div>

        <Card className="shadow-soft-sm">
          <CardHeader>
            <CardTitle>Complaint details</CardTitle>
            <CardDescription>
              Fill this in yourself, or use the assistant&apos;s draft on the left.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComplaintForm
              initialName={identity.name}
              initialContact={identity.contact}
              description={description}
              onDescriptionChange={setDescription}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
