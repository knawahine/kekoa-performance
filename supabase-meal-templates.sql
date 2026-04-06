-- Meal Templates table
create table if not exists meal_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  foods jsonb not null default '[]',
  created_at timestamptz default now()
);
alter table meal_templates enable row level security;
create policy "Users own meal_templates" on meal_templates for all using (auth.uid() = user_id);
