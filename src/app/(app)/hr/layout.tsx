import type { Metadata } from "next";

export const metadata: Metadata = { title: "HR" };

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return children;
}
