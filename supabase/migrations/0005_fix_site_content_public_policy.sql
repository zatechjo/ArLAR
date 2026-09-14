-- Fix the site_content RLS policy for anonymous/public reads.
-- The anon role must not need execute permission on is_active_admin().

drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read on public.site_content for select to anon
  using (status = 'published');

drop policy if exists site_content_admin_read on public.site_content;
create policy site_content_admin_read on public.site_content for select to authenticated
  using (status = 'published' or public.is_active_admin());
