# SPEC 02 — Homepage (landing page, design only)

**Status:** Approved
**Depends on:** SPEC 01
**Date:** 2026-10-12
**Objective:** Add the landing page from `references/templates/home-about/home.jsx` at `/`, visually faithful to the template and translated to English, and move the game library from `/` to `/games`.

---

## Scope

### In

- New homepage at `/` with the template's sections:
  - Hero: floating pixel silhouettes (8 inline SVGs), eyebrow, 3-line title, subtitle, two CTAs, scroll hint.
  - `// 01` Why Arcade Vault: 4 feature cards with pixel icons.
  - `// 02` Games available now: rail of the first 6 games from `GAMES`, plus a "VIEW ALL GAMES" button.
  - Stats strip: 3 blocks.
  - `// 03` Live activity: latest scores ticker and top players today.
  - `// 04` Pricing: single free plan card and 3 FAQ items.
  - Final CTA.
- Library moves from `/` to `/games` (new `app/games/page.tsx`, which renders the existing `Library` component).
- Updates to existing links so nothing points to the wrong page after the move:
  - Detail page BACK TO THE VAULT, player BACK TO THE VAULT, hall of fame BACK TO THE LIBRARY, auth "Play as guest" → `/games`.
  - Nav: logo → `/`; links become Home (`/`), Library (`/games`), Hall of Fame (`/hall-of-fame`), in both the desktop bar and the mobile panel.
  - Active link: Home only on `/`; Library on `/games` and everything under it.
- Template CSS for the new sections ported into `app/globals.css` (only rules that do not already exist from SPEC 01).
- Scroll-reveal animation (`.reveal` → `.in` through `IntersectionObserver`) in a small Client Component or hook.
- All copy translated from Spanish to English. Numbers use `en-US` formatting. Time labels are English ("2 min ago").
- Static typed mock data for the activity ticker, top players, stats, features, pricing and FAQ.
- CTA routing:
  - EXPLORE GAMES, VIEW ALL GAMES, INSERT COIN → `/games`
  - CREATE ACCOUNT, START FREE → `/auth`
  - Mini game card → `/games/[id]`
  - VIEW HALL → `/hall-of-fame`

### Not in

- The About + Contact page (`about.jsx`) and any `/about` route or nav link. It goes in its own spec.
- Real data: the ticker, top players and stats are hardcoded and never update. No API routes, no database, no persistence of any kind.
- Real authentication or payments. The pricing card is marketing copy only; there is no checkout.
- Any change to the five SPEC 01 screens beyond the link updates listed above.
- Redirects from the old library URL. The old `/` simply becomes the homepage.
- Tests, SEO/metadata beyond the existing title, light theme.

---

## Data model

No persisted data. One new static, typed module with the homepage content, plus the existing `GAMES` from `lib/games.ts` (unchanged):

```ts
// lib/home.ts
type NeonColor = "cyan" | "magenta" | "green" | "yellow";

interface Feature {
  icon: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";
  title: string;
  description: string;
  color: NeonColor;
}

interface LiveScore {
  player: string;
  gameId: string; // key into GAMES; title is resolved from it
  score: number;
  ago: string; // e.g. "2 min ago"
  color: NeonColor;
}

interface TopPlayer {
  rank: number;
  player: string;
  score: number;
}

interface Stat {
  value: string;
  unit: string;
  sub: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

const FEATURES: Feature[]; // 4
const LIVE_SCORES: LiveScore[]; // 7
const TOP_PLAYERS: TopPlayer[]; // 5
const STATS: Stat[]; // 3
const PRICING_PERKS: string[]; // 6 bullet lines
const FAQ: FaqItem[]; // 3
```

Conventions:

- `LiveScore.gameId` must match an `id` in `GAMES`, so the ticker shows the same English titles as the library.
- The games rail uses `GAMES.slice(0, 6)`; no copy of game data in `lib/home.ts`.
- The first stat's number is derived from `GAMES.length` so it never contradicts the library.

---

## Implementation plan

Each step leaves the app building and running.

