# Full-Stack Architecture Notes

## Target Stack

- Next.js App Router with TypeScript.
- Supabase Postgres for structured content.
- Supabase Auth for admin/editor access.
- Supabase Row Level Security for admin-only writes and public reads.
- Cloudflare R2 for media and files.
- Next route handlers for public APIs, file signing, webhooks, and form endpoints.
- Server actions for admin/editor mutations.

## Rendering Strategy

- Mostly static public content should use SSG or ISR.
- News, events, people, societies, congresses, and group pages can be cached and revalidated after edits.
- Admin pages should be dynamic and auth-gated.
- Public forms should submit to route handlers with spam protection.

## Service Client Rule

Do not initialize Supabase, Cloudflare, email, or other service SDK clients at module scope. Use lazy getter functions so `next build` does not crash when environment variables are absent in static generation contexts.

## Environment Variables

Expected future variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`)
- `NEXT_PUBLIC_SITE_URL`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_PUBLIC_BASE_URL`
- `RESEND_API_KEY` or equivalent email provider
- `ADMIN_EMAIL_ALLOWLIST`

## Admin Areas

Recommended protected sections:

- Pages
- News
- Events
- Congresses
- People
- Committees
- Member societies
- Special interest groups
- Educational library
- Media/files
- Forms and submissions
- Newsletter subscribers

## File Handling

Cloudflare R2 should hold:

- Original migrated Wix images
- Optimized image variants if generated
- Congress PDFs
- Bylaws/publications
- Abstract files and poster assets
- Headshots and country flags
- Event/webinar thumbnails

Store file metadata in Supabase:

- `id`
- `bucket_key`
- `public_url`
- `mime_type`
- `size_bytes`
- `alt_text`
- `caption`
- `credit`
- `source_url`
- `created_at`
- `updated_at`

Admin uploads use a short-lived, server-generated R2 presigned `PUT` URL. The
browser sends the file directly to R2, then a small authenticated request saves
the metadata in Supabase. This avoids Vercel's serverless request-body limit
for files larger than 4.5 MB and keeps R2 credentials server-only.

## Forms

Observed forms:

- Newsletter signup
- Contact us
- Congress contact
- Public/patient question form
- Join ArLAR

All forms should store submissions in Supabase, optionally notify admins by email, and include spam/rate-limit protection.
