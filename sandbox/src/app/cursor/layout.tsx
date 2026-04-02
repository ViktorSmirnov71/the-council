import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mini Cursor — The Council Sandbox",
  description: "Cursor-inspired editor layout demo (local only)",
};

export default function CursorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
