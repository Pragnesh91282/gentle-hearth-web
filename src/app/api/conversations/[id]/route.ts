import { NextResponse } from "next/server";
import { createSupabaseServerAuthClient } from "@/lib/supabaseServerAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const authClient = await createSupabaseServerAuthClient();
  const adminClient = getSupabaseServerClient();
  if (!authClient || !adminClient) {
    return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 });
  }

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { data: conversation } = await adminClient
    .from("conversations")
    .select("id, patient_id, doctor_id")
    .eq("id", id)
    .maybeSingle();

  if (!conversation || (conversation.patient_id !== user.id && conversation.doctor_id !== user.id)) {
    return NextResponse.json({ error: "You cannot close this conversation." }, { status: 403 });
  }

  const { error } = await adminClient
    .from("conversations")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "active");

  if (error) {
    return NextResponse.json({ error: "We could not close this conversation." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
