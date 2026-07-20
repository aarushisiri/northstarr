-- Northstar — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push` if you use
-- the CLI) once, on a fresh project. Everything is scoped to auth.uid(), so
-- each signed-in user only ever sees their own rows.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- PLANS — append-only history of every plan pasted into the Import page.
-- Kept separate from daily_logs so you retain a full audit trail of what
-- was actually generated and imported, even after daily_logs is overwritten.
-- ---------------------------------------------------------------------
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_text text not null,
  parsed jsonb not null,
  parser_notes jsonb not null default '[]'::jsonb,
  imported_at timestamptz not null default now()
);

create index if not exists plans_user_idx on public.plans (user_id, imported_at desc);

-- ---------------------------------------------------------------------
-- DAILY_LOGS — one row per user per calendar day. This is what Home,
-- Timeline, and Review read for "today". Today's per-system % is NOT
-- stored anywhere — it's always derived client-side from `timeline`.
-- ---------------------------------------------------------------------
create table if not exists public.daily_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  mission text not null default '',
  win_condition text not null default '',
  top3 jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  sideways boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, log_date)
);

-- ---------------------------------------------------------------------
-- JOURNAL_ENTRIES — one row per user per day.
-- ---------------------------------------------------------------------
create table if not exists public.journal_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  gratitude text not null default '',
  intentions text not null default '',
  wins text not null default '',
  lessons text not null default '',
  challenges text not null default '',
  carry_forward text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, entry_date)
);

-- ---------------------------------------------------------------------
-- SYSTEM_PROGRESS — one row per user per life system. Only weekly/monthly/
-- yearly live here; "today" is always computed from daily_logs.timeline.
-- ---------------------------------------------------------------------
create table if not exists public.system_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  system_name text not null,
  weekly numeric not null default 0,
  monthly numeric not null default 0,
  yearly numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, system_name)
);

-- ---------------------------------------------------------------------
-- STREAKS — a single row per user holding all four dedicated streaks.
-- ---------------------------------------------------------------------
create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  win integer not null default 0,
  cyber integer not null default 0,
  reading integer not null default 0,
  fitness integer not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- SETTINGS — flexible key/value store reserved for future preferences
-- (timezone, notification prefs, etc). Not wired into the UI yet.
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- ---------------------------------------------------------------------
-- Row Level Security — every table is private to its owner.
-- ---------------------------------------------------------------------
alter table public.plans enable row level security;
alter table public.daily_logs enable row level security;
alter table public.journal_entries enable row level security;
alter table public.system_progress enable row level security;
alter table public.streaks enable row level security;
alter table public.settings enable row level security;

drop policy if exists "own plans" on public.plans;
create policy "own plans" on public.plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own daily_logs" on public.daily_logs;
create policy "own daily_logs" on public.daily_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own journal_entries" on public.journal_entries;
create policy "own journal_entries" on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own system_progress" on public.system_progress;
create policy "own system_progress" on public.system_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own streaks" on public.streaks;
create policy "own streaks" on public.streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own settings" on public.settings;
create policy "own settings" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Keep updated_at current automatically on every UPDATE.
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.daily_logs;
create trigger set_updated_at before update on public.daily_logs
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.journal_entries;
create trigger set_updated_at before update on public.journal_entries
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.system_progress;
create trigger set_updated_at before update on public.system_progress
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.streaks;
create trigger set_updated_at before update on public.streaks
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.settings;
create trigger set_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Realtime — lets every open device receive changes the instant another
-- device writes them. Requires the `supabase_realtime` publication, which
-- Supabase projects have by default.
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.daily_logs;
alter publication supabase_realtime add table public.journal_entries;
alter publication supabase_realtime add table public.system_progress;
alter publication supabase_realtime add table public.streaks;
