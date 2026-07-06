create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  brand_name text not null,
  product_description text not null default '',
  target_audience text not null default '',
  brand_colors text[] not null default '{}',
  brand_voice text not null default '',
  website text,
  existing_assets text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_owner_id_updated_at_idx
  on public.products(owner_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "Users can view their own products" on public.products;
create policy "Users can view their own products"
on public.products
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Users can create their own products" on public.products;
create policy "Users can create their own products"
on public.products
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "Users can update their own products" on public.products;
create policy "Users can update their own products"
on public.products
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Users can delete their own products" on public.products;
create policy "Users can delete their own products"
on public.products
for delete
to authenticated
using (owner_id = auth.uid());
