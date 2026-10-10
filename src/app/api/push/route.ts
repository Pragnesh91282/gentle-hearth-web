import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/apiAuth";

type Subscription = { endpoint: string; keys: { p256dh: string; auth: string } };

function readSubscription(body: unknown): Subscription | null {
  const sub = (body as { subscription?: Subscription } | null)?.subscription;
  const valid = typeof sub?.endpoint === "string" && sub.endpoint.startsWith("https://")
    && typeof sub.keys?.p256dh === "string" && typeof sub.keys?.auth === "string";
  return valid ? sub : null;
}

// Saves this device so the member gets phone notifications on it.
export async function POST(request: Request) {
  const subscription = readSubscription(await request.json().catch(() => null));
  if (!subscription) return jsonError("That notification subscription isn't valid.", 400);

  const { user, admin, response } = await requireUser();
  if (response) return response;

  // A device belongs to whoever signed in on it most recently.
  const { error } = await admin.from("push_subscriptions").upsert({
    endpoint: subscription.endpoint,
    user_id: user.id,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  });
  if (error) return jsonError("We could not turn on notifications.", 500);

  return NextResponse.json({ ok: true }, { status: 201 });
}

// Stops notifications on this device.
export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
  if (!endpoint) return jsonError("Missing device.", 400);

  const { user, admin, response } = await requireUser();
  if (response) return response;

  await admin.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
