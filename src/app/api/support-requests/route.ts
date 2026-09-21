import { NextResponse } from "next/server";
import { evaluateSafety } from "@/lib/safetyAndIdentity";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseServerAuthClient } from "@/lib/supabaseServerAuth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const supportType = typeof body?.supportType === "string" ? body.supportType.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const consented = body?.consented === true;

  if (!supportType || !message || !consented) {
    return NextResponse.json({ error: "Choose a support option and share a message." }, { status: 400 });
  }

  if (message.length > 2000) {
    return NextResponse.json({ error: "Please keep your message under 2,000 characters." }, { status: 400 });
  }

  const safetyCheck = evaluateSafety(message);
  if (!safetyCheck.isValid) {
    return NextResponse.json({ error: safetyCheck.message, crisis: true }, { status: 400 });
  }

  const authClient = await createSupabaseServerAuthClient();
  if (!authClient) {
    return NextResponse.json(
      { error: "Authentication is not configured yet. Add the Supabase environment variables first." },
      { status: 503 },
    );
  }

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in before sending a support request." }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Support requests are not connected yet. Add the Supabase environment variables to enable submissions." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("support_requests").insert({
    patient_id: user.id,
    support_type: supportType,
    message,
    status: "open",
    consented_to_guidance: consented,
  });

  if (error) {
    return NextResponse.json({ error: "We could not save your request. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
