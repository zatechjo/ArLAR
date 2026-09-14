-- ArLAR backend foundation
-- Supabase stores structured records and media metadata only.
-- Images, PDFs, videos, and other binaries belong in Cloudflare R2.

create extension if not exists pgcrypto;

do $$ begin
  create type public.admin_role as enum ('owner', 'editor', 'contributor');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.admin_status as enum ('invited', 'active', 'suspended');
exception when duplicate_object then null;
end $$;

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null default '',
  role public.admin_role not null default 'contributor',
  status public.admin_status not null default 'invited',
  invited_at timestamptz,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  admin_profile_id uuid not null references public.admin_profiles(id) on delete cascade,
  module text not null check (module in ('news', 'doctors', 'arlar27', 'college', 'sigs', 'members', 'congresses', 'resources', 'inbox', 'access', 'media')),
  created_at timestamptz not null default now(),
  unique (admin_profile_id, module)
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.admin_profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_provider text not null default 'r2' check (storage_provider in ('r2', 'external')),
  storage_key text not null unique,
  public_url text not null,
  original_name text not null default '',
  mime_type text not null default 'application/octet-stream',
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  folder text not null default '',
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  alt_text text not null default '',
  caption text not null default '',
  credit text not null default '',
  source_url text not null default '',
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  cover_media_id uuid references public.media_assets(id) on delete set null,
  published_at timestamptz,
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_translations (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.news_articles(id) on delete cascade,
  locale text not null check (locale in ('en', 'ar', 'fr')),
  title text not null default '',
  excerpt text not null default '',
  body jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_id, locale)
);

create table if not exists public.news_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.news_article_categories (
  article_id uuid not null references public.news_articles(id) on delete cascade,
  category_id uuid not null references public.news_categories(id) on delete cascade,
  primary key (article_id, category_id)
);

create index if not exists admin_permissions_profile_idx on public.admin_permissions(admin_profile_id);
create index if not exists audit_log_created_idx on public.admin_audit_log(created_at desc);
create index if not exists media_assets_folder_idx on public.media_assets(folder);
create index if not exists news_articles_status_date_idx on public.news_articles(status, published_at desc nulls last);
create index if not exists news_translations_locale_idx on public.news_translations(locale);

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where auth_user_id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.has_admin_permission(module_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles p
    left join public.admin_permissions ap on ap.admin_profile_id = p.id
    where p.auth_user_id = auth.uid()
      and p.status = 'active'
      and (p.role = 'owner' or ap.module = module_name)
  );
$$;

alter table public.admin_profiles enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.media_assets enable row level security;
alter table public.news_articles enable row level security;
alter table public.news_translations enable row level security;
alter table public.news_categories enable row level security;
alter table public.news_article_categories enable row level security;

create policy admin_profiles_read on public.admin_profiles for select to authenticated
  using (auth_user_id = auth.uid() or public.has_admin_permission('access'));
create policy admin_profiles_manage on public.admin_profiles for all to authenticated
  using (public.has_admin_permission('access')) with check (public.has_admin_permission('access'));

create policy admin_permissions_read on public.admin_permissions for select to authenticated
  using (public.has_admin_permission('access'));
create policy admin_permissions_manage on public.admin_permissions for all to authenticated
  using (public.has_admin_permission('access')) with check (public.has_admin_permission('access'));

create policy audit_log_read on public.admin_audit_log for select to authenticated
  using (public.has_admin_permission('access'));
create policy audit_log_insert on public.admin_audit_log for insert to authenticated
  with check (public.is_active_admin());

create policy media_admin_access on public.media_assets for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());

create policy news_public_read on public.news_articles for select to anon, authenticated
  using (status = 'published' and (published_at is null or published_at <= now()));
create policy news_admin_access on public.news_articles for all to authenticated
  using (public.has_admin_permission('news')) with check (public.has_admin_permission('news'));

create policy news_translation_public_read on public.news_translations for select to anon, authenticated
  using (exists (
    select 1 from public.news_articles a
    where a.id = article_id and a.status = 'published' and (a.published_at is null or a.published_at <= now())
  ));
create policy news_translation_admin_access on public.news_translations for all to authenticated
  using (public.has_admin_permission('news')) with check (public.has_admin_permission('news'));

create policy news_category_public_read on public.news_categories for select to anon, authenticated
  using (exists (
    select 1 from public.news_article_categories ac
    join public.news_articles a on a.id = ac.article_id
    where ac.category_id = id and a.status = 'published'
  ));
create policy news_category_admin_access on public.news_categories for all to authenticated
  using (public.has_admin_permission('news')) with check (public.has_admin_permission('news'));

create policy news_article_category_public_read on public.news_article_categories for select to anon, authenticated
  using (exists (
    select 1 from public.news_articles a
    where a.id = article_id and a.status = 'published'
  ));
create policy news_article_category_admin_access on public.news_article_categories for all to authenticated
  using (public.has_admin_permission('news')) with check (public.has_admin_permission('news'));
