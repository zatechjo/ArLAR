import "server-only";

import { revalidatePath } from "next/cache";

import { locales } from "@/i18n/config";

/**
 * Revalidate the internal, locale-prefixed destinations used by Next.js.
 * Public English URLs are rewritten to /en/*, so passing /news directly to
 * revalidatePath would miss the cached route that actually rendered it.
 */
export function revalidateLocalizedPaths(paths: readonly string[]) {
  const uniquePaths = new Set(paths.map(normalizePublicPath));

  for (const locale of locales) {
    for (const path of uniquePaths) {
      revalidatePath(`/${locale}${path === "/" ? "" : path}`);
    }
  }
}

export function revalidatePublicSitemap() {
  revalidatePath("/sitemap.xml");
}

function normalizePublicPath(path: string) {
  const pathname = path.split(/[?#]/, 1)[0]?.trim() || "/";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/$/, "") : "/";
}
