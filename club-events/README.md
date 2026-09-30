# CodeChef ABESEC Events (React + Bootstrap)

Run: `npm install && npm run dev`. Admin page: `/#/admin` (default password `admin123`).

**Demo mode (no setup):** data is stored in the browser's localStorage.

**Shared backend (Supabase, ~5 min):** create a free project, run `supabase.sql` in the SQL editor,
copy `.env.example` to `.env`, and fill in the project URL and anon key.

**Deploy:** push to GitHub, import the repo in Vercel or Netlify (build `npm run build`, output `dist`),
and add the same env vars in the host's settings.

Note: the admin password is checked in the browser, and the SQL policies are open, so this is fine for a demo
but not for sensitive data. Use Supabase Auth to lock it down properly.
