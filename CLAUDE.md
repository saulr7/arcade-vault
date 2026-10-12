# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault: a platform to play games online and compete for the highest score. The project follows a spec-driven workflow (`/spec` and `/spec-impl`) using the skills from https://github.com/Klerith/fernando-skills (installed with `npx skills@latest add Klerith/fernando-skills`). The codebase is currently the bare Create Next App scaffold (`app/layout.tsx`, `app/page.tsx`); no game features exist yet.

## Commands

- `npm run dev` — start dev server (Turbopack)
- `npm run build` / `npm run start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- No test runner is configured yet.

## Next.js version warning

This uses Next.js 16.4 / React 19.3, which differs from older Next.js. Per `AGENTS.md`, read the relevant guide in `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`) before writing Next.js code, and heed deprecation notices. `next dev` re-adds the `AGENTS.md` block if removed.

## Architecture notes

- App Router only (`app/`). Path alias `@/*` maps to the repo root.
- `next.config.ts` enables `cacheComponents`, `partialPrefetching`, and `experimental.agentFeedback`. `cacheComponents` changes caching/dynamic-rendering semantics, so check the docs before fetching data or using request APIs in components.
- Tailwind v4 is wired through Turbopack's `@tailwindcss/turbopack` loader rule for `*.css` in `next.config.ts` (not a PostCSS config). Theme tokens live in `app/globals.css` (`@theme inline`, light/dark via `prefers-color-scheme`).
- `app/layout.tsx` uses the globally typed `LayoutProps<"/">` helper (no import needed) and loads Geist fonts via `next/font/google`.
