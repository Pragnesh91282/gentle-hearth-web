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
| Doctors | `/doctors/apply`, `/inbox` | Apply for verification; once verified, see the open queue (urgent first) and accept requests |
| Moderators | `/moderation` | Verify or reject doctor applications, triage reports |

Real-time behaviour, all over Supabase Realtime:

- Requests, conversations, and messages update instantly; the inbox catches up after a reconnect and shows a Live/Reconnecting badge.
- Private `conversation:<id>` channels carry typing indicators and online presence. Only the two participants can join (see the `realtime.messages` policies).
- Unread counts, tab-title badges, and optional desktop alerts. Alerts never include message text.

Crisis language is never rejected. The request or message is saved and flagged **urgent**, patients see crisis resources immediately, and doctors see urgent items pinned to the top of their queue.

All writes go through the `/api` routes using the service role. Row-level security only allows reads, so safety checks, request limits, and claim/close state cannot be bypassed from the browser. Claiming a request is atomic (`claim_support_request`), so two doctors cannot accept the same request.

`/inbox`, `/doctors/apply`, and `/moderation` redirect to `/auth` when signed out and return after sign-in.

The service is not emergency care, diagnosis, or a replacement for licensed treatment. The app includes crisis guidance, consent checks, reports, blocks, verified-doctor policies, and privacy/terms pages as a product foundation.

## Project Structure

- `src/app` — app pages and layout
- `src/app/api` — all write endpoints (requests, conversations, messages, reports, doctor applications, moderation)
- `src/app/auth` — Supabase sign-in and account creation
- `src/app/inbox` — the live portal (`usePortal.ts` data + Realtime, `ChatPanel.tsx` chat, typing, presence, reports)
- `src/app/doctors/apply` — doctor application and profile
- `src/app/moderation` — moderator console
- `src/app/privacy` and `src/app/terms` — trust and consent pages
- `src/components` — site header and crisis resources
- `src/lib/apiAuth.ts` — shared auth helpers for API routes
- `src/lib/safetyAndIdentity.ts` — crisis detection and support options
- `supabase/schema.sql` — accounts, requests, conversations, messages, reports, blocks, and RLS policies
- `supabase/portal.sql` — portal upgrade: tightened RLS, atomic claim/close, urgent flags, Realtime channel policies
- `public` — static assets

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deployment

This app is set up for deployment on Vercel.
