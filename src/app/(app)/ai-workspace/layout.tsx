import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Workspace" };

export default function AiWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
