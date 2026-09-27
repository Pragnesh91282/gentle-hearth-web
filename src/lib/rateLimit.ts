import type { SupabaseClient } from "@supabase/supabase-js";

type RateWindow = { seconds: number; max: number };

// Counts the user's recent rows. Only server routes can write these tables,
// so created_at is trustworthy and limits hold across serverless instances.
// Fails open: a counting error should never stop someone reaching support.
export async function isRateLimited(
  admin: SupabaseClient,
  table: "messages" | "support_requests" | "reports",
  userColumn: "sender_id" | "patient_id" | "reporter_id",
  userId: string,
  windows: RateWindow[],
) {
  const results = await Promise.all(
    windows.map(({ seconds }) =>
      admin
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq(userColumn, userId)
        .gte("created_at", new Date(Date.now() - seconds * 1000).toISOString()),
    ),
  );

  return results.some(({ count, error }, index) => !error && (count ?? 0) >= windows[index].max);
}
