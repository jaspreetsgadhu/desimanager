"use client";

import * as React from "react";
import type { ChatMessage, ChatCitation } from "@/lib/mock-data";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${idCounter}`;
}

interface UseRagChatOptions {
  agent: string;
  assistantName: string;
  endpoint?: string;
}

export function useRagChat({ agent, assistantName, endpoint = "/api/chat" }: UseRagChatOptions) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [streamingText, setStreamingText] = React.useState<string | null>(null);
  const [isStreaming, setIsStreaming] = React.useState(false);

  async function streamAnswer(question: string, historyOverride?: ChatMessage[]) {
    setStreamingText("");
    setIsStreaming(true);

    const history = (historyOverride ?? messages).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, message: question, history }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "Something went wrong");
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content: `Sorry, I ran into an error: ${errText}`,
            agent: assistantName,
          },
        ]);
        return;
      }

      let citations: ChatCitation[] = [];
      const citationsHeader = res.headers.get("X-Citations");
      if (citationsHeader) {
        try {
          citations = JSON.parse(decodeURIComponent(citationsHeader));
        } catch {
          citations = [];
        }
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamingText(full);
      }

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", content: full, citations, agent: assistantName },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: "Sorry, I couldn't reach the AI service. Please try again.",
          agent: assistantName,
        },
      ]);
    } finally {
      setStreamingText(null);
      setIsStreaming(false);
    }
  }

  function sendMessage(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isStreaming) return;
    const userMessage: ChatMessage = { id: nextId(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    streamAnswer(trimmed, [...messages, userMessage]);
  }

  function regenerateLast() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    streamAnswer(lastUser.content);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return {
    messages,
    input,
    setInput,
    streamingText,
    sendMessage,
    regenerateLast,
    handleSubmit,
    isStreaming,
    hasConversation: messages.length > 0 || streamingText !== null,
  };
}
