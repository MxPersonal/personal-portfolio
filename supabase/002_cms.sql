-- Run this after supabase/001_portfolio.sql in a dedicated ACTIVE Supabase project.
-- Every content collection is protected by row-level security.
create table if not exists public.portfolio_cms_entries (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('section','copy','service_group','service','skill','social','gallery','journey','page')),
 slug text not null check(slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
 title jsonb not null default '{"fa":"","en":""}'::jsonb,
 description jsonb not null default '{"fa":"","en":""}'::jsonb,
 body jsonb not null default '{"fa":"","en":""}'::jsonb,
 group_key text not null default '',
 image_url text,
 link_url text,
 published boolean not null default false,
 sort_order integer not null default 100,
 meta jsonb not null default '{}'::jsonb check(jsonb_typeof(meta)='object'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint portfolio_cms_unique unique (kind,slug)
);
create index if not exists portfolio_cms_public_sort on public.portfolio_cms_entries(kind,published,sort_order);
drop trigger if exists portfolio_cms_touch on public.portfolio_cms_entries;
create trigger portfolio_cms_touch before update on public.portfolio_cms_entries
 for each row execute function public.portfolio_touch();

alter table public.portfolio_cms_entries enable row level security;

revoke all on public.portfolio_cms_entries from anon,authenticated;
grant select on public.portfolio_cms_entries to anon,authenticated;
grant insert,update,delete on public.portfolio_cms_entries to authenticated;

drop policy if exists "cms publicly readable published entries" on public.portfolio_cms_entries;
create policy "cms publicly readable published entries" on public.portfolio_cms_entries
 for select to anon,authenticated using(published or (select public.portfolio_is_admin()));

drop policy if exists "cms admin insert entries" on public.portfolio_cms_entries;
create policy "cms admin insert entries" on public.portfolio_cms_entries
 for insert to authenticated with check((select public.portfolio_is_admin()));

drop policy if exists "cms admin update entries" on public.portfolio_cms_entries;
create policy "cms admin update entries" on public.portfolio_cms_entries
 for update to authenticated
 using((select public.portfolio_is_admin()))
 with check((select public.portfolio_is_admin()));

drop policy if exists "cms admin delete entries" on public.portfolio_cms_entries;
create policy "cms admin delete entries" on public.portfolio_cms_entries
 for delete to authenticated using((select public.portfolio_is_admin()));

-- The frontend only reads the boolean initialization flag.
drop policy if exists "cms initialization flag public read" on public.portfolio_settings;
create policy "cms initialization flag public read" on public.portfolio_settings
 for select to anon,authenticated using(key='cms_initialized');

-- Required browser Data API grants are separate from RLS.
grant usage on schema public to anon,authenticated;
grant select on public.portfolio_settings to anon,authenticated;
grant insert,update on public.portfolio_settings to authenticated;

-- No public insert grants to private inquiries or administrators.
-- Admin approval still requires a row in portfolio_admins bound to auth.users(id).
-- Existing storage policies from 001_portfolio.sql protect media uploads.
