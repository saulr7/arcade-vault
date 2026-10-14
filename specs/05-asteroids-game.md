# SPEC 05 — Asteroids: the first playable game

**Status:** approved
**Depends on:** SPEC 01
**Date:** 2026-10-14
**Objective:** Port the standalone Asteroids game from `references/started-games/02-asteroids/` to a typed module that runs inside the existing player page for the `rocks` catalog entry, with the platform HUD, PAUSE, END and GAME OVER modal wired to the real game state.

---

## Scope

### In

- Port of `game.js` to TypeScript under `lib/games/asteroids/`, with no globals, no `document.getElementById` and no dependency on `window` at import time:
  - Classes `Bullet`, `Asteroid`, `PowerUp`, `Ship`, `Particle` and the update/draw loop, with gameplay values unchanged (speeds, radii, points, cooldowns, power-up rules, 3 lives, level progression).
  - A small public API: create the game on a given canvas, `start`, `pause`, `resume`, `restart`, `end` and `destroy`.
  - Callbacks to the host: `onStateChange` (score, lives, level, triple-shot time left) and `onGameOver` (final score).
  - Keyboard input registered on `start` and removed on `destroy`. Arrows rotate and thrust, Space shoots. `preventDefault` on arrows and Space so the page does not scroll.
- Integration in `components/game-player.tsx` for the `rocks` game only:
  - The canvas renders inside the existing CRT screen (`.crt-screen`), replacing the decorative `.game-arena` for this game.
  - Responsive canvas: the logical size stays 800×600, and the displayed size scales to the CRT width with the 4:3 aspect ratio kept.
  - The platform HUD shows the real score, lives and level.
  - PAUSE/RESUME button and the `P` key toggle pause. The PAUSED overlay of the platform is reused.
  - The game auto-pauses when the tab or window loses focus, and stops cleanly when the player page unmounts (EXIT, navigation, route change).
  - END button ends the run and opens the GAME OVER modal with the real score.
  - When lives reach 0, the game stops and the GAME OVER modal opens with the final score.
  - PLAY AGAIN starts a fresh run in place, without reloading the route.
  - The in-canvas HUD, in-canvas GAME OVER overlay and Space-to-restart of the original are removed. The platform HUD and modal replace them.
- Visual style of the canvas is kept from the original: white wireframe ship, asteroids and bullets on black, cyan `3x` power-up, orange thruster. Only the CRT frame around it is platform-styled.
- Copy in English: any text drawn in the canvas (the original had `NIVEL`, `PUNTAJE`, `ESPACIO PARA REINICIAR`) is removed or translated. No Spanish in the rendered UI.
- Catalog copy: the `rocks` `long` description in `lib/games.ts` no longer mentions UFOs, since the game has none. Everything else about the entry (id, title, cover, category) is unchanged.
- The other 7 games keep the current mock player exactly as it is.

### Not in

- Saving scores. The final score is real, but the SAVE SCORE button keeps its existing mock behavior (local state only, no database, no `localStorage`). Persistence, a `scores` table and a live Hall of Fame go in a later spec, as SPEC 04 already deferred.
- Any change to authentication, the nav, or profiles. The player name stays the existing `GUEST` default.
- Touch controls or on-screen buttons. The game is keyboard-only for now, so phones can load the page but not play it.
- Sound, music, UFOs, new power-ups, new enemies, difficulty tuning or any gameplay change.
- Restyling the canvas to the neon palette.
- Porting the other reference games (`03-tetris`, `04-arkanoid`). Each gets its own spec.
- A shared game engine or abstraction for all games. This spec only fixes what Asteroids needs. A common interface is extracted when a second real game exists.
- Tests and SEO.
- Gamepad support, remappable keys and fullscreen.
- Changes to the homepage, About, auth or contact flows.

---

## Data model

No persisted data and no new database objects. The module exposes typed contracts between the game and React:

```ts
// lib/games/asteroids/types.ts
export interface AsteroidsSnapshot {
  score: number;
  lives: number;
  level: number;
  tripleShotLeft: number; // seconds, 0 when inactive
}

export interface AsteroidsOptions {
  onStateChange: (snapshot: AsteroidsSnapshot) => void;
  onGameOver: (finalScore: number) => void;
}

export interface AsteroidsGame {
  start(): void; // registers input, starts the loop, begins a new run
  pause(): void;
  resume(): void;
  restart(): void; // new run, same canvas
  end(): void; // finishes the run now and calls onGameOver
  destroy(): void; // stops the loop, removes every listener
}

// lib/games/asteroids/index.ts
export function createAsteroids(
  canvas: HTMLCanvasElement,
  options: AsteroidsOptions,
): AsteroidsGame;
```

