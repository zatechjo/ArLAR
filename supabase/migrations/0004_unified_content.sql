-- Unified public/admin content access.
-- Structured content lives in Postgres; media binaries remain in Cloudflare R2.

alter table public.news_articles add column if not exists lifecycle text not null default 'active'
  check (lifecycle in ('active', 'trashed', 'deleted'));
alter table public.news_articles add column if not exists deleted_at timestamptz;

drop policy if exists news_public_read on public.news_articles;
create policy news_public_read on public.news_articles for select to anon, authenticated
  using (lifecycle = 'active' and status = 'published' and (published_at is null or published_at <= now()));

drop policy if exists news_translation_public_read on public.news_translations;
create policy news_translation_public_read on public.news_translations for select to anon, authenticated
  using (exists (
    select 1 from public.news_articles a
    where a.id = article_id and a.lifecycle = 'active' and a.status = 'published'
      and (a.published_at is null or a.published_at <= now())
  ));

create table if not exists public.site_content (
  namespace text not null,
  content_key text not null,
  locale text not null default 'en',
  status text not null default 'published' check (status in ('published', 'draft')),
  sort_order integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  updated_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (namespace, content_key, locale)
);

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at before update on public.site_content
for each row execute function public.touch_updated_at();

alter table public.site_content enable row level security;

drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read on public.site_content for select to anon
  using (status = 'published');
drop policy if exists site_content_admin_read on public.site_content;
create policy site_content_admin_read on public.site_content for select to authenticated
  using (status = 'published' or public.is_active_admin());
drop policy if exists site_content_admin_manage on public.site_content;
create policy site_content_admin_manage on public.site_content for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());

drop policy if exists media_assets_public_read on public.media_assets;
create policy media_assets_public_read on public.media_assets for select to anon, authenticated
  using (true);

drop policy if exists admin_doctors_public_read on public.admin_doctors;
create policy admin_doctors_public_read on public.admin_doctors for select to anon
  using (status = 'active');
drop policy if exists admin_arlar27_sections_public_read on public.admin_arlar27_sections;
create policy admin_arlar27_sections_public_read on public.admin_arlar27_sections for select to anon
  using (status = 'ready');
drop policy if exists admin_arlar27_people_public_read on public.admin_arlar27_people;
create policy admin_arlar27_people_public_read on public.admin_arlar27_people for select to anon
  using (true);
drop policy if exists admin_college_events_public_read on public.admin_college_events;
create policy admin_college_events_public_read on public.admin_college_events for select to anon
  using (status = 'published');
drop policy if exists admin_sigs_public_read on public.admin_sigs;
create policy admin_sigs_public_read on public.admin_sigs for select to anon
  using (visible);
drop policy if exists admin_member_countries_public_read on public.admin_member_countries;
create policy admin_member_countries_public_read on public.admin_member_countries for select to anon
  using (true);
drop policy if exists admin_member_societies_public_read on public.admin_member_societies;
create policy admin_member_societies_public_read on public.admin_member_societies for select to anon
  using (true);
drop policy if exists admin_congresses_public_read on public.admin_congresses;
create policy admin_congresses_public_read on public.admin_congresses for select to anon
  using (status = 'published');
drop policy if exists admin_congress_videos_public_read on public.admin_congress_videos;
create policy admin_congress_videos_public_read on public.admin_congress_videos for select to anon
  using (status = 'published' and exists (
    select 1 from public.admin_congresses c where c.id = congress_id and c.status = 'published'
  ));
drop policy if exists admin_congress_gallery_public_read on public.admin_congress_gallery;
create policy admin_congress_gallery_public_read on public.admin_congress_gallery for select to anon
  using (exists (
    select 1 from public.admin_congresses c where c.id = congress_id and c.status = 'published'
  ));
drop policy if exists admin_professional_resources_public_read on public.admin_professional_resources;
create policy admin_professional_resources_public_read on public.admin_professional_resources for select to anon
  using (status = 'published');
drop policy if exists admin_deletions_public_read on public.admin_deletions;

create or replace function public.public_deleted_record_ids(requested_scope text)
returns table(record_id text)
language sql
stable
security definer
set search_path = public
as $$
  select d.record_id
  from public.admin_deletions d
  where d.scope = requested_scope;
$$;

revoke all on function public.public_deleted_record_ids(text) from public;
grant execute on function public.public_deleted_record_ids(text) to anon, authenticated;

create or replace function public.activate_my_admin_invitation()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  activated boolean;
begin
  update public.admin_profiles
  set status = 'active', last_active_at = now(), updated_at = now()
  where auth_user_id = auth.uid() and status = 'invited';
  activated := found;
  return activated;
end;
$$;

revoke all on function public.activate_my_admin_invitation() from public;
grant execute on function public.activate_my_admin_invitation() to authenticated;
drop policy if exists inbox_public_submit on public.admin_inbox_records;
create policy inbox_public_submit on public.admin_inbox_records for insert to anon
  with check (kind in ('contact', 'question', 'subscriber'));

grant select on table
  public.site_content,
  public.media_assets,
  public.admin_doctors,
  public.admin_arlar27_sections,
  public.admin_arlar27_people,
  public.admin_college_events,
  public.admin_sigs,
  public.admin_member_countries,
  public.admin_member_societies,
  public.admin_congresses,
  public.admin_congress_videos,
  public.admin_congress_gallery,
  public.admin_professional_resources
to anon;

grant insert on table public.admin_inbox_records to anon;

grant select, insert, update, delete on table public.site_content to authenticated;
