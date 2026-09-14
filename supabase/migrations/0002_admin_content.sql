-- ArLAR admin content schema
-- Run after 0001_foundation.sql. This migration stores structured records and
-- JSONB snapshots; binary files remain in Cloudflare R2.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_doctors (
  id text primary key,
  name text not null default '',
  status text not null default 'active',
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_arlar27_sections (
  section text primary key,
  status text not null default 'waiting' check (status in ('ready', 'waiting')),
  data jsonb not null default '{}'::jsonb,
  updated_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_arlar27_people (
  id text primary key,
  section text not null check (section in ('committee', 'faculty')),
  doctor_id text not null default '',
  sort_order integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_college_events (
  id text primary key,
  title text not null default '',
  status text not null default 'draft' check (status in ('published', 'draft')),
  event_date timestamptz,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_sigs (
  slug text primary key,
  name text not null default '',
  abbreviation text not null default '',
  logo_url text not null default '',
  visible boolean not null default true,
  sort_order integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_member_countries (
  slug text primary key,
  country text not null default '',
  country_code text not null default '',
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_member_societies (
  id text primary key,
  country_slug text not null references public.admin_member_countries(slug) on delete cascade,
  name text not null default '',
  abbreviation text not null default '',
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_congresses (
  id text primary key,
  title text not null default '',
  status text not null default 'draft' check (status in ('published', 'draft')),
  date_range text not null default '',
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_congress_videos (
  id text primary key,
  congress_id text not null references public.admin_congresses(id) on delete cascade,
  title text not null default '',
  status text not null default 'draft' check (status in ('published', 'draft')),
  sort_order integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_congress_gallery (
  id uuid primary key default gen_random_uuid(),
  congress_id text not null references public.admin_congresses(id) on delete cascade,
  day integer,
  sort_order integer not null default 0,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_professional_resources (
  id text primary key,
  kind text not null check (kind in ('publication', 'bulletin', 'document', 'partner')),
  title text not null default '',
  status text not null default 'draft' check (status in ('published', 'draft')),
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_inbox_records (
  id text primary key,
  kind text not null check (kind in ('contact', 'question', 'subscriber')),
  status text not null default 'unread',
  email text not null default '',
  created_at timestamptz not null default now(),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_deletions (
  scope text not null,
  record_id text not null,
  deleted_at timestamptz not null default now(),
  permanently_deleted boolean not null default false,
  deleted_by uuid references public.admin_profiles(id) on delete set null,
  primary key (scope, record_id)
);

create index if not exists admin_doctors_name_idx on public.admin_doctors(name);
create index if not exists admin_arlar27_people_section_idx on public.admin_arlar27_people(section, sort_order);
create index if not exists admin_college_events_status_date_idx on public.admin_college_events(status, event_date desc nulls last);
create index if not exists admin_sigs_order_idx on public.admin_sigs(sort_order);
create index if not exists admin_member_societies_country_idx on public.admin_member_societies(country_slug);
create index if not exists admin_congress_videos_congress_idx on public.admin_congress_videos(congress_id, sort_order);
create index if not exists admin_congress_gallery_congress_idx on public.admin_congress_gallery(congress_id, day, sort_order);
create index if not exists admin_resources_kind_status_idx on public.admin_professional_resources(kind, status);
create index if not exists admin_inbox_status_created_idx on public.admin_inbox_records(status, created_at desc);
create index if not exists admin_deletions_scope_idx on public.admin_deletions(scope, deleted_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'admin_doctors', 'admin_arlar27_sections', 'admin_arlar27_people',
    'admin_college_events', 'admin_sigs', 'admin_member_countries',
    'admin_member_societies', 'admin_congresses', 'admin_congress_videos',
    'admin_congress_gallery', 'admin_professional_resources', 'admin_inbox_records'
  ] loop
    execute format('drop trigger if exists %I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.touch_updated_at()', table_name, table_name);
  end loop;
end $$;

alter table public.admin_doctors enable row level security;
alter table public.admin_arlar27_sections enable row level security;
alter table public.admin_arlar27_people enable row level security;
alter table public.admin_college_events enable row level security;
alter table public.admin_sigs enable row level security;
alter table public.admin_member_countries enable row level security;
alter table public.admin_member_societies enable row level security;
alter table public.admin_congresses enable row level security;
alter table public.admin_congress_videos enable row level security;
alter table public.admin_congress_gallery enable row level security;
alter table public.admin_professional_resources enable row level security;
alter table public.admin_inbox_records enable row level security;
alter table public.admin_deletions enable row level security;

create policy admin_doctors_manage on public.admin_doctors for all to authenticated
  using (public.has_admin_permission('doctors')) with check (public.has_admin_permission('doctors'));
create policy admin_arlar27_sections_manage on public.admin_arlar27_sections for all to authenticated
  using (public.has_admin_permission('arlar27')) with check (public.has_admin_permission('arlar27'));
create policy admin_arlar27_people_manage on public.admin_arlar27_people for all to authenticated
  using (public.has_admin_permission('arlar27')) with check (public.has_admin_permission('arlar27'));
create policy admin_college_events_manage on public.admin_college_events for all to authenticated
  using (public.has_admin_permission('college')) with check (public.has_admin_permission('college'));
create policy admin_sigs_manage on public.admin_sigs for all to authenticated
  using (public.has_admin_permission('sigs')) with check (public.has_admin_permission('sigs'));
create policy admin_member_countries_manage on public.admin_member_countries for all to authenticated
  using (public.has_admin_permission('members')) with check (public.has_admin_permission('members'));
create policy admin_member_societies_manage on public.admin_member_societies for all to authenticated
  using (public.has_admin_permission('members')) with check (public.has_admin_permission('members'));
create policy admin_congresses_manage on public.admin_congresses for all to authenticated
  using (public.has_admin_permission('congresses')) with check (public.has_admin_permission('congresses'));
create policy admin_congress_videos_manage on public.admin_congress_videos for all to authenticated
  using (public.has_admin_permission('congresses')) with check (public.has_admin_permission('congresses'));
create policy admin_congress_gallery_manage on public.admin_congress_gallery for all to authenticated
  using (public.has_admin_permission('congresses')) with check (public.has_admin_permission('congresses'));
create policy admin_professional_resources_manage on public.admin_professional_resources for all to authenticated
  using (public.has_admin_permission('resources')) with check (public.has_admin_permission('resources'));
create policy admin_inbox_records_manage on public.admin_inbox_records for all to authenticated
  using (public.has_admin_permission('inbox')) with check (public.has_admin_permission('inbox'));
create policy admin_deletions_manage on public.admin_deletions for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());
