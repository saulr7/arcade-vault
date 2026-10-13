# SPEC 03 — About page and contact form (Resend)

**Status:** implemented
**Depends on:** SPEC 01, SPEC 02
**Date:** 2026-10-12
**Objective:** Add an `/about` page (About + Contact sections) ported from `references/templates/home-about/about.jsx`, translated to English, whose contact form sends a real email to the team through Resend using a Server Action.

---

## Scope

### In

- New route `/about` (`app/about/page.tsx`) with the template's sections:
  - About hero: `// ABOUT` kicker, title, mission paragraph, 3 highlight cards with pixel icons (HEART, BROWSER, PLANT).
  - Animated divider banner (24 pixels between two bars).
  - Contact: intro column (kicker, title, subtitle, 3 tips with LEDs) and the contact form (name, email, message).
- Real email sending:
  - A Server Action in `app/about/actions.ts` receives the form, validates it on the server and sends the email with the `resend` SDK.
  - The email goes to `CONTACT_TO_EMAIL`, from `CONTACT_FROM_EMAIL`, with `replyTo` set to the visitor's email.
  - Environment variables: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. Documented in a committed `.env.example`; real values live in `.env.local` (git-ignored).
- Form states (Client Component `components/about/contact-form.tsx`):
  - Idle: three fields, submit button.
  - Client validation as in the template: name, email and message required (trimmed); empty submit triggers the `shake` animation and does not call the server.
  - Sending: button disabled and relabeled (e.g. "SENDING…") while the action runs.
  - Success: the template's "VAULT-OS // TERMINAL" success panel with the visitor's name, and an "SEND ANOTHER MESSAGE" button that resets the form.
  - Error: if validation fails on the server or Resend fails, an English error message is shown above the button, the typed values are kept, and the user can retry.
- Server-side protection: trim, email format check, max lengths (name 80, email 254, message 2000), and a hidden honeypot field; a filled honeypot returns success without sending.
- Navigation:
  - Nav: add About (`/about`) after Hall of Fame, in the desktop bar and the mobile panel. Active only on `/about`.
  - Footer: add an About link.
- Template CSS for the About page ported into `app/globals.css` (only rules that do not already exist), including `.shake`, `.terminal-success` and the divider.
- Reuse of the existing `components/reveal.tsx` for scroll reveal (`.reveal` → `.in`), keeping content visible without JS and with reduced motion, as in SPEC 02.
- All copy translated from Spanish to English.

### Not in

- Persisting messages: no database, no `localStorage`/`sessionStorage`, no message log. Resend is the only record.
- Rate limiting, CAPTCHA or any anti-abuse beyond the honeypot and length limits.
- Sending a confirmation email to the visitor.
- HTML-templated emails (React Email). The email body is plain text.
- An API route (`/api/contact`). The Server Action is the only entry point.
- A separate `/contact` route.
- Real authentication, an admin inbox, or reading messages in the app.
- Changes to the homepage or to the SPEC 01 screens beyond the nav and footer links.
- Tests, SEO/metadata beyond the page title, light theme.

---

## Data model

No persisted data. One typed result shape shared by the action and the form, and the environment contract:

```ts
// app/about/actions.ts
type ContactResult = { ok: true; name: string } | { ok: false; error: string }; // English, user-facing

async function sendContactMessage(formData: FormData): Promise<ContactResult>;
```

```bash
# .env.example
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
```

Email shape:

- Subject: `[Arcade Vault] New message from {name}`
- Body (plain text): name, email, then the message.
- `replyTo`: the visitor's email.

Conventions:

- Form field names: `name`, `email`, `message`, plus the honeypot `website` (hidden, must stay empty).
- Missing env vars at send time return `{ ok: false, error }` with a generic message; the env var names are never exposed to the client.
- The API key is read only on the server and never reaches a Client Component.

---

## Implementation plan

Each step leaves the app building and running.

1. **Read the docs.** Read the relevant guides in `node_modules/next/dist/docs/` (Server Actions / forms, `useActionState` or `useTransition`, Client Components, environment variables, `cacheComponents`) before writing code, per `AGENTS.md`. Read the Resend Node.js SDK docs for `emails.send`. Use the `frontend-design` skill for the UI work, per `CLAUDE.md`.
2. **Dependency and env.** `npm install resend`. Create `.env.example` with the three variables. Confirm `.env*.local` is git-ignored.
3. **Styles.** Diff `references/templates/home-about/styles.css` (About section onward) against `app/globals.css`. Port only the missing rules: about hero, highlights, divider, contact grid, tips, form extras, `.shake`, terminal success, responsive rules.
4. **About sections.** Create `components/about/` with the hero (+ highlight icons) and the divider as Server Components, and the intro column. Replace nothing in the nav yet.
5. **About page.** Create `app/about/page.tsx` composing the sections with `Reveal`, and a placeholder form that is not wired yet. `/about` renders.
6. **Server Action.** Create `app/about/actions.ts` with `sendContactMessage`: honeypot check, validation, env check, Resend call, mapped `ContactResult`. Errors from Resend are logged server-side only.
7. **Contact form.** Create `components/about/contact-form.tsx` (Client Component): fields, client validation with shake, sending state, error message, terminal success panel, reset button. Wire it into the page.
8. **Nav and footer.** Add About to `components/nav.tsx` (desktop and mobile, active only on `/about`) and a link in `components/footer.tsx`.

