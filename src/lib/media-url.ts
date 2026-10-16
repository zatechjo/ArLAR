import { migratedWixDocumentUrl } from "@/lib/wix-document-url";

const legacyR2PublicBaseUrls = [
  "https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev",
];

function configuredMediaUrl(src: string, includeRelativePaths = true) {
  const base = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  if (!base) return src;

  for (const legacyBase of legacyR2PublicBaseUrls) {
    if (src === legacyBase || src.startsWith(`${legacyBase}/`)) {
      return `${base}${src.slice(legacyBase.length)}`;
    }
  }

  if (includeRelativePaths && (src.startsWith("/documents/") || src.startsWith("/images/") || src.startsWith("/uploads/") || src.startsWith("/Arab Flags/"))) {
    return `${base}/${src.replace(/^\/+/, "")}`;
  }

  return src;
}

/**
 * Resolve migrated public media paths to their R2 public URL while preserving
 * a local-path fallback for development before R2 is configured.
 */
export function publicMediaUrl(src: string | null | undefined) {
  const value = migratedWixDocumentUrl(String(src || "").trim());
  return value ? configuredMediaUrl(value) : value;
}

/**
 * Serve migrated media directly from R2's custom domain. This avoids routing
 * large image and document responses through the Vercel deployment while
 * retaining local paths when R2 is not configured during development.
 */
export function siteMediaUrl(src: string | null | undefined) {
  const value = migratedWixDocumentUrl(String(src || "").trim());
  return value ? configuredMediaUrl(value) : value;
}
