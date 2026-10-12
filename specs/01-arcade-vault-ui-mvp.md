# SPEC 01 — Arcade Vault UI MVP (design only)

**Status:** implemented
**Depends on:** none
**Date:** 2026-10-12
**Objective:** Port the five screens in `references/templates/` (library, game detail, player, auth, hall of fame) to Next.js App Router routes, visually faithful to the templates, translated to English, with no real functionality.

---

## Scope

### In

- Five screens as real App Router routes, plus the shared shell (nav, mobile menu, footer, CRT background/noise layers):
  - Library: `/`
  - Game detail: `/games/[id]`
  - Player: `/games/[id]/play`
  - Auth (sign in / create account): `/auth`
  - Hall of fame: `/hall-of-fame`
- Visual fidelity to `references/templates/styles.css` and the `.jsx` files (neon palette, pixel fonts, CRT frame, podium, game covers made of CSS).
- All UI copy translated from Spanish to English. Code identifiers are English.
- Mock data in a typed TS module, ported from `data.jsx` (games, categories, seeded leaderboard generator).
- UI-only interactions (local component state, nothing persisted):
  - Mobile menu open/close
  - Library: search box and category chips filter the mock list; empty state when nothing matches
  - Library: card tilt hover effect
  - Auth: sign-in / create-account tab switch (shows the email field)
  - Hall of fame: game tabs switch the displayed leaderboard and podium
  - Player: PAUSE/RESUME toggles the pause overlay; END opens the game-over modal; PLAY AGAIN closes it; SAVE SCORE swaps the button for the "score saved" message
- Responsive behavior present in the template (breakpoints at 720/840/900px).

### Not in

- Real authentication, sessions, user accounts. Form submit, "Play as guest", Google and GitHub buttons are links or no-ops. The nav always shows "Sign in".
- Persistence of any kind (`localStorage`, database, API routes). Scores are not saved.
- Any real game logic or canvas. The player shows the template's static arena (grid floor, enemies, ship).
- The template's fake score ticker, level-up logic, and the signed-in "your best" row in the hall of fame.
- Real leaderboards, play counts, credits counter logic (the "CREDITS · 03" badge is static text).
- Tests, i18n framework, SEO/metadata beyond a title, light theme.

---

## Data model

No persisted data. One static, typed module of mock data, ported from `references/templates/data.jsx`:

```ts
// lib/games.ts
type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
type GameColor = "cyan" | "magenta" | "green" | "yellow";

interface Game {
  id: string; // slug used in the route, e.g. "block-buster"
  title: string;
  short: string; // card description
  long: string; // detail page description
  cat: GameCategory;
  cover: string; // CSS class for the CSS-drawn cover, e.g. "cover-bricks"
  color: GameColor; // card button accent
  best: number;
  plays: string; // pre-formatted, e.g. "12.4K"
}

interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;
}

const GAMES: Game[]; // the 8 template games, English titles/copy
const CATEGORIES: ("ALL" | GameCategory)[];
function seededScores(seed: number, count?: number): ScoreRow[]; // deterministic
```

Game ids and titles are translated to English (e.g. BLOQUE BUSTER → BLOCK BUSTER). Numbers use `en-US` formatting.

---

## Implementation plan

Each step leaves the app building and running.

