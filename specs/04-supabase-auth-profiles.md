# SPEC 04 — Supabase foundation, email/password auth and profiles

**Status:** Draft
**Depends on:** SPEC 01, SPEC 03
**Date:** 2026-10-14
**Objective:** Connect the app to Supabase with the `@supabase/ssr` clients and session refresh in `proxy.ts`, create a `profiles` table, and make the existing `/auth` screen perform real email/password sign-up, sign-in and sign-out, with the nav reflecting the signed-in user.

---

## Scope

### In

- Supabase foundation:
  - Dependencies `@supabase/supabase-js` and `@supabase/ssr`.
  - Browser client, server client and session-refresh helper under `lib/supabase/`.
  - Root `proxy.ts` that refreshes the auth session on each request (Next.js 16 name for middleware).
  - Env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, documented in the committed `.env.example`.
  - Generated TypeScript types for the database in `lib/supabase/database.types.ts`.
- Database (project `ktqxockyaftlzcynvsff`), applied as a migration through the Supabase MCP and kept in `supabase/migrations/`:
  - `public.profiles` table with RLS enabled.
  - Trigger that creates the profile row when a user signs up, reading `username` from the sign-up metadata.
- Real auth in `components/auth-form.tsx` and a new `app/auth/actions.ts` (Server Actions):
  - Sign in: email + password.
  - Create account: username + email + password. The username goes in the sign-up metadata.
  - States: idle, submitting (button disabled and relabeled), error (English message above the button, typed values kept).
  - Server-side validation: username 3–16 chars of `A-Z a-z 0-9 _`, valid email, password at least 8 chars.
  - Username availability pre-check against `profiles` for a friendly "username taken" message.
  - On success, redirect to `/games`.
- Sign out: Server Action that ends the session and redirects to `/`.
- Visiting `/auth` while signed in redirects to `/games`.
- Nav (`components/nav.tsx`), desktop and mobile: signed out shows the current "Sign In" link. Signed in shows the username and a SIGN OUT button instead.
- "PLAY AS GUEST" keeps working. Every route stays public.
- The GOOGLE and GITHUB buttons on `/auth` become visibly disabled, because OAuth is out of scope.
- Manual dashboard prerequisite: "Confirm email" is disabled for the email provider, so sign-up signs the user in immediately.

### Not in

- OAuth (Google/GitHub) and magic links.
- Email confirmation, password reset, change email/password, and account deletion.
- Route protection. No page requires login, and guest play is unchanged.
- Migrating `GAMES` to the database, saving scores, or a live Hall of Fame. Games and scores stay mocked, in their own specs.
- Editing a profile, avatars, or any profile page. The username is set at sign-up and not editable.
- The `CREDITS · 03` counter stays a static label.
- Rate limiting, CAPTCHA and custom SMTP.
- Supabase CLI local stack and Docker.
- Tests and SEO.
- Changes to the homepage, About or contact flow (SPEC 02 and 03), beyond the nav.

---

## Data model

One new table, one trigger function, and typed env access. Nothing else is persisted.

```sql
-- supabase/migrations/<timestamp>_create_profiles.sql
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,16}$'),
  created_at timestamptz not null default now()
);

create unique index profiles_username_lower_key on public.profiles (lower(username));

alter table public.profiles enable row level security;

-- Usernames are public (future leaderboards will show them).
create policy "Profiles are readable by everyone"
  on public.profiles for select using (true);
-- No insert/update/delete policies: rows are created only by the trigger.

create function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

```ts
// app/auth/actions.ts
type AuthResult = { ok: false; error: string }; // English, user-facing. Success redirects.