---

## Acceptance criteria

- [ ] `npm run build` and `npm run lint` pass with no errors.
- [ ] `/about` renders the About hero, the 3 highlights, the divider and the Contact section with no console errors.
- [ ] Submitting with any empty or whitespace-only field shakes the form and does not call the server action.
- [ ] With valid values and a valid `.env.local`, submitting delivers an email to `CONTACT_TO_EMAIL` with subject `[Arcade Vault] New message from {name}`, plain-text body containing name, email and message, and `Reply-To` equal to the visitor's email.
- [ ] After a successful send, the terminal success panel shows the visitor's name in uppercase; "SEND ANOTHER MESSAGE" returns to an empty form.
- [ ] While the action runs, the submit button is disabled and shows the sending label.
- [ ] If Resend fails (e.g. invalid `RESEND_API_KEY`), an English error message appears, the typed values remain, and a retry is possible.
- [ ] If any of the three env vars is missing, the form shows the generic error and the server logs the cause; no env var name appears in the browser.
- [ ] The server rejects an invalid email, a name over 80 chars, a message over 2000 chars and an empty field, even if the client check is bypassed.
- [ ] A submission with the honeypot field filled shows success but sends no email.
- [ ] `RESEND_API_KEY` does not appear in the client bundle or in any response.
- [ ] Nav shows Home, Library, Hall of Fame, About; About is active only on `/about`; the same holds in the mobile panel. The footer has an About link.
- [ ] Sections below the fold gain the `in` class when scrolled into view; with `prefers-reduced-motion` enabled they are visible immediately; with JavaScript disabled the page content is still readable.
- [ ] No Spanish strings remain in the rendered UI.
- [ ] `.env.example` is committed and `.env.local` is git-ignored.
- [ ] No use of `localStorage`, `sessionStorage` or `app/api` routes in the new code.
- [ ] Visual check at 1440px and 390px shows no horizontal scroll and matches `references/templates/home-about/arcade-vault-standalone.html`.

---

## Decisions taken and discarded

- **Yes:** Resend for sending. The user chose it.
- **Yes:** Server Action with the `resend` SDK. Keeps the key on the server and avoids an API route plus a `fetch` layer. **No:** Route Handler `/api/contact`, more boilerplate for no gain.
- **Yes:** addresses in env vars (`CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`). No personal address in the repo and easy to switch between dev and production. **No:** hardcoded addresses.
- **Yes:** one page `/about` with both sections, as in the template. **No:** separate `/contact` route.
- **Yes:** nav and footer links. **No:** linking from the homepage; SPEC 02 stays untouched.
- **Yes:** template client validation plus server re-validation, an error state and a honeypot. The client check is not a security boundary. **No:** template-only behavior, because a real send needs failure handling.
- **Yes:** plain-text email with `replyTo` set to the visitor. **No:** React Email templates or a visitor confirmation email, deferred as unnecessary for now.
- **Yes:** no storage of messages; Resend's dashboard is the record.
- **Yes:** reuse `components/reveal.tsx` from SPEC 02 instead of a new observer.
- Per `CLAUDE.md`, UI work uses the `frontend-design` skill.

---

## Identified risks

- **Spam and abuse.** The form is public and each submit costs an email. Mitigated only by the honeypot and length limits; rate limiting or CAPTCHA is a follow-up spec if abuse appears.
- **Resend sender restrictions.** Without a verified domain, Resend only delivers from `onboarding@resend.dev` to the account owner's address. Use that pair in development; production needs a verified domain in `CONTACT_FROM_EMAIL`.
- **Secret leakage.** A mistake could import the action's env access into a Client Component. Mitigated by keeping `RESEND_API_KEY` reads inside `actions.ts` (`'use server'`) and the criterion checking the client bundle.
- **Header injection.** User input goes into the subject. Mitigated by stripping newlines from `name` before building the subject.
- **CSS collisions.** The template's `styles.css` is a superset of earlier styles. Port only missing rules (step 3).
- **Next.js 16.4 / `cacheComponents` differences.** Server Actions and form hooks may differ from older versions; mitigated by step 1.
