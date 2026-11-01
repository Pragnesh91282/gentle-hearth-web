import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share what's on your mind",
  description: "Write what feels heavy, in your own words. A verified guide will reply gently, for free.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
