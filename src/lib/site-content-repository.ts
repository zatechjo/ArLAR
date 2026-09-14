import "server-only";

import { unstable_cache } from "next/cache";

import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabasePublicDataClient, getCurrentAdminProfileId, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * JSON content cannot persist React component references. Rehydrate the small
 * set of presentation-only icons that accompany the ArLAR27 gateway cards
 * from the local shape after loading their editable content from Supabase.
 */
function rehydrateSiteContent<T>(namespace: string, contentKey: string, data: unknown, fallback: T): T {
  if (namespace !== "arlar27" || contentKey !== "gateway-cards" || !Array.isArray(data) || !Array.isArray(fallback)) {
    return data as T;
  }

  const fallbackCards = fallback as Array<Record<string, unknown>>;
  return data.map((item, index) => {
    const card = item && typeof item === "object" ? item as Record<string, unknown> : {};
    const fallbackCard = fallbackCards.find((candidate) => candidate.href === card.href) || fallbackCards[index];
    return { ...fallbackCard, ...card, icon: card.icon || fallbackCard?.icon };
  }) as T;
}

const getCachedPublishedSiteContent = unstable_cache(
  async (namespace: string, contentKey: string, locale: string) => {
    const supabase = createSupabasePublicDataClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("namespace", namespace)
      .eq("content_key", contentKey)
      .eq("locale", locale)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return data?.data ?? null;
  },
  ["published-site-content"],
  { tags: ["published-site-content"], revalidate: false },
);

const listCachedPublishedSiteContent = unstable_cache(
  async (namespace: string, locale: string) => {
    const supabase = createSupabasePublicDataClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("namespace", namespace)
      .eq("locale", locale)
      .eq("status", "published")
      .order("sort_order");
    if (error) throw error;
    return data?.map((row) => row.data) ?? null;
  },
  ["published-site-content-list"],
  { tags: ["published-site-content"], revalidate: false },
);

export async function getPublishedSiteContent<T>(namespace: string, contentKey: string, fallback: T, locale = "en"): Promise<T> {
  if (!getSupabasePublicConfig()) return fallback;
  try {
    const data = await getCachedPublishedSiteContent(namespace, contentKey, locale);
    return data ? rehydrateSiteContent(namespace, contentKey, data, fallback) : fallback;
  } catch (error) {
    reportSupabaseReadFallback(`site-content:${namespace}:${contentKey}`, error);
    return fallback;
  }
}

export async function listPublishedSiteContent<T>(namespace: string, fallback: T[], locale = "en"): Promise<T[]> {
  if (!getSupabasePublicConfig()) return fallback;
  try {
    const data = await listCachedPublishedSiteContent(namespace, locale);
    return data?.length ? data as T[] : fallback;
  } catch (error) {
    reportSupabaseReadFallback(`site-content:${namespace}`, error);
    return fallback;
  }
}

export async function saveSiteContent(namespace: string, contentKey: string, data: unknown, options: { locale?: string; status?: "published" | "draft"; sortOrder?: number } = {}) {
  if (!getSupabasePublicConfig()) throw new Error("Supabase must be configured before shared site content can be saved.");
  const supabase = await createSupabaseServerClient();
  const updatedBy = await getCurrentAdminProfileId(supabase);
  const { error } = await supabase.from("site_content").upsert({ namespace, content_key: contentKey, locale: options.locale || "en", status: options.status || "published", sort_order: options.sortOrder || 0, data, updated_by: updatedBy }, { onConflict: "namespace,content_key,locale" });
  if (error) throw error;
}