async function signIn(formData: FormData): Promise<AuthResult>;
async function signUp(formData: FormData): Promise<AuthResult>; // fields: username, email, password
async function signOut(): Promise<void>;
```

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Conventions:

- Only the publishable key is used in the app. No service-role or secret key in the repo, the client bundle or env files.
- Form field names: `username`, `email`, `password`.
- The username is unique case-insensitively but is displayed as typed.
- The trigger is the source of truth for profile creation. If `username` is missing or invalid, the insert fails and so does the sign-up.
- Auth errors from Supabase are mapped to short English messages. Raw error text is logged server-side only.
- Types come from the MCP `generate_typescript_types`, not hand-written. Re-generate whenever the schema changes.

---

## Implementation plan

Each step leaves the app building and running.

1. **Read the docs.** Read in `node_modules/next/dist/docs/` the guides for `proxy` (file convention and API reference), `authentication`, Server Actions / forms, and `cacheComponents` (request-time APIs like `cookies()` and `Suspense`). Read the Supabase docs for SSR with Next.js through the MCP `search_docs`. Use the `frontend-design` skill for the UI work, per `CLAUDE.md`.
2. **Dashboard prerequisite.** In the Supabase dashboard, disable "Confirm email" for the email provider. This is a manual step and the spec cannot be verified without it.
3. **Dependencies and env.** `npm install @supabase/supabase-js @supabase/ssr`. Get the project URL and publishable key with the MCP (`get_project_url`, `get_publishable_keys`), write them to the local env file, and add the two variable names to `.env.example`. Remove the stray bare `SUPABASE` entry from the local env file if it is unused.
4. **Migration.** Apply the profiles migration with `apply_migration`, save the same SQL in `supabase/migrations/`, then run `get_advisors` (security) and fix any RLS or function warning. Generate `lib/supabase/database.types.ts` with `generate_typescript_types`.
5. **Clients and proxy.** Create `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server, cookie-based) and `lib/supabase/proxy.ts` (session refresh helper), plus the root `proxy.ts` that calls it with a matcher excluding static assets. All clients use the `Database` type.
6. **Server Actions.** Create `app/auth/actions.ts` with `signIn`, `signUp` and `signOut`: validation, username pre-check, Supabase call, error mapping, redirect on success.
7. **Auth form.** Update `components/auth-form.tsx`: sign in uses email + password; create account uses username + email + password; submitting and error states; the social buttons disabled. `app/auth/page.tsx` redirects to `/games` when a session exists.
8. **Nav.** Provide the current username to `components/nav.tsx` from a server-side wrapper (request-time access under `Suspense`, as `cacheComponents` requires). Show username + SIGN OUT when signed in and the current Sign In link otherwise, in the desktop bar and the mobile panel.

---

## Acceptance criteria

