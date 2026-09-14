# Migration Plan

## Phase 1 - Foundation

- Finalize route map and locale strategy.
- Create Supabase schema and RLS policies.
- Create Cloudflare R2 bucket and media metadata table.
- Add lazy service clients.
- Build admin authentication.

## Phase 2 - Content Migration

- Crawl current Wix pages.
- Export or manually capture key content.
- Download and catalog images/files.
- Upload media to Cloudflare R2.
- Seed Supabase with people, societies, groups, events, posts, and pages.
- Preserve existing URLs with redirects where route names change.

## Phase 3 - Public Site

- Build public routes from Supabase data.
- Prioritize Home, About, Board, Members, News, ArLAR College Events, ArLAR25 archive, and public/patient content.

## Phase 4 - Admin

- Editorial dashboard.
- CRUD for pages, posts, people, societies, events, congresses, and files.
- Draft/publish workflow.
- Preview mode.
- Form submission review.

## Phase 5 - Launch

- SEO metadata and sitemap.
- Redirect map.
- Analytics.
- Accessibility pass.
- Performance pass.
- Backup/export routine for Supabase and R2.

## Known Migration Risks

- Wix-hosted media URLs may be unstable or transformed.
- Some current pages are very long and should be normalized into records.
- Blog dates sometimes appear without years in visible listings.
- ArLAR25 has many abstract IDs and should be imported as data, not static markup.
- Multilingual domains need an early routing decision.
- Current public forms show technical issues on at least one patient/public page, so form workflows need fresh implementation.

