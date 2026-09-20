"use client";

import * as React from "react";
import { Sparkles, ThumbsUp, ThumbsDown, Copy, RotateCcw, FileText, Volume2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useVoice } from "@/lib/voice-context";
import type { ChatMessage as ChatMessageType } from "@/lib/mock-data";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface ChatMessageProps {
  message: ChatMessageType;
  userName: string;
  assistantName?: string;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  extraActionLabel?: string;
  onExtraAction?: (content: string) => void;
}

export function ChatMessage({
  message,
  userName,
  assistantName = "Buddy AI",
  isStreaming,
  onRegenerate,
  extraActionLabel,
  onExtraAction,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const { speak } = useVoice();

  function copyResponse() {
    navigator.clipboard.writeText(message.content);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="flex gap-3">
      <Avatar className="size-8 shrink-0">
        {isUser ? (
          <AvatarFallback className="text-small-label">{initials(userName)}</AvatarFallback>
        ) : (
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="flex items-center gap-1.5 text-small-label font-medium text-muted-foreground">
          {isUser ? userName : message.agent ?? assistantName}
          {!isUser && message.agent && message.agent !== assistantName && (
            <Badge variant="secondary" className="text-small-label font-normal">
              Routed
            </Badge>
          )}
        </span>
        <div className="whitespace-pre-wrap text-base text-foreground">
          {message.content}
          {isStreaming && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary align-middle" />}
        </div>

        {!isUser && !isStreaming && message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.citations.map((citation) => (
              <Badge key={citation.title} variant="outline" className="gap-1">
                <FileText className="size-3" />
                {citation.title}
              </Badge>
            ))}
          </div>
        )}

        {!isUser && !isStreaming && onExtraAction && (
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExtraAction(message.content)}
            >
              {extraActionLabel ?? "Use this"}
            </Button>
          </div>
        )}

        {!isUser && !isStreaming && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Copy" onClick={copyResponse}>
              <Copy />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Regenerate" onClick={onRegenerate}>
              <RotateCcw />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Read aloud"
              onClick={() => speak(message.content)}
            >
              <Volume2 />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Good response"
              onClick={() => toast.success("Thanks for the feedback")}
            >
              <ThumbsUp />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Bad response"
              onClick={() => toast.success("Thanks for the feedback")}
            >
              <ThumbsDown />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
