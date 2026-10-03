import { NextResponse } from "next/server";
import { isValidUnsubscribe } from "@/lib/notify";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

// Signed links from reply emails turn those emails off without signing in.
async function unsubscribe(request: Request) {
  const params = new URL(request.url).searchParams;
  const userId = params.get("u") ?? "";
  const token = params.get("t") ?? "";
  const admin = getSupabaseServerClient();
  if (!admin || !userId || !isValidUnsubscribe(userId, token)) return false;

  const { error } = await admin.from("profiles").update({ email_notifications: false }).eq("id", userId);
  return !error;
}

// Clicked from the email.
export async function GET(request: Request) {
  const ok = await unsubscribe(request);
  return NextResponse.redirect(new URL(ok ? "/email-off" : "/account", request.url), 303);
}

// One-click unsubscribe from the mail app (List-Unsubscribe-Post).
export async function POST(request: Request) {
  const ok = await unsubscribe(request);
  return new NextResponse(null, { status: ok ? 200 : 400 });
}
