-- À coller une seule fois dans l'éditeur SQL de Supabase (SQL Editor, puis Run).
-- Crée la table des séances et limite chaque compte à ses propres lignes.
-- Le script peut être relancé sans risque : il ne supprime aucune donnée.

create table if not exists public.completions (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  item_id text not null,
  done boolean not null default false,
  note text not null default '',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, day, item_id)
);

-- Si la table existait déjà dans sa première version, on lui ajoute la colonne de détail.
alter table public.completions add column if not exists data jsonb not null default '{}'::jsonb;

alter table public.completions enable row level security;

drop policy if exists "Chacun lit et modifie ses propres séances" on public.completions;

create policy "Chacun lit et modifie ses propres séances"
  on public.completions
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
