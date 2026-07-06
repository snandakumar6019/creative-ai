create extension if not exists "pgcrypto";

create table if not exists public.generated_creatives (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  competitor_name text not null,
  generation_date timestamptz not null default now(),
  prompt text not null,
  title text not null,
  format text not null default 'Static image',
  status text not null default 'Ready',
  hook text not null default '',
  cta text not null default '',
  asset_url text not null default '/creative-ai-preview.png',
  is_favorite boolean not null default false,
  export_count integer not null default 0,
  last_exported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generated_creatives_owner_date_idx
  on public.generated_creatives(owner_id, generation_date desc);

create index if not exists generated_creatives_owner_favorite_idx
  on public.generated_creatives(owner_id, is_favorite);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists generated_creatives_set_updated_at on public.generated_creatives;

create trigger generated_creatives_set_updated_at
before update on public.generated_creatives
for each row
execute function public.set_updated_at();

alter table public.generated_creatives enable row level security;

drop policy if exists "Users can view their own generated creatives" on public.generated_creatives;
create policy "Users can view their own generated creatives"
on public.generated_creatives
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Users can create their own generated creatives" on public.generated_creatives;
create policy "Users can create their own generated creatives"
on public.generated_creatives
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "Users can update their own generated creatives" on public.generated_creatives;
create policy "Users can update their own generated creatives"
on public.generated_creatives
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Users can delete their own generated creatives" on public.generated_creatives;
create policy "Users can delete their own generated creatives"
on public.generated_creatives
for delete
to authenticated
using (owner_id = auth.uid());
