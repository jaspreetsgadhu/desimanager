"use client";

import * as React from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInputBar } from "@/components/chat-input-bar";
import type { ChatMessage as ChatMessageType } from "@/lib/mock-data";

interface ChatPanelProps {
  messages: ChatMessageType[];
  streamingText: string | null;
  userName: string;
  assistantName?: string;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onRegenerate: () => void;
  placeholder?: string;
}

export function ChatPanel({
  messages,
  streamingText,
  userName,
  assistantName,
  input,
  onInputChange,
  onSubmit,
  onRegenerate,
  placeholder,
}: ChatPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingText]);

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 py-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              userName={userName}
              assistantName={assistantName}
              onRegenerate={onRegenerate}
            />
          ))}
          {streamingText !== null && (
            <ChatMessage
              message={{ id: "streaming", role: "assistant", content: streamingText }}
              userName={userName}
              assistantName={assistantName}
              isStreaming
            />
          )}
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl pt-3">
        <ChatInputBar
          value={input}
          onChange={onInputChange}
          onSubmit={onSubmit}
          placeholder={placeholder}
        />
      </div>
    </>
  );
}