- [ ] `npm run build` and `npm run lint` pass with no errors.
- [ ] `.env.example` lists `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the real values are not committed. `git grep` finds no Supabase key in tracked files.
- [ ] `public.profiles` exists with RLS enabled, the select policy, the unique index on `lower(username)`, and the `on_auth_user_created` trigger. `get_advisors` (security) reports no RLS-disabled table and no mutable-search-path function.
- [ ] Creating an account with a valid username, email and password signs the user in, redirects to `/games`, and leaves exactly one `profiles` row whose `id` equals the new `auth.users.id` and whose `username` is what was typed.
- [ ] Creating an account with a taken username (compared case-insensitively) shows an English error, creates no user, and keeps the typed values.
- [ ] The server rejects a username shorter than 3, longer than 16 or with characters outside `A-Z a-z 0-9 _`, an invalid email and a password under 8 chars, even if the client is bypassed.
- [ ] Signing in with the right credentials redirects to `/games`. Wrong credentials show a generic English error and no session is created.
- [ ] While an auth action runs, the submit button is disabled and relabeled.
- [ ] Signed in, the nav (desktop and mobile) shows the username and SIGN OUT instead of Sign In. SIGN OUT ends the session, redirects to `/`, and the nav shows Sign In again.
- [ ] The session survives a full page reload and navigation between pages.
- [ ] Visiting `/auth` while signed in redirects to `/games`. Signed out, `/auth` renders as before.
- [ ] "PLAY AS GUEST" still goes to `/games`, and every existing route still renders when signed out.
- [ ] The GOOGLE and GITHUB buttons are disabled and do nothing.
- [ ] With a client-side RLS check using the publishable key, `profiles` rows can be selected but not inserted, updated or deleted.
- [ ] No Supabase secret or service-role key appears in the client bundle, env files or responses. Only the publishable key does.
- [ ] No Spanish strings in the new UI, and no use of `localStorage` or `sessionStorage` for auth state.
- [ ] Visual check at 1440px and 390px shows no horizontal scroll on `/auth` and the nav, in both signed-in and signed-out states.

---

## Decisions taken and discarded

- **Yes:** scope is foundation + email/password auth + `profiles`. The user first chose "Foundation only", then confirmed this scope when the conflict was pointed out. **No:** migrating games and scores here. Each deserves its own spec.
- **Yes:** email + password only. It matches the existing `/auth` form. **No:** OAuth and magic links, which need provider apps, redirect URLs and a callback route.
- **Yes:** email confirmation disabled for now. No callback route and no email deliverability to debug. **No:** enabling it, since the default Supabase SMTP is heavily rate-limited. Revisit with a custom sender.
- **Yes:** `profiles` only, with the username from the sign-up form, created by a DB trigger. The trigger guarantees every user has a profile even if the app code changes. **No:** deriving the username from the email or an onboarding screen after first sign-in.
- **Yes:** usernames are publicly readable. Leaderboards will need them. **No:** per-user-only select.
- **Yes:** no insert/update/delete policies, so the client cannot write profiles. The username is immutable for now.
- **Yes:** guests are still allowed and no route is gated, so SPEC 01 behavior is unchanged. **No:** gating `/games/[id]/play`.
- **Yes:** migrations through the Supabase MCP against the remote project, with the SQL kept in `supabase/migrations/`. **No:** the local CLI stack, which is more setup for a single small table.
- **Yes:** `@supabase/ssr` with cookie sessions and a `proxy.ts` refresh. **No:** `localStorage` sessions, which Server Components cannot read.
- **Yes:** the sign-in form changes from username to email. The mock used a username for both tabs, but real sign-in is by email. This is a consequence of choosing email/password, not a separately confirmed decision, so review it.
- **Yes:** the social buttons stay visible but disabled, so the layout is unchanged and the intent is clear. This is a default, not a confirmed decision, so review it.
- **Yes:** the publishable key only. No secret key is needed for any step here.
- Per `CLAUDE.md`, UI work uses the `frontend-design` skill.

---

## Identified risks

- **`cacheComponents` and request-time data.** Reading cookies for the nav makes part of the layout dynamic. Reading the user outside `Suspense` can fail the build or de-optimize every page. Mitigated by step 1 and by isolating the user lookup in a small wrapper under `Suspense`.
- **Proxy is not authorization.** `proxy.ts` only refreshes the session. Server code must use `supabase.auth.getUser()` and not trust the cookie alone. Nothing is protected yet, but later specs must not rely on the proxy for access control.
- **Sign-up trigger failures.** A failing trigger blocks user creation with a generic "Database error saving new user". Mitigated by validating and pre-checking the username in the action, and by the acceptance criterion on the taken username. There is still a race between two simultaneous sign-ups with the same name, which then surfaces as a generic error.
- **User enumeration.** The username pre-check reveals which usernames exist. This is acceptable because usernames are public by design. Sign-in errors stay generic.
- **Confirmation setting is manual.** If "Confirm email" is left enabled, sign-up will not create a session and the criteria will fail. Mitigated by making it explicit step 2.
- **Remote project is the only environment.** Migrations and test users hit the real project. Use clearly named throwaway test accounts and delete them after verification.
- **Secret leakage.** The MCP can reveal the secret keys. Only the publishable key goes in env files.
- **Stale generated types.** `database.types.ts` can drift from the schema. Re-generate after any migration.
- **Next.js 16.4 differences.** `proxy.ts` replaces `middleware.ts` and Server Action and cookie APIs may differ from older versions. Mitigated by step 1.
