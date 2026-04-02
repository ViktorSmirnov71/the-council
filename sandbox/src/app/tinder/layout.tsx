import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swipe demo — The Council Sandbox",
  description: "Tinder-style card UI prototype (demo only, no accounts)",
};

export default function TinderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
