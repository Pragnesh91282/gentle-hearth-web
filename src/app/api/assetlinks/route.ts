import { NextResponse } from "next/server";

// Digital Asset Links: proves to Android that the Play Store app and this
// site belong together, so the app opens full-screen without a URL bar.
// Served at /.well-known/assetlinks.json (see next.config.ts). Set in Vercel:
//   ANDROID_PACKAGE_NAME       e.g. com.thehrav.app
//   ANDROID_CERT_FINGERPRINTS  SHA-256 fingerprints, comma-separated: the
//                              Play app signing key and the upload key
export function GET() {
  const packageName = process.env.ANDROID_PACKAGE_NAME?.trim();
  const fingerprints = (process.env.ANDROID_CERT_FINGERPRINTS ?? "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);

  const statements = packageName && fingerprints.length
    ? [{
        relation: ["delegate_permission/common.handle_all_urls"],
        target: { namespace: "android_app", package_name: packageName, sha256_cert_fingerprints: fingerprints },
      }]
    : [];

  return NextResponse.json(statements);
}
