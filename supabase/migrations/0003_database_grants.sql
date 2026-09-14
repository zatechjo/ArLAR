-- Explicit Data API privileges for projects that do not automatically expose
-- new public-schema tables. RLS policies remain the final authorization layer.

grant usage on schema public to anon, authenticated;

revoke all on function public.is_active_admin() from public;
revoke all on function public.has_admin_permission(text) from public;
grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.has_admin_permission(text) to authenticated;

grant select, insert, update, delete on table
  public.admin_profiles,
  public.admin_permissions
to authenticated;

grant select, insert on table public.admin_audit_log to authenticated;

grant select, insert, update, delete on table
  public.media_assets,
  public.news_articles,
  public.news_translations,
  public.news_categories,
  public.news_article_categories
to authenticated;

grant select on table
  public.news_articles,
  public.news_translations,
  public.news_categories,
  public.news_article_categories
to anon;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'admin_doctors', 'admin_arlar27_sections', 'admin_arlar27_people',
    'admin_college_events', 'admin_sigs', 'admin_member_countries',
    'admin_member_societies', 'admin_congresses', 'admin_congress_videos',
    'admin_congress_gallery', 'admin_professional_resources',
    'admin_inbox_records', 'admin_deletions'
  ] loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format(
        'grant select, insert, update, delete on table public.%I to authenticated',
        table_name
      );
    end if;
  end loop;
end $$;
