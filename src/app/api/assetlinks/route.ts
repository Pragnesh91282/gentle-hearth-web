import { NextResponse } from "next/server";

// Digital Asset Links: proves to Android that the Play Store app and this
// site belong together, so the app opens full-screen without a URL bar.
// Served at /.well-known/assetlinks.json (see next.config.ts). Set in Vercel:
//   ANDROID_PACKAGE_NAME       e.g. com.thehrav.app
//   ANDROID_CERT_FINGERPRINTS  SHA-256 fingerprints, comma-separated: the
//                              Play app signing key and the upload key
export function GET() {
  const packageName = process.env.ANDROID_PACKAGE_NAME?.trim();
  // Accepts the value pasted on its own or copied from an assetlinks.json
  // array (["AB:CD:…"]); brackets and quotes are ignored.
  const fingerprints = [...new Set((process.env.ANDROID_CERT_FINGERPRINTS ?? "")
    .replace(/[[\]"'\s]/g, "")
    .split(",")
    .map((value) => value.toUpperCase())
    .filter((value) => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(value)))];

  const statements = packageName && fingerprints.length
    ? [{
        relation: ["delegate_permission/common.handle_all_urls"],
        target: { namespace: "android_app", package_name: packageName, sha256_cert_fingerprints: fingerprints },
      }]
    : [];

  return NextResponse.json(statements);
}
