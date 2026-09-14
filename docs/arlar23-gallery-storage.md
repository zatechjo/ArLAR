# ArLAR23 gallery storage

The replay page reads the generated `src/data/arlar23-gallery.json` manifest. The manifest is built from the four local folders under `public/images/arlar23/gallery/` in ascending download timestamp order, preserving the Wix page sequence.

Run:

```bash
npm run build:arlar23-gallery-manifest
```

For local development, images are served from those folders. The full-resolution folders are git-ignored because they are multi-gigabyte staging files and should not be sent to Vercel.

When the images are uploaded to Cloudflare R2 (or another Cloudflare-backed public hostname), set this Vercel environment variable:

```text
NEXT_PUBLIC_ARLAR23_GALLERY_BASE_URL=https://images.example.org
```

Each manifest entry maps to an object key such as `images/arlar23/gallery/Day%201/6C8A4818.JPG`, matching the path-preserving R2 migration. Configure the Cloudflare hostname as a public read-only custom domain and give the objects long-lived immutable caching headers. No code changes are needed when switching from the local fallback to that base URL.
