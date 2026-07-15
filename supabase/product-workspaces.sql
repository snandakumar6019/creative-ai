create extension if not exists "pgcrypto";

create table if not exists public.product_competitors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  facebook_ad_library_url text not null,
  facebook_page_id text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, facebook_ad_library_url)
);

create index if not exists product_competitors_product_updated_idx
  on public.product_competitors(product_id, updated_at desc);

create index if not exists product_competitors_owner_idx
  on public.product_competitors(owner_id);

create index if not exists generated_creatives_product_date_idx
  on public.generated_creatives(product_id, generation_date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists product_competitors_set_updated_at on public.product_competitors;

create trigger product_competitors_set_updated_at
before update on public.product_competitors
for each row
execute function public.set_updated_at();

alter table public.product_competitors enable row level security;

drop policy if exists "Users can view competitors for their products" on public.product_competitors;
create policy "Users can view competitors for their products"
on public.product_competitors
for select
to authenticated
using (
  owner_id = auth.uid()
  and exists (
    select 1 from public.products
    where products.id = product_competitors.product_id
      and products.owner_id = auth.uid()
  )
);

drop policy if exists "Users can attach competitors to their products" on public.product_competitors;
create policy "Users can attach competitors to their products"
on public.product_competitors
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.products
    where products.id = product_competitors.product_id
      and products.owner_id = auth.uid()
  )
);

drop policy if exists "Users can update competitors for their products" on public.product_competitors;
create policy "Users can update competitors for their products"
on public.product_competitors
for update
to authenticated
using (owner_id = auth.uid())
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.products
    where products.id = product_competitors.product_id
      and products.owner_id = auth.uid()
  )
);

drop policy if exists "Users can remove competitors from their products" on public.product_competitors;
create policy "Users can remove competitors from their products"
on public.product_competitors
for delete
to authenticated
using (owner_id = auth.uid());

grant select, insert, update, delete on public.product_competitors to authenticated;