Conventions:

- Logical size is the constants `W = 800` and `H = 600`. CSS scales the canvas; game coordinates never depend on the displayed size.
- File layout under `lib/games/asteroids/`: `types.ts`, `index.ts` (factory and loop), `entities.ts` (the five classes), `input.ts` (key handling), and `constants.ts` (tunable values taken from the original). The split can be adjusted during implementation if one file reads better.
- `onStateChange` fires when `score`, `lives`, `level` change, and about every 100 ms while `tripleShotLeft > 0`, never every frame, so React does not re-render at 60 fps.
- `onGameOver` fires exactly once per run.
- The original's `dt` cap (50 ms) is kept.
- `Math.random()` is used only inside the browser after mount, never during server rendering.
- The module must be safe to import on the server: nothing touches `window`, `document` or `performance` until `createAsteroids` is called in an effect.

---

## Implementation plan

Each step leaves the app building and running.

1. **Read the docs.** Read in `node_modules/next/dist/docs/` the guides for Client Components, `use client` and effects, and `cacheComponents` (the play page is a Server Component using `params`). Read `references/started-games/02-asteroids/CLAUDE.md` and `game.js` fully. Use the `frontend-design` skill for the UI work, per `CLAUDE.md`.
2. **Port the engine.** Create `lib/games/asteroids/` with `constants.ts`, `entities.ts` and `input.ts`: typed classes taking the canvas context as a parameter, no globals. Gameplay values are copied unchanged. The app builds, with nothing importing the module yet.
3. **Game factory and loop.** Create `index.ts` and `types.ts` with `createAsteroids`: loop with `requestAnimationFrame`, `dt` cap, pause/resume, restart, end, destroy, throttled `onStateChange`, one-shot `onGameOver`, listener cleanup. Draw only the world and the ship in the canvas (no HUD, no overlay).
4. **Player integration.** In `components/game-player.tsx`, branch on `game.id === "rocks"` and mount the canvas in the CRT screen through a new `components/asteroids-canvas.tsx` Client Component (effect creates the game and calls `destroy` on cleanup, safe against React Strict Mode double effects). Other games render the current mock path unchanged.
5. **HUD and actions.** Wire score, lives and level from `onStateChange` into the platform HUD. PAUSE/RESUME button and the `P` key, auto-pause on `blur` and `visibilitychange`, END button, `onGameOver` opening the existing modal with the real score, PLAY AGAIN calling `restart`.
6. **Responsive canvas and styles.** Add the minimum CSS in `app/globals.css` so the canvas fills the CRT screen at 4:3 with no overflow at 390px and 1440px, and the CRT scanline overlay does not block pointer or key events.
7. **Catalog copy.** Update the `rocks` `long` text in `lib/games.ts` to remove the UFO mention.
8. **Verify.** Run build and lint, then play through in the browser at both widths (use the Playwright MCP and save screenshots to `.playwright-screenshots/`, per project memory) and check the acceptance criteria.

---

## Acceptance criteria

- [ ] `npm run build` and `npm run lint` pass with no errors, and importing `lib/games/asteroids` on the server does not touch `window` or `document`.
- [ ] `/games/rocks/play` renders a canvas inside the CRT screen with the ship at the center and 4 large asteroids, with no console errors. The other 7 games' play pages still show the mock arena and static HUD, unchanged.
- [ ] ArrowLeft/ArrowRight rotate the ship, ArrowUp thrusts, and Space shoots. Holding Space does not auto-fire: one bullet per press, with the 0.2 s cooldown of the original.
- [ ] Pressing arrows or Space while the page is focused does not scroll the page.
- [ ] Destroying a large, medium or small asteroid awards 20, 50 and 100 points. Large and medium ones split into two pieces of the next size down, and small ones disappear. The HUD score updates after each hit.
- [ ] Colliding with an asteroid removes one life, the ship respawns after 2 s with 3 s of invincibility, and the HUD lives update.
- [ ] Clearing all asteroids starts the next level with `3 + level` asteroids, and the HUD level increments.
- [ ] A power-up can drop from a destroyed asteroid, collecting it enables triple shot for 5 s, and the effect ends after the timer.
- [ ] The HUD shows the real score, lives and level, and no longer shows the hard-coded `12,450`, 3 hearts and `01` for this game.
- [ ] PAUSE and the `P` key freeze the game and show the PAUSED overlay. RESUME or `P` continues from the same state, and no time passes while paused.
- [ ] Switching to another tab or window pauses the game. Returning does not resume it automatically.
- [ ] When lives reach 0, the GAME OVER modal opens once with the exact final score shown in the HUD. END opens it immediately with the current score.
- [ ] PLAY AGAIN starts a fresh run in place: score 0, 3 lives, level 1, with the route unchanged. Keyboard still works after restart.
- [ ] Leaving the page (EXIT, back, or navigating elsewhere) stops the loop and removes the key listeners. Revisiting `/games/rocks/play` starts a single, clean game, with no doubled speed or double firing.
- [ ] No Spanish strings in the rendered UI or in text drawn on the canvas.
- [ ] The score is not stored anywhere: no database writes, no `localStorage`, no `sessionStorage`. SAVE SCORE shows the existing mock confirmation only.
- [ ] Visual check at 1440px and 390px shows the canvas fits the CRT with no horizontal scroll, keeps the 4:3 ratio, and is not distorted.
- [ ] The `rocks` description in `lib/games.ts` has no UFO mention, and the entry's id, title and cover are unchanged.

