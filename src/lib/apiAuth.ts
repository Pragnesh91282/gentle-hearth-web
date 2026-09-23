import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerAuthClient } from "@/lib/supabaseServerAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

type RequireUserResult =
  | { user: User; admin: SupabaseClient; response?: never }
  | { user?: never; admin?: never; response: NextResponse };

// Resolves the signed-in user from the session cookie and returns a
// service-role client for writes. Callers return `response` when set.
export async function requireUser(): Promise<RequireUserResult> {
  const authClient = await createSupabaseServerAuthClient();
  const admin = getSupabaseServerClient();
  if (!authClient || !admin) {
    return { response: jsonError("Supabase is not configured yet.", 503) };
  }

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return { response: jsonError("Please sign in first.", 401) };
  }

  return { user, admin };
}

export async function requireModerator(): Promise<RequireUserResult> {
  const result = await requireUser();
  if (result.response) return result;

  const { data: profile } = await result.admin.from("profiles").select("role").eq("id", result.user.id).maybeSingle();
  if (profile?.role !== "moderator") {
    return { response: jsonError("Only moderators can do this.", 403) };
  }

  return result;
}
