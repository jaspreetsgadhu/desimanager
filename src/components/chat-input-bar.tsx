"use client";

import * as React from "react";
import { Mic, Paperclip, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useVoice } from "@/lib/voice-context";

interface ChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
}

export function ChatInputBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask Buddy AI anything about your company...",
}: ChatInputBarProps) {
  const { isListening, startListening } = useVoice();

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-end gap-2 rounded-[var(--radius-card)] border border-border bg-card p-2 shadow-soft-sm"
    >
      <Button type="button" variant="ghost" size="icon" aria-label="Attach file">
        <Paperclip />
      </Button>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
          }
        }}
        placeholder={isListening ? "Listening..." : placeholder}
        className="max-h-32 min-h-9 flex-1 resize-none border-none bg-transparent shadow-none focus-visible:ring-0"
        rows={1}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Voice input"
        onClick={() => startListening((text) => onChange(text))}
        className={cn(isListening && "text-destructive")}
      >
        <Mic className={cn(isListening && "animate-pulse")} />
      </Button>
      <Button type="submit" size="icon" aria-label="Send message" disabled={!value.trim()}>
        <ArrowUp />
      </Button>
    </form>
  );
}