1. **Read the docs.** Read the relevant guides in `node_modules/next/dist/docs/` (routing, `next/font`, `cacheComponents`, `generateStaticParams`/dynamic params, Client Components) before writing code, per `AGENTS.md`.
2. **Foundation.** Port the theme tokens and global styles from `styles.css` into `app/globals.css` (keep the Tailwind v4 `@import` and `@theme inline` working). Load Press Start 2P, Courier Prime, and JetBrains Mono through `next/font/google` in `app/layout.tsx` and map them to the template's font variables. Add the `av-bg` / `av-noise` layers and update metadata (title "Arcade Vault").
3. **Mock data.** Create `lib/games.ts` with the types and data above, translated to English.
4. **Shell.** Create `components/nav.tsx` (Client Component: logo, links, static credits badge, Sign in button, hamburger + mobile panel) and a footer; wire both into `app/layout.tsx`. Active link is derived from `usePathname()`.
5. **Library** (`/`). `components/game-card.tsx` (tilt effect, Client Component) and `components/library.tsx` (hero, search, chips, grid, empty state). Replace `app/page.tsx`.
6. **Game detail** (`app/games/[id]/page.tsx`). Cover, tags, stats, PLAY NOW (link to `/games/[id]/play`), BACK TO THE VAULT (link to `/`), top-10 leaderboard from `seededScores`. Unknown id → `notFound()`.
7. **Player** (`app/games/[id]/play/page.tsx` + client component). HUD with static values, CRT frame with static arena, pause overlay, game-over modal with the UI-only states listed in Scope. EXIT links to the detail page; BACK TO THE VAULT links to `/`.
8. **Auth** (`app/auth/page.tsx` + client component). Card, tabs, fields, guest button (link to `/`), social buttons (no-op). Submit is prevented and does nothing.
9. **Hall of fame** (`app/hall-of-fame/page.tsx` + client component). Header, game tabs, podium, table with staggered row animation, BACK TO THE LIBRARY link.
10. **Verify.** Run `npm run lint` and `npm run build`; walk through every route at desktop and mobile widths against the templates (open `references/templates/Arcade Vault.html` side by side).

---

## Acceptance criteria

- [ ] `npm run build` and `npm run lint` pass with no errors.
- [ ] Routes `/`, `/games/[id]`, `/games/[id]/play`, `/auth`, `/hall-of-fame` all render without console errors.
- [ ] `/games/does-not-exist` returns the Next.js 404.
- [ ] The library shows 8 game cards; typing in search or selecting a category chip filters them; a query with no match shows the empty state.
- [ ] Every game card and its PLAY button link to that game's detail page; PLAY NOW on the detail page links to its player page.
- [ ] The detail page shows cover, tags, description, 3 stats, and a 10-row leaderboard whose top 3 rows are styled differently.
- [ ] In the player, PAUSE shows the overlay and RESUME hides it; END opens the game-over modal; SAVE SCORE shows "score saved" and nothing is written to storage; PLAY AGAIN closes the modal.
- [ ] The auth tab switch shows/hides the email field; submitting the form does not navigate or store anything.
- [ ] The hall of fame shows podium + table for the selected game, and switching tabs changes the data.
- [ ] Nav highlights the active section (Library also active on detail and player pages); the hamburger opens and closes the mobile panel at ≤ template mobile breakpoint.
- [ ] No Spanish strings remain in rendered UI.
- [ ] No use of `localStorage`, `sessionStorage`, or API routes anywhere in the code.
- [ ] Visual check at 1440px and 390px widths shows no horizontal scroll and matches the templates' layout.

---

## Decisions taken and discarded

- **Real App Router routes** instead of the template's hash-based single-page router. Gives shareable URLs and fits the framework. Discarded: porting the 1:1 hash router.
- **Visual UI state only** (menu, tabs, filters, pause, modal). Discarded: fake score ticker, fake login, saving scores to `localStorage`, because they are functionality and would need to be undone later.
- **Translate to English.** Consistent with the project docs. Discarded: keeping Spanish copy.
- **Port the CSS faithfully** (globals + `next/font`) instead of rewriting in Tailwind utilities, to avoid drifting from the template. Tailwind v4 stays available for future work.
- **Typed mock data module** (`lib/games.ts`) instead of inline data, so a future spec can swap it for a real data source with the same types.
- The signed-in "your best" row in the hall of fame is dropped, because there is no user in this MVP.
- Per the project's `CLAUDE.md`, UI work uses the `frontend-design` skill.

---

## Identified risks

- **Next.js 16.4 / `cacheComponents` differences.** Dynamic params and client/server boundaries may behave differently from older Next.js; mitigated by step 1 (read the bundled docs first).
- **Fidelity drift.** 950 lines of CSS with CSS-drawn covers; mitigated by the side-by-side check in step 10.
- **Hydration mismatches.** `seededScores` is deterministic, so it is safe on server and client. Avoid `Math.random()` and `Date.now()` in rendered output.
- **Global CSS vs. Tailwind preflight.** Template class names (`.btn`, `.card`, `.chip`) may conflict with Tailwind base styles; check after porting the styles.
