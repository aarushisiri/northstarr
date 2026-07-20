# Northstar

A personal operating system for someone who already has an AI Chief of Staff (ChatGPT)
making the plan. Northstar's only job is to execute it and make "what do I do right now"
instantly obvious — synced across every device you use.

## Getting started

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a free project, then open the
**SQL Editor** and run the contents of `supabase/migrations/0001_init.sql`. That creates
every table, row-level-security policy, and the realtime publication Northstar needs.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your project's
**Settings → API** page.

### 3. Enable email auth

In your Supabase project, go to **Authentication → Providers** and make sure **Email**
is enabled with magic-link sign-in on (this is the default). No password is needed —
Northstar signs people in with a one-time link.

### 4. Run it

```bash
npm install
npm run dev
```

Open the printed local URL, enter your email, and click the link Supabase sends you.
Sign in with the same email on another device and you'll see the same data.

## Project structure

```
supabase/
  migrations/0001_init.sql   All tables, RLS policies, triggers, realtime setup

src/
  auth/          AuthProvider (session context) + AuthGate (magic-link sign-in screen)
  lib/           supabaseClient.js — the one Supabase client instance
  components/    Reusable presentational pieces (ProgressRing, TimelineBlock, Sidebar, ...)
  pages/         One file per route: Home, Timeline, Systems, Journal, Review, Import
  store/         useNorthstarStore — the single source of truth, backed by Supabase
                 api.js            — thin wrappers around every Supabase table call
                 cache.js          — local mirror for instant/offline load (NOT the source of truth)
                 offlineOutbox.js  — queue of writes that couldn't reach Supabase yet
  parser/        parsePlan.js — turns a pasted ChatGPT plan into an app-state slice
  hooks/         useNow, useMediaQuery, useOnlineStatus
  utils/         Pure helper functions (time formatting, system helpers)
  styles/        Design tokens and global styles
```

## Where state lives now

**Supabase is the single source of truth.** Every table is scoped to the signed-in user
via row-level security (`auth.uid() = user_id`), so each person only ever sees their own
data — this is a real multi-user app now, not a single-browser one.

| Table              | What it holds                                              | Cardinality              |
|---------------------|------------------------------------------------------------|---------------------------|
| `plans`             | Every pasted plan, verbatim + parsed — an audit trail       | one row per import        |
| `daily_logs`        | Mission, win condition, Top 3, timeline, stats, sideways    | one row per user per day  |
| `journal_entries`   | Morning/evening journal                                     | one row per user per day  |
| `system_progress`   | Weekly/monthly/yearly per life system                        | one row per user per system |
| `streaks`           | Win / Cyber / Reading / Fitness streaks                      | one row per user          |
| `settings`          | Reserved for future preferences (not wired into the UI yet)  | one row per user per key  |

Today's per-system percentage is **never stored** — `utils/systems.js: computeTodayPct`
always derives it live from which timeline tasks are checked off, so the AI only has to
supply the mission, timeline, and priorities.

### The offline cache and outbox aren't a loophole

`localStorage` still appears in two small files — `store/cache.js` and
`store/offlineOutbox.js` — and that's deliberate, not an oversight. A cloud-only app
can't function with no connection at all, so:

- **`cache.js`** mirrors the last state Supabase confirmed, purely so the app has
  something to show instantly on load and while offline. It's never written to by user
  actions directly.
- **`offlineOutbox.js`** queues writes that failed to reach Supabase (no connection,
  request error). They're replayed in order the moment connectivity returns — on the
  browser's `online` event, and as a 20-second-interval fallback in case that event
  doesn't fire reliably.

Everything else — every table above — lives in Supabase.

### Realtime sync

`useNorthstarStore` subscribes to Postgres changes on `daily_logs`, `journal_entries`,
`system_progress`, and `streaks`, filtered to the signed-in user. A write on your phone
shows up on your laptop within moments, without a refresh.

### Sync status

The sidebar shows a live badge: **Synced**, **Syncing…**, or **Offline — will sync**,
driven by `syncStatus` from `useNorthstarStore`.

## How the daily import works

Every morning, paste the structured plan your AI Chief of Staff generates into the
**Import Plan** page. `src/parser/parsePlan.js` reads it section by section
(`MISSION`, `WIN`, `TOP3`, `TIMELINE`, `SYSTEMS`, `STATS`, plus four streak fields)
and returns a plain state object. Importing does two things at once: it upserts today's
`daily_logs` (and related tables), and it inserts a permanent row into `plans` so you
keep a full history of every plan you've ever imported.

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

`SYSTEMS:` lines only carry `weekly | monthly | yearly` — the AI never needs to
estimate a "today" percentage:

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
only keeps one current value per system rather than a full daily history.
Once `system_progress` rows are tracked per-day (a small schema change: add a
`log_date` column), those could become computed the same way today's number is.

## Account data controls (Import page)

- **Refresh from server** — safe. Clears the local cache/outbox and re-fetches
  everything from Supabase. Useful if a device ever looks out of sync.
- **Delete all my data** — destructive, double-confirmed. Deletes every row for
  your account across all six tables. Cannot be undone.

## Preparing for what's next

- **ChatGPT API integration** — `parsePlan.js` already expects the exact plain-text
  contract a model would produce. Once ChatGPT can call Northstar directly, it can
  POST that same text straight into `parsePlan` and then `importPlan`, skipping the
  copy-paste step in `Import.jsx` entirely.
- **Notifications / Calendar / Apple Health / Google Fit / GitHub** — each would
  read from or write into the same Supabase tables rather than introducing
  parallel state.
- **Multi-day history for weekly/monthly/yearly** — extend `system_progress`
  with a `log_date` column and compute rollups server-side (a Postgres view or
  scheduled function) once enough days of `daily_logs` exist.
