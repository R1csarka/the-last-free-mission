create extension if not exists pgcrypto;

create table if not exists public.groom_evaluations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nickname text,
  looks integer not null check (looks between 1 and 10),
  style integer not null check (style between 1 and 10),
  humor integer not null check (humor between 1 and 10),
  charisma integer not null check (charisma between 1 and 10),
  beer_yes_no boolean not null,
  husband_index integer not null check (husband_index between 1 and 10),
  message_to_bride text check (char_length(message_to_bride) <= 150)
);

create index if not exists groom_evaluations_created_at_idx
  on public.groom_evaluations (created_at desc);

alter table public.groom_evaluations enable row level security;

-- The app uses Supabase only from protected Next.js API routes with the service-role key.
-- No public anon policies are required.
