import type { Metadata } from "next";
import SignInGuard from "@/components/SignInGuard";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignInGuard />
      {children}
    </>
  );
}
