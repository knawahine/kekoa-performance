-- ============================================
-- PROGRAM IMPORT: user_foods table
-- Run in Supabase SQL Editor
-- ============================================
-- Stores per-100g macros for foods that were imported from a PDF program
-- but are not part of the built-in food database (src/data/foods.js).

create table if not exists user_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  protein_per_100g real,
  carbs_per_100g real,
  fat_per_100g real,
  cal_per_100g real,
  created_at timestamptz default now(),
  unique(user_id, name)
);

alter table user_foods enable row level security;

create policy "Users own user_foods" on user_foods
  for all using (auth.uid() = user_id);

-- ============================================
-- programs.imported flag
-- ============================================
-- Marks a program as PDF-imported so the app knows to load its custom
-- split/meals instead of the built-in defaults. Without this column the
-- flag is lost on reload and the app reverts to the default program.

alter table programs add column if not exists imported boolean not null default false;

-- ============================================
-- DONE
-- ============================================
