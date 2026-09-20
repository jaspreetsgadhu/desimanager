"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/chat-panel";
import { ChatInputBar } from "@/components/chat-input-bar";
import { useRagChat } from "@/hooks/use-rag-chat";
import { getCustomerIdentity, type CustomerIdentity } from "@/lib/customer-identity";

const SUGGESTED_PROMPTS = [
  "How do I set up my product for the first time?",
  "What's included in the box?",
  "Where can I find the installation guide?",
];

export default function InstallHelpPage() {
  const router = useRouter();
  const [identity, setIdentity] = React.useState<CustomerIdentity | null>(null);
  const chat = useRagChat({
    agent: "install-help",
    assistantName: "Product Installation Help AI",
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
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push("/portal")}>
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
      </div>

      {!chat.hasConversation ? (
        <div className="flex flex-1 flex-col justify-center gap-8">
          <div className="text-center">
            <h1 className="text-page-title">Product Installation Help</h1>
            <p className="text-caption text-muted-foreground">
              Ask anything about setting up or installing your product.
            </p>
          </div>

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
            placeholder="Ask about installing or setting up your product..."
          />
        </div>
      ) : (
        <ChatPanel
          messages={chat.messages}
          streamingText={chat.streamingText}
          userName={identity.name}
          assistantName="Product Installation Help AI"
          input={chat.input}
          onInputChange={chat.setInput}
          onSubmit={chat.handleSubmit}
          onRegenerate={chat.regenerateLast}
        />
      )}
    </div>
  );
}
