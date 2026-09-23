import { NextResponse } from "next/server";
import { jsonError, requireModerator } from "@/lib/apiAuth";

export async function PATCH(request: Request, context: RouteContext<"/api/moderation/reports/[id]">) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (status !== "reviewing" && status !== "resolved") {
    return jsonError("Choose a valid report status.", 400);
  }

  const { admin, response } = await requireModerator();
  if (response) return response;

  const { data, error } = await admin.from("reports").update({ status }).eq("id", id).select("id");
  if (error || !data?.length) {
    return jsonError("We could not update this report.", error ? 500 : 404);
  }

  return NextResponse.json({ ok: true });
}
