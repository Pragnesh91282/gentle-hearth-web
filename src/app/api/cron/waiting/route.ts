import { NextResponse } from "next/server";
import { jsonError } from "@/lib/apiAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { careForWaitingRequests } from "@/lib/waiting";

// Run daily by Vercel Cron (vercel.json), which sends the CRON_SECRET.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonError("Not allowed.", 401);
  }
  const admin = getSupabaseServerClient();
  if (!admin) return jsonError("Supabase is not configured yet.", 503);

  const result = await careForWaitingRequests(admin);
  return NextResponse.json(result);
}
