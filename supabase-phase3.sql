-- ============================================
-- PHASE 3: Onboarding — Additional Schema
-- Run in Supabase SQL Editor
-- ============================================

-- Add onboarded flag to profiles
alter table profiles add column if not exists onboarded boolean default false;
alter table profiles add column if not exists name text;
alter table profiles add column if not exists height text;
alter table profiles add column if not exists body_fat_target text;

-- CUSTOM MEALS (user-created or cloned from template)
create table if not exists custom_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null default 'training',
  meals jsonb not null default '[]',
  targets jsonb default '{}',
  supplements jsonb default '[]',
  is_template boolean default false,
  shared_by uuid references auth.users(id),
  created_at timestamptz default now()
);
alter table custom_meals enable row level security;
create policy "Users own custom_meals" on custom_meals for all using (auth.uid() = user_id);
create policy "Anyone can read templates" on custom_meals for select using (is_template = true);

-- CUSTOM SPLITS (user-created or cloned from template)
create table if not exists custom_splits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  days jsonb not null default '[]',
  exercises jsonb not null default '{}',
  is_template boolean default false,
  shared_by uuid references auth.users(id),
  created_at timestamptz default now()
);
alter table custom_splits enable row level security;
create policy "Users own custom_splits" on custom_splits for all using (auth.uid() = user_id);
create policy "Anyone can read split templates" on custom_splits for select using (is_template = true);

-- ============================================
-- SEED: Kekoa's 12-Week Performance Cut Template
-- ============================================

-- We'll seed this via the app's template seeding function
-- so the data structure matches exactly. Run this after
-- creating a user account (the app seeds automatically).

-- ============================================
-- DONE
-- ============================================