1. **Read the docs.** Read the relevant guides in `node_modules/next/dist/docs/` (routing and layouts, Client Components, `next/link`, `cacheComponents`) before writing code, per `AGENTS.md`. Use the `frontend-design` skill for the UI work, per `CLAUDE.md`.
2. **Move the library.** Create `app/games/page.tsx` rendering `Library`. Update the four BACK links and the auth guest link to `/games`, and the nav Library links to `/games`. `app/page.tsx` still renders `Library` at this point, so nothing is broken.
3. **Styles.** Diff `references/templates/home-about/styles.css` against `app/globals.css`. Port only the missing rules (home hero, silhouettes, section head, feature grid, mini rail, stats, activity, pricing, final CTA, `.reveal`, and the matching responsive rules). Do not overwrite rules from SPEC 01.
4. **Content data.** Create `lib/home.ts` with the types and data above, translated to English.
5. **Reveal hook.** Create `components/reveal.tsx` (Client Component) that observes `.reveal` elements and adds `.in` once visible. It skips the animation and shows everything when `prefers-reduced-motion` is set.
6. **Home sections.** Create `components/home/` with the hero (+ silhouettes), feature icons, games rail, stats, activity, pricing and final CTA. Keep each file a Server Component unless it needs state or effects.
7. **Home page.** Replace `app/page.tsx` with the homepage composed from step 6. Library is now only at `/games`.
8. **Nav.** Add the Home link and fix active states in `components/nav.tsx`, desktop and mobile.

---

## Acceptance criteria

- [ ] `npm run build` and `npm run lint` pass with no errors.
- [ ] `/` renders the hero, sections `// 01` to `// 04`, the stats strip and the final CTA, with no console errors.
- [ ] `/games` renders the library exactly as `/` did in SPEC 01 (8 cards, search, chips, empty state).
- [ ] EXPLORE GAMES, VIEW ALL GAMES and INSERT COIN navigate to `/games`; CREATE ACCOUNT and START FREE navigate to `/auth`; VIEW HALL navigates to `/hall-of-fame`.
- [ ] The games rail shows 6 cards, and each links to `/games/[id]` for its game.
- [ ] Every game title in the ticker matches a title in `GAMES`.
- [ ] No link in the app points to `/` except the logo and the Home nav item.
- [ ] BACK TO THE VAULT (detail, player), BACK TO THE LIBRARY (hall of fame) and "Play as guest" (auth) navigate to `/games`.
- [ ] Nav shows Home, Library, Hall of Fame. Home is active only on `/`; Library is active on `/games`, `/games/[id]` and `/games/[id]/play`; the same holds in the mobile panel.
- [ ] Sections below the fold start hidden and gain the `in` class when scrolled into view; with `prefers-reduced-motion` enabled they are visible immediately.
- [ ] With JavaScript disabled, the page content is still readable (nothing stays invisible).
- [ ] No Spanish strings remain in rendered UI, and numbers render with `en-US` separators (e.g. `312,840`).
- [ ] No `/about` route or About link exists.
- [ ] No use of `localStorage`, `sessionStorage` or API routes in the new code.
- [ ] Visual check at 1440px and 390px shows no horizontal scroll and matches `references/templates/home-about/arcade-vault-standalone.html`.

---

## Decisions taken and discarded

- **Yes:** homepage at `/`, library at `/games`. The user chose this. It reuses the existing `/games/[id]` namespace for a coherent URL tree.
- **No:** library at `/library`, or keeping it at `/` with the home at `/home`. Discarded by the user.
- **Yes:** homepage only. **No:** About + Contact in this spec. The user chose to defer it, so the nav carries three links and no About.
- **Yes:** static typed mock data in `lib/home.ts`, consistent with SPEC 01. **No:** deriving top players from `seededScores`, which adds coupling and less control over copy.
- **Yes:** port only the new CSS rules into `globals.css`. **No:** replacing `globals.css` with the template's `styles.css`, which risks regressions in the five existing screens.
- **Yes:** the first stat is derived from `GAMES.length` instead of the template's hardcoded "12+", because the library has 8 games and the page must not contradict it.
- **Yes:** pricing section and FAQ kept as in the template, as UI-only copy.
- **Yes:** `.reveal` content must stay visible without JS and with reduced motion. The template hides it until the observer fires.
- **No:** redirect from the old library URL. Nothing external links to it yet.
- Per `CLAUDE.md`, UI work uses the `frontend-design` skill.

---

## Identified risks

- **Broken links after the move.** Missed references to `/` would send users to the homepage instead of the library. Mitigated by step 2 and the "no link points to `/`" criterion; grep for `href="/"` to verify.
- **CSS collisions.** The template's `styles.css` is a superset of SPEC 01's styles and may redefine shared rules (`.btn`, `.card`, `.chip`). Mitigated by the diff in step 3; port only missing rules.
- **Hydration and flicker.** The reveal hook adds classes on the client. Keep initial server HTML identical and avoid `Math.random()` or `Date.now()` in rendered output.
- **Next.js 16.4 / `cacheComponents` differences.** Server/client boundaries may behave differently from older Next.js; mitigated by step 1.
