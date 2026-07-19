# The Last Free Mission

Premium mobile-first bachelor party evaluation app for Martin "Martinka".

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Supabase
- PWA-ready manifest and service worker
- Vercel-ready

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=change-this-password
SITE_URL=https://thelastfreemission.hu
```

Use the Supabase service-role key only on the server. Do not expose it as a `NEXT_PUBLIC_*` variable.

## Supabase

Run [supabase/schema.sql](/Users/redeyrichard/Documents/Codex/2026-07-19/you-are-a-senior-full-stack/supabase/schema.sql) in the Supabase SQL editor.

The table is `public.groom_evaluations` and stores:

- `id`
- `created_at`
- `nickname`
- `looks`
- `style`
- `humor`
- `charisma`
- `beer_yes_no`
- `husband_index`
- `message_to_bride`

## Pages

- `/` - public NFC evaluation flow
- `/admin` - password-protected dashboard

## Admin Dashboard

The admin page shows:

- Total submissions
- Average Looks, Style, Humor, Charisma, Husband Index
- Beer Yes % and Beer No %
- Latest submissions
- Messages to the bride
- CSV export

## Deploy to Vercel

1. Push the project to GitHub.
2. Import the repo in Vercel.
3. Add the environment variables above.
4. Deploy.
5. Add `thelastfreemission.hu` as the production domain in Vercel.
6. Point the domain DNS to Vercel using Vercel's shown records.
7. Point the NFC card URL to `https://thelastfreemission.hu`.

## Production URL

- Public quiz: `https://thelastfreemission.hu`
- Admin dashboard: `https://thelastfreemission.hu/admin`

## Notes

If Supabase is not configured, the public quiz still shows a demo result after submit so the UI can be tested locally. Persistent storage and the admin dashboard require Supabase environment variables.
