import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create a free, anonymous Thehrav account.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
