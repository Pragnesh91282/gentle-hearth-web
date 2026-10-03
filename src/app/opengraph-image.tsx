import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// The card shown when a link is shared on WhatsApp, Instagram, X, and others.
export const alt = `${SITE_NAME}: ${SITE_TAGLINE}. Free, anonymous, unhurried mental-health support in India.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "linear-gradient(135deg, #f7fbf8 0%, #e3f3ea 55%, #d1ede0 100%)",
          color: "#0f172a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="112" height="112" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#047857" />
            <path d="M24 7C14 7 8 12.5 8 19.5c0 2 .6 3.6 1.5 4.9C11 18 15 14 20 11.5c-4 3-7.3 7.2-8.8 12.8 1.3.8 2.9 1.2 4.8 1.2 6.5 0 8.6-6.4 8-18.5z" fill="#ecfdf5" />
          </svg>
          <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: -3, color: "#064e3b" }}>{SITE_NAME}</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 60, fontWeight: 700, letterSpacing: -1 }}>{`${SITE_TAGLINE}.`}</div>
        <div style={{ marginTop: 20, fontSize: 34, color: "#334155" }}>
          Free, anonymous, unhurried mental-health support in India.
        </div>
      </div>
    ),
    size,
  );
}
