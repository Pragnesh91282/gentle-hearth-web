# gentle-hearth-web

Gentle Hearth is a calm support platform connecting people seeking mental-health guidance with doctors and compassionate professionals.

This project is built with Next.js, Supabase, and a small safety utility module. The patient form submits requests through `/api/support-requests`.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser to view the app.

## Connect Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor (new projects only).
3. Run `supabase/portal.sql` (new and existing projects; safe to re-run).
4. Copy `.env.example` to `.env.local`.
5. Add the Supabase URL, anon key, and service-role key to `.env.local`.
6. Restart the development server.
7. Make yourself a moderator so you can verify doctors:

   ```sql
   update public.profiles set role = 'moderator'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never expose it in client-side code or commit `.env.local`. Add the same variables to the Vercel project settings for deployed submissions.

## Live portal

| Who | Where | What they can do |
| --- | --- | --- |
| Patients | `/patients`, `/inbox` | Send requests (max 3 open), withdraw them, chat live with their guide, report or block |
| Doctors | `/doctors/apply`, `/inbox` | Apply for verification; once verified, see the open queue (oldest first) and accept requests |
| Moderators | `/moderation` | Verify or reject doctor applications, triage reports |

Real-time behaviour, all over Supabase Realtime:

- Requests, conversations, and messages update instantly; the inbox catches up after a reconnect and shows a Live/Reconnecting badge.
- Private `conversation:<id>` channels carry typing indicators and online presence. Only the two participants can join (see the `realtime.messages` policies).
- Unread counts, tab-title badges, and optional desktop alerts. Alerts never include message text.

Gentle Hearth is calm, unhurried support, not a crisis service. Nothing is flagged urgent or prioritised, and guides reply in their own time. The home page, request form, terms, and privacy notice say the site is not for emergencies. If a member's own request or message mentions suicide or self-harm, it is still sent as normal, and only that member sees a gentle note pointing to Tele-MANAS and emergency services.

All writes go through the `/api` routes using the service role. Row-level security only allows reads, so safety checks, request limits, and claim/close state cannot be bypassed from the browser. Claiming a request is atomic (`claim_support_request`), so two doctors cannot accept the same request.

## Abuse protection

- **Rate limits** (`src/lib/rateLimit.ts`), counted in the database so they hold across Vercel instances: 15 messages/minute and 200/hour per member; 6 support requests/day on top of the 3-open cap; 10 reports/day.
- **CAPTCHA on sign-in and sign-up** with Cloudflare Turnstile through Supabase's built-in bot protection:
  1. Create a free Turnstile widget at dash.cloudflare.com → Turnstile, adding your domains (for example `gentle-hearth-web.vercel.app` and `localhost`).
  2. Put the **secret key** in Supabase → Authentication → Attack Protection → Enable Captcha protection → Cloudflare Turnstile.
  3. Put the **site key** in `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (in `.env.local` and Vercel), then redeploy.

  Without the site key the widget is hidden, which is fine locally as long as captcha is off in Supabase. Once captcha is on in Supabase, sign-in fails without the widget.

`/inbox`, `/doctors/apply`, `/moderation`, and `/account` redirect to `/auth` when signed out and return after sign-in.

## India launch basics

- **18+ only**: sign-up requires an 18+ declaration (stored as `age_confirmed_at` in the user's metadata), and every support request repeats it.
- **Emergency pointers**: Tele-MANAS (14416) and emergency (112), defined once in `src/lib/safetyAndIdentity.ts`.
- **Guide types**: guides apply as a registered doctor (NMC / State Medical Council), a registered clinical psychologist (RCI CRR number), or a listener (`src/lib/guides.ts`). Moderators must confirm they found a doctor's or psychologist's registration on the official register before verifying; the check is recorded in `registration_checked_at` / `registration_checked_by`. A registration number can back only one account. Patients see the guide's type, and for registered guides their name and registration number, in the directory and the chat. Guides verified before this change start as listeners until they add registration details and are re-verified.
- **Reports are kept**: deleting an account no longer deletes reports about it or by it. Links to the member, conversation, and message become null, while the copied message text and the reported member's name remain.
- **Account deletion**: members delete their account from `/account`. Guides who have accepted requests are removed by a moderator instead, because conversations keep a reference to them.
- **Grievance Officer** (`/grievance`), as the IT Rules 2021 require: set `GRIEVANCE_OFFICER_NAME` and `GRIEVANCE_OFFICER_EMAIL` in `.env.local` and Vercel, then redeploy. They are read at build time.

The service is not emergency care, diagnosis, or a replacement for licensed treatment. The app includes emergency pointers, consent checks, reports, blocks, verified-doctor policies, and privacy/terms pages as a product foundation.

## Project Structure

- `src/app` — app pages and layout
- `src/app/api` — all write endpoints (requests, conversations, messages, reports, doctor applications, moderation)
- `src/app/auth` — Supabase sign-in and account creation
- `src/app/inbox` — the live portal (`usePortal.ts` data + Realtime, `ChatPanel.tsx` chat, typing, presence, reports)
- `src/app/doctors/apply` — doctor application and profile
- `src/app/moderation` — moderator console
- `src/app/privacy` and `src/app/terms` — trust and consent pages
- `src/components` — site header and the emergency-services note
- `src/lib/apiAuth.ts` — shared auth helpers for API routes
- `src/lib/safetyAndIdentity.ts` — emergency pointers and support options
- `supabase/schema.sql` — accounts, requests, conversations, messages, reports, blocks, and RLS policies
- `supabase/portal.sql` — portal upgrade: tightened RLS, atomic claim/close, Realtime channel policies
- `public` — static assets

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deployment

This app is set up for deployment on Vercel.
