# Bilingual Wix blog migration

The Wix English and Arabic blogs are exported with the same `WIX_API_KEY` and `WIX_ACCOUNT_ID`.

Run:

```bash
npm run sync:wix-blog-bilingual
```

The script uses the Wix `GET /blog/v3/posts` endpoint for both sites. The Arabic site rejects the POST query variant, so the existing English-only importer should not be copied unchanged.

Outputs are written to `data/wix/blog/bilingual/`:

- `en.posts.json` — English source posts.
- `ar.posts.json` — Arabic source posts.
- `merged.posts.json` — 290 English canonical records, Arabic translations attached only for safe content matches, and unmatched Arabic posts kept as `locale: "ar"` records.
- `translations.json` — compact translation lookup used by the admin news editor.
- `merge-report.json` — match decisions and counts.

The current live comparison produced 290 English posts and 291 Arabic posts. Wix often created the localized pair at the same publish timestamp while giving it a different slug, so matching uses exact slug/title first and then a strict two-minute publish-time window. That found 269 paired records: 74 Arabic-content translation candidates and 195 English duplicates. The merged export contains 312 usable records: 290 English canonical records with 74 Arabic translations attached, plus 22 standalone Arabic records (17 contain predominantly Arabic text). This is intentional: unrelated English duplicates are not copied a second time.

For Supabase, load these as one `news_articles` table plus a `news_translations` table keyed by a stable canonical article id. Keep `source_site_id`, `source_post_id`, `locale`, and `source_slug` so future Wix syncs remain idempotent and media can later be moved to Cloudflare storage without losing provenance.

The admin editor now falls back to the English title/body for empty Arabic and French fields. Imported Arabic content overrides that fallback when a matching Wix translation exists.
