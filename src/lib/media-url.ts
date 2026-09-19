import { migratedWixDocumentUrl } from "@/lib/wix-document-url";

/**
 * Resolve migrated public media paths to their R2 public URL while preserving
 * a local-path fallback for development before R2 is configured.
 */
export function publicMediaUrl(src: string | null | undefined) {
  const value = migratedWixDocumentUrl(String(src || "").trim());
  if (!value || (!value.startsWith("/documents/") && !value.startsWith("/images/") && !value.startsWith("/Arab Flags/"))) return value;
  const base = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  return base ? `${base}/${value.replace(/^\/+/, "")}` : value;
}

/**
 * Keep migrated R2 media on the website origin when it is rendered in a page.
 * Local development can then use `public/`, while Vercel serves the same path
 * through the R2 rewrites without exposing a second browser-facing host.
 */
export function siteMediaUrl(src: string | null | undefined) {
  const value = String(src || "").trim();
  const base = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  return base && value.startsWith(`${base}/`) ? value.slice(base.length) : value;
}
