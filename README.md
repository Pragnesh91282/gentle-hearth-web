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
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Copy `.env.example` to `.env.local`.
4. Add the Supabase URL, anon key, and service-role key to `.env.local`.
5. Restart the development server.

The `/auth` page uses Supabase email/password authentication. The `/inbox` page listens to support requests, conversations, and messages through Supabase Realtime. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never expose it in client-side code or commit `.env.local`. Add the same variables to the Vercel project settings for deployed submissions.

The service is not emergency care, diagnosis, or a replacement for licensed treatment. The app includes crisis guidance, consent checks, reports, blocks, verified-doctor policies, and privacy/terms pages as a product foundation.

## Project Structure

- `src/app` — app pages and layout
- `src/app/api/support-requests` — support request endpoint
- `src/app/auth` — Supabase sign-in and account creation
- `src/app/inbox` — authenticated real-time requests and conversations
- `src/app/privacy` and `src/app/terms` — trust and consent pages
- `src/lib/safetyAndIdentity.ts` — identity-related helper logic
- `supabase/schema.sql` — accounts, requests, conversations, messages, reports, blocks, and RLS policies
- `public` — static assets

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deployment

This app is set up for deployment on Vercel.
