import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const PUBLIC_PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/patients", priority: 0.9 },
  { path: "/doctors", priority: 0.8 },
  { path: "/doctors/apply", priority: 0.7 },
  { path: "/principles", priority: 0.6 },
  { path: "/pause", priority: 0.6 },
  { path: "/ground", priority: 0.6 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
  { path: "/grievance", priority: 0.3 },
  { path: "/delete-account", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map(({ path, priority }) => ({ url: `${SITE_URL}${path}`, priority }));
}
