-- ============================================
-- KEKOA PERFORMANCE — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. PROFILES
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  start_date text,
  weight real,
  mode text default 'cut',
  calf_phase integer default 2,
  sled_stage integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- 2. PROGRAMS
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  start_date text not null,
  weeks integer not null default 0,
  active boolean default false,
  created_at timestamptz default now()
);
alter table programs enable row level security;
create policy "Users own programs" on programs for all using (auth.uid() = user_id);

-- 3. DAILY LOGS (meal checks, supplement checks, weight per day)
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  weight real,
  meal_checks jsonb default '{}',
  supp_checks jsonb default '{}',
  updated_at timestamptz default now(),
  unique(user_id, date)
);
alter table daily_logs enable row level security;
create policy "Users own daily_logs" on daily_logs for all using (auth.uid() = user_id);

-- 4. EXERCISE LOGS
create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  exercise_key text not null,
  sets jsonb default '{}',
  updated_at timestamptz default now(),
  unique(user_id, date, exercise_key)
);
alter table exercise_logs enable row level security;
create policy "Users own exercise_logs" on exercise_logs for all using (auth.uid() = user_id);

-- 5. MEAL OVERRIDES
create table if not exists meal_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  meal_id text not null,
  foods jsonb not null default '[]',
  updated_at timestamptz default now(),
  unique(user_id, date, meal_id)
);
alter table meal_overrides enable row level security;
create policy "Users own meal_overrides" on meal_overrides for all using (auth.uid() = user_id);

-- 6. CHECKINS (weekly)
create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  week_num integer not null,
  data jsonb not null default '{}',
  updated_at timestamptz default now(),
  unique(user_id, week_num)
);
alter table checkins enable row level security;
create policy "Users own checkins" on checkins for all using (auth.uid() = user_id);

-- 7. REHAB CHECKS
create table if not exists rehab_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  checks jsonb default '{}',
  updated_at timestamptz default now(),
  unique(user_id, date)
);
alter table rehab_checks enable row level security;
create policy "Users own rehab_checks" on rehab_checks for all using (auth.uid() = user_id);

-- 8. PHOTOS (metadata — actual files in Storage bucket)
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  week_num integer not null,
  angle text not null,
  storage_path text not null,
  url text not null,
  updated_at timestamptz default now(),
  unique(user_id, week_num, angle)
);
alter table photos enable row level security;
create policy "Users own photos" on photos for all using (auth.uid() = user_id);

-- 9. STORAGE BUCKET for progress photos
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload own photos"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own photos"
  on storage.objects for update
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own photos"
  on storage.objects for delete
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can read photos"
  on storage.objects for select
  using (bucket_id = 'photos');

-- ============================================
-- DONE. All tables created with RLS enabled.
-- ============================================
