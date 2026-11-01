import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our guides",
  description: "Verified doctors, clinical psychologists and listeners who give their time freely on Thehrav.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
