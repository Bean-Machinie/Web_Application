# Web Application

A dashboard-style tool built with Vite, React, TypeScript, Tailwind CSS,
shadcn/ui and Supabase (database + email auth).

Styling is intentionally minimal — the design and UI components come later.

## Requirements

- Node.js 20.19 or newer
- A Supabase project

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from the template and fill in your Supabase credentials
   (Project Settings → API keys in the Supabase dashboard):

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | your project URL |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | your publishable (anon) key |

3. Apply the database schema — see below.

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open http://localhost:5173.

## Database

`supabase/migrations/` holds the SQL for this project. Run it once against your
Supabase project, either way:

- **Dashboard:** open the SQL Editor, paste the contents of each file in
  filename order, and run it.
- **Supabase CLI:** `supabase link --project-ref <ref>` then `supabase db push`.

The first migration creates a `profiles` table with one row per user, enables
row-level security so a user can only see and edit their own row, and adds a
trigger that inserts the profile automatically on signup.

Row-level security is what actually protects your data. This app is a
client-side SPA, so the route guard on `/app` only hides the UI — every table
you add should have RLS enabled and policies written for it.

## Auth

Supabase sends a confirmation email on signup by default, so a new account
cannot reach `/app` until the link is clicked. To skip that while developing,
turn off "Confirm email" under Authentication → Sign In / Providers → Email in
the Supabase dashboard.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Links to the dashboard and auth pages |
| `/login` | Email + password login |
| `/signup` | Account creation |
| `/app` | Dashboard shell — requires a signed-in user |

## Deploying

Client-side routing means the host must serve `index.html` for unknown paths,
otherwise a refresh on `/app` returns a 404. Most static hosts call this a SPA
fallback or rewrite rule.

## Layout

```
src/auth/        session context and the /app route guard
src/components/  UI components
src/lib/         Supabase client and utilities
src/pages/       one component per route
supabase/        SQL migrations
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | oxlint |
