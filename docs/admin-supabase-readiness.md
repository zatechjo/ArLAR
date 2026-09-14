# Admin panel → Supabase hand-off

The admin UI talks to server-only repositories and Server Actions. Replace repository internals with Supabase queries; keep component props and action signatures stable.

## Authentication and authorization

- Replace `requireAdminSession()` in `src/lib/admin-authorization.ts` with a server Supabase client created from `cookies()`.
- Resolve the session user through `admin_profiles.auth_user_id` and load `admin_permissions`.
- Keep production fail-closed. Never restore a client-side admin bypass.
- Protect `/admin/(panel)` reads in the layout and every mutation through `requireAdminPermission()`.
- Only `admin@arabrheumatology.org` may pass `requireAdminOwner()` and manage access.
- Use Supabase Auth invitations, password recovery, session revocation, and MFA. Do not store passwords in content tables.

## Recommended core tables

| Table | Important columns |
| --- | --- |
| `admin_profiles` | `id`, `auth_user_id`, `email`, `name`, `role`, `status`, `invited_at`, `last_active_at`, timestamps |
| `admin_permissions` | `admin_profile_id`, `module`, timestamps; unique pair |
| `admin_audit_log` | `actor_id`, `action`, `entity_type`, `entity_id`, `summary`, `metadata jsonb`, `created_at` |
| `media_assets` | `id`, `storage_key`, `public_url`, `original_name`, `mime_type`, `kind`, `size_bytes`, `folder`, dimensions, `created_by`, timestamps |
| `deleted_records` | `entity_type`, `entity_id`, `deleted_by`, `deleted_at`; use real soft-delete columns where practical |

## Content table mapping

| Current repository | Supabase destination |
| --- | --- |
| `admin-news-repository.ts` | `news_articles`, `news_translations`, `news_categories` |
| `admin-doctor-repository.ts` | `doctors`, `doctor_name_variants`, `doctor_appearances` |
| `college-upcoming-event.ts`, `admin-college-repository.ts` | `college_events`, `college_event_groups` |
| `admin-congress-data.ts` | `congresses`, `congress_replays`, `congress_gallery_days`, `congress_gallery_images` |
| `arlar27-admin-repository.ts` | `arlar27_sections`, `arlar27_content`, `arlar27_people`, or congress-scoped equivalents |
| `sig-directory-repository.ts` | `special_interest_groups`, `sig_members`, `sig_resources` |
| `member-societies-repository.ts` | `member_countries`, `member_societies`, `member_society_socials` |
| `professional-resources-repository.ts` | `professional_resources`, `resource_authors`, `resource_topics` |
| `inbox-repository.ts` | `contact_submissions`, `public_questions`, `mailing_subscribers` |
| `access-control-repository.ts` | `admin_profiles`, `admin_permissions`, `admin_audit_log` |

## Storage migration

- Move uploads from `public/uploads` to the chosen object store.
- Keep database rows URL/storage-key based; do not store file bytes in Postgres.
- Preserve original names and MIME types, generate collision-safe storage keys, and validate size/type server-side.
- Use signed upload URLs for private assets. Public website assets may use stable public URLs/CDN delivery.
- Current upload limits are 20 files, 25 MB each, and 100 MB per batch.

## RLS baseline

- Public visitors: select only published/public rows.
- Contributors: select assigned modules; insert/update drafts; no publishing or permanent deletion.
- Editors: manage and publish assigned modules; no access-control changes.
- Owner: full admin rights, access management, and permanent deletion.
- Inbox records and admin audit logs must never be publicly selectable.
- Storage policies must mirror module permissions and media visibility.

## Cutover sequence

1. Create Auth, profile, permission, audit, and media tables with RLS.
2. Replace `admin-authorization.ts`; verify suspended users and revoked permissions immediately lose access.
3. Migrate one repository at a time, starting with access control and news.
4. Import immutable source JSON, then local `.admin-data` overlays, preserving stable IDs.
5. Migrate media and rewrite only storage URLs/keys.
6. Exercise create, edit, publish, soft delete, restore, permanent delete, and public visibility for every module.
7. Remove `ADMIN_DEMO_ACCESS` from production and rotate any migration credentials.
