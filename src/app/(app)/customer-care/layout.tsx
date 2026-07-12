import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customer Care" };

export default function CustomerCareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