---

## Decisions taken and discarded

- **Yes:** reuse the existing `rocks` entry. The user chose it. The route, card, cover and detail page already exist. **No:** renaming to `asteroids` or adding a ninth game, which duplicates the concept or changes the route.
- **Yes:** the canvas runs inside the CRT with the platform HUD, PAUSE, END and the GAME OVER modal wired to the real state. **No:** keeping the canvas HUD and overlay of the original, which would duplicate the platform's UI and leave its HUD decorative. **No:** a full-page canvas without the shell.
- **Yes:** the final score is real but not persisted. SAVE SCORE stays mocked. **No:** a `scores` table here, since it combines data, auth and a leaderboard and deserves its own spec. SPEC 04 already deferred it.
- **Yes:** rewrite as a typed module with an explicit lifecycle (`start`, `destroy`). **No:** loading `game.js` with a `<script>` tag or `dangerouslySetInnerHTML`, which depends on globals and leaks listeners across navigations.
- **Yes:** English copy and a responsive canvas, both chosen by the user.
- **Yes:** keep the original vector look. The user chose it. **No:** restyling to neon colors, which means redoing the drawing code and iterating visually.
- **Yes:** platform buttons, the `P` key and auto-pause on blur. The user chose it. A keyboard game that keeps running in a hidden tab loses the player lives for no reason.
- **Yes:** the modal on game over and PLAY AGAIN restarts in place. **No:** Space-to-restart, which would add a second path to the same state.
- **Yes:** throttled `onStateChange` instead of per-frame state. Re-rendering the player at 60 fps is wasteful for four numbers.
- **Yes:** no shared game-engine abstraction yet. Three more games are planned, but designing the interface from a single example would guess wrong. **No:** extracting it now.
- **Yes:** touch controls are deferred, so mobile can load but not play the game. **No:** adding them here, which is a feature of its own (layout, multi-touch, hold-to-thrust).
- Per `CLAUDE.md`, UI work uses the `frontend-design` skill.

---

## Identified risks

- **Canvas and React lifecycle.** An effect that does not clean up leaves duplicate loops or listeners, and Strict Mode runs effects twice in development. Mitigated by `destroy` in the cleanup and the criterion about revisiting the page.
- **Hydration and SSR.** Anything random or time-based during render causes a hydration mismatch. Mitigated by creating the game only inside an effect and keeping the module free of top-level browser access.
- **`cacheComponents` and the play page.** The page is a Server Component using `params`. The game stays inside a Client Component, so the page is not changed. Step 1 confirms there is no conflict.
- **Focus and keyboard.** Arrows and Space can scroll the page or activate a focused button (Space on PAUSE). Mitigated by `preventDefault` on game keys and by verifying that pressing Space after clicking PAUSE does not toggle it.
- **Responsive scaling.** CSS scaling blurs lines on some screens and the CRT overlays can sit above the canvas. Mitigated by 4:3 scaling from the logical size, `pointer-events: none` on overlays, and the visual check at both widths.
- **Mobile is not playable.** Without touch controls the game loads but cannot be controlled on a phone. This is accepted and deferred, but visitors on mobile may think it is broken.
- **State sync cost.** Calling React state on every frame would hurt performance. Mitigated by throttling in the module.
- **Mock/real divergence.** `GamePlayer` will carry two paths (real for `rocks`, mock for the rest) until the other games are ported. Accepted as temporary and removed as each game is ported.
