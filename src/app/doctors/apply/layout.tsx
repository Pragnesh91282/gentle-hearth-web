import type { Metadata } from "next";
import SignInGuard from "@/components/SignInGuard";

export const metadata: Metadata = {
  title: { absolute: "Become a guide | Thehrav" },
  description: "Apply to give free, unhurried support on Thehrav as a doctor, clinical psychologist or listener.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignInGuard />
      {children}
    </>
  );
}
