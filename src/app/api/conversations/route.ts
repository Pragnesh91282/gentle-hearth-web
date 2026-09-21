import { NextResponse } from "next/server";
import { createSupabaseServerAuthClient } from "@/lib/supabaseServerAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const requestId = typeof body?.requestId === "string" ? body.requestId : "";
  const authClient = await createSupabaseServerAuthClient();
  const adminClient = getSupabaseServerClient();

  if (!authClient || !adminClient) {
    return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 });
  }

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { data: doctor } = await adminClient
    .from("doctor_profiles")
    .select("user_id, verification_status")
    .eq("user_id", user.id)
    .eq("verification_status", "verified")
    .maybeSingle();

  if (!doctor) {
    return NextResponse.json({ error: "Only verified doctors can accept support requests." }, { status: 403 });
  }

  const { data: supportRequest } = await adminClient
    .from("support_requests")
    .select("id, patient_id, status, claimed_by")
    .eq("id", requestId)
    .maybeSingle();

  if (!supportRequest || supportRequest.status !== "open" || supportRequest.claimed_by) {
    return NextResponse.json({ error: "This request is no longer available." }, { status: 409 });
  }

  const { data: conversation, error: conversationError } = await adminClient
    .from("conversations")
    .insert({ request_id: requestId, patient_id: supportRequest.patient_id, doctor_id: user.id })
    .select("id")
    .single();

  if (conversationError || !conversation) {
    return NextResponse.json({ error: "We could not start this conversation." }, { status: 500 });
  }

  const { error: updateError } = await adminClient
    .from("support_requests")
    .update({ status: "claimed", claimed_by: user.id })
    .eq("id", requestId)
    .eq("status", "open");

  if (updateError) {
    await adminClient.from("conversations").delete().eq("id", conversation.id);
    return NextResponse.json({ error: "We could not claim this request." }, { status: 500 });
  }

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
}
