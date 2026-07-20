# Northstar

A personal operating system for someone who already has an AI Chief of Staff (ChatGPT)
making the plan. Northstar's only job is to execute it and make "what do I do right now"
instantly obvious.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. The app installs as a PWA and works offline once loaded.

## Publish to GitHub

This project is ready to be published as a GitHub repository and deployed via GitHub Pages.

1. Create a new repository on GitHub named `northstarr` (or use your preferred name).
2. From the project folder, run:

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

3. Enable GitHub Pages in the repository settings and select the Pages workflow from the Actions tab after the first push.

The deployment workflow is already configured in `.github/workflows/deploy.yml`.

## Project structure

```
src/
  components/   Reusable presentational pieces (ProgressRing, TimelineBlock, Sidebar, ...)
  pages/        One file per route: Home, Timeline, Systems, Journal, Review, Import
  store/        useNorthstarStore hook — the single source of truth, backed by localStorage
  parser/       parsePlan.js — turns a pasted ChatGPT plan into app state
  hooks/        Small focused hooks (useNow, useMediaQuery)
  utils/        Pure helper functions (time formatting, system helpers)
  styles/       Design tokens and global styles
```

## How the daily import works

Every morning, paste the structured plan your AI Chief of Staff generates into the
**Import Plan** page. `src/parser/parsePlan.js` reads it section by section
(`MISSION`, `WIN`, `TOP3`, `TIMELINE`, `SYSTEMS`, `STATS`, plus four streak fields)
and returns a plain state object. That object replaces the relevant slices of the
store, and every page re-renders from it — nothing else needs to be touched by hand.

The parser is intentionally forgiving: unknown lines are skipped and reported back
to you as parser notes rather than thrown as hard errors, so a slightly malformed
plan still loads instead of blocking your morning.

### Streaks

Rather than one generic streak, the plan carries four dedicated ones:

```
WIN STREAK: 12
CYBER STREAK: 9
READING STREAK: 21
FITNESS STREAK: 5
```

Home emphasizes the **Win Streak**. The other three live on the Review page
alongside it. A bare `STREAK: <n>` line (the old format) still works and is
treated as the win streak, with a parser note explaining the change.

On day 1 all four streaks — and weekly/monthly/yearly progress — should be 0,
since there's no history yet. They only grow once real days get completed.
The in-app example plan (Import page → "Load example") reflects this honestly.

### System progress is computed, not guessed

`SYSTEMS:` lines now only carry `weekly | monthly | yearly` — the AI no longer
needs to estimate a "today" percentage:

```
SYSTEMS:
Health: 50 | 40 | 38
```

Today's percentage for each system is calculated automatically from the
timeline: `checked tasks in that system / total tasks in that system`
(`src/utils/systems.js: computeTodayPct`). It updates live as you check things
off, so it can never drift from what actually happened. A legacy 4-value line
(`today | weekly | monthly | yearly`) is still accepted for backward
compatibility — the leading value is simply ignored, with a parser note.

Weekly/monthly/yearly still come from the AI's plan for now, since Northstar
doesn't yet keep its own multi-day history. Once it does, those can become
computed the same way today's number is.

## Where state lives (V1)

All state lives in `localStorage` under the key `northstar:state:v1`, read and
written by `src/store/useNorthstarStore.js`. There is no backend in V1.

## Preparing for what's next

The store and parser are deliberately the only two places that touch persistence
and plan-shape, so future integrations are additive, not rewrites:

- **Supabase sync** — swap the `localStorage` calls inside `useNorthstarStore.js`
  for Supabase reads/writes (or layer Supabase on top as a sync target). The
  state shape itself doesn't need to change.
- **Direct ChatGPT API** — `parsePlan.js` already expects the exact plain-text
  contract a model would produce. Once ChatGPT can call Northstar directly,
  it can POST that same text (or a JSON version of the same fields) straight
  into `parsePlan`, skipping the copy-paste step in `Import.jsx` entirely.
- **Notifications / Calendar / Apple Health / Google Fit / GitHub** — each would
  read from or write into the same store slices (`timeline`, `stats`, `systems`)
  rather than introducing parallel state.
