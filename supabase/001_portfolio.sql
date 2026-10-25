-- Run in a dedicated ACTIVE Supabase project. Enable auth email sign-in before using /admin.
create extension if not exists pgcrypto;
create table if not exists public.portfolio_admins(user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.portfolio_projects (
 id uuid primary key default gen_random_uuid(),slug text not null unique check(slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
 title jsonb not null default '{"fa":"","en":""}'::jsonb,summary jsonb not null default '{"fa":"","en":""}'::jsonb,
 body jsonb not null default '{"fa":"","en":""}'::jsonb,role jsonb not null default '{"fa":"","en":""}'::jsonb,
 status text not null default 'progress' check(status in ('real','progress','concept','research')),
 category text not null default 'web',stack text[] not null default '{}',cover_url text,video_url text,demo_url text,repo_url text,
 featured boolean not null default false,published boolean not null default false,sort_order integer not null default 0,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.portfolio_settings(key text primary key,value jsonb not null default '{}'::jsonb,updated_at timestamptz not null default now());
create table if not exists public.portfolio_inquiries(
 id uuid primary key default gen_random_uuid(),reference text not null unique default ('MH-'||upper(substr(encode(gen_random_bytes(8),'hex'),1,10))),
 full_name text not null check(length(full_name) between 2 and 90),email text not null check(length(email)<=160),
 service text not null default '',message text not null check(length(message) between 20 and 4000),
 budget text not null default '',locale text not null default 'fa',status text not null default 'new' check(status in('new','reviewing','replied','closed')),
 created_at timestamptz not null default now()
);
create index if not exists portfolio_public_idx on public.portfolio_projects(published,featured,sort_order);
create index if not exists portfolio_inquiry_status_idx on public.portfolio_inquiries(status,created_at desc);
create or replace function public.portfolio_touch() returns trigger language plpgsql as $$begin new.updated_at=now();return new;end$$;
drop trigger if exists portfolio_projects_touch on public.portfolio_projects;
create trigger portfolio_projects_touch before update on public.portfolio_projects for each row execute procedure public.portfolio_touch();
drop trigger if exists portfolio_settings_touch on public.portfolio_settings;
create trigger portfolio_settings_touch before update on public.portfolio_settings for each row execute procedure public.portfolio_touch();
create or replace function public.portfolio_is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from portfolio_admins where user_id=auth.uid())$$;
revoke all on function public.portfolio_is_admin() from public;
grant execute on function public.portfolio_is_admin() to anon, authenticated;
alter table public.portfolio_admins enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_settings enable row level security;
alter table public.portfolio_inquiries enable row level security;
drop policy if exists "admins read own" on public.portfolio_admins;
create policy "admins read own" on public.portfolio_admins for select to authenticated using(user_id=auth.uid());
drop policy if exists "published projects visible" on public.portfolio_projects;
create policy "published projects visible" on public.portfolio_projects for select to anon,authenticated using(published or public.portfolio_is_admin());
drop policy if exists "admins manage projects" on public.portfolio_projects;
create policy "admins manage projects" on public.portfolio_projects for all to authenticated using(public.portfolio_is_admin()) with check(public.portfolio_is_admin());
drop policy if exists "settings publicly readable" on public.portfolio_settings;
create policy "settings publicly readable" on public.portfolio_settings for select to anon,authenticated using(key in ('availability','availability_visible'));
drop policy if exists "admins manage settings" on public.portfolio_settings;
create policy "admins manage settings" on public.portfolio_settings for all to authenticated using(public.portfolio_is_admin()) with check(public.portfolio_is_admin());
drop policy if exists "admins read inquiries" on public.portfolio_inquiries;
create policy "admins read inquiries" on public.portfolio_inquiries for select to authenticated using(public.portfolio_is_admin());
drop policy if exists "admins update inquiries" on public.portfolio_inquiries;
create policy "admins update inquiries" on public.portfolio_inquiries for update to authenticated using(public.portfolio_is_admin()) with check(public.portfolio_is_admin());
-- SECURITY: no INSERT policy on inquiries. Only the Vercel serverless endpoint uses the service-role secret.
insert into public.portfolio_settings(key,value) values('availability','{"fa":"آماده همکاری حرفه‌ای","en":"Open to Collaboration"}') on conflict (key) do nothing;
-- Grant the first admin manually with your real Supabase auth user UUID after signing in:
-- insert into public.portfolio_admins(user_id) values ('YOUR_AUTH_USER_UUID') on conflict do nothing;
-- Optional bucket setup. Only allow authenticated admins to upload or delete assets.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('portfolio-media','portfolio-media',true,15728640,ARRAY['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm']) on conflict(id) do nothing;
drop policy if exists "portfolio media public read" on storage.objects;
create policy "portfolio media public read" on storage.objects for select to anon,authenticated using(bucket_id='portfolio-media');
drop policy if exists "portfolio admin upload" on storage.objects;
create policy "portfolio admin upload" on storage.objects for insert to authenticated with check(bucket_id='portfolio-media' and public.portfolio_is_admin());
drop policy if exists "portfolio admin update media" on storage.objects;
create policy "portfolio admin update media" on storage.objects for update to authenticated using(bucket_id='portfolio-media' and public.portfolio_is_admin()) with check(bucket_id='portfolio-media' and public.portfolio_is_admin());
drop policy if exists "portfolio admin delete media" on storage.objects;
create policy "portfolio admin delete media" on storage.objects for delete to authenticated using(bucket_id='portfolio-media' and public.portfolio_is_admin());
