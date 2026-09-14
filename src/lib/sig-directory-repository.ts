import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";

import { specialInterestGroups } from "@/data/special-interest-groups";
import { getSigProfile, type SigProfile } from "@/data/sig-profiles";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabasePublicDataClient, getCurrentAdminProfileId, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ManagedSigDirectoryEntry = {
  slug: string;
  name: string;
  abbreviation: string;
  logo: string;
  visible: boolean;
  order: number;
};

type SigOverride = Partial<Pick<ManagedSigDirectoryEntry, "name" | "abbreviation" | "logo" | "visible">>;
type SigDirectoryStore = { version: 1; order: string[]; entries: Record<string, SigOverride> };

const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "sig-directory.json");
const validSlugs = new Set(specialInterestGroups.map((group) => group.slug));

function readStore(): SigDirectoryStore {
  if (!existsSync(statePath)) return { version: 1, order: [], entries: {} };
  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<SigDirectoryStore>;
    return {
      version: 1,
      order: Array.isArray(parsed.order) ? parsed.order.filter((slug): slug is string => typeof slug === "string" && validSlugs.has(slug)) : [],
      entries: parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {},
    };
  } catch {
    return { version: 1, order: [], entries: {} };
  }
}

function writeStore(store: SigDirectoryStore) {
  mkdirSync(stateDirectory, { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, statePath);
}

export function getManagedSigDirectory(): ManagedSigDirectoryEntry[] {
  const store = readStore();
  const order = [...new Set([...store.order, ...specialInterestGroups.map((group) => group.slug)])];
  const sourceBySlug = new Map(specialInterestGroups.map((group) => [group.slug, group]));
  return order.flatMap((slug, index): ManagedSigDirectoryEntry[] => {
    const source = sourceBySlug.get(slug);
    if (!source) return [];
    const override = store.entries[slug] || {};
    return [{
      slug,
      name: cleanText(override.name, source.name, 140),
      abbreviation: cleanText(override.abbreviation, source.abbreviation, 24),
      logo: cleanLogo(override.logo, source.logo),
      visible: typeof override.visible === "boolean" ? override.visible : true,
      order: index + 1,
    }];
  });
}

export function getManagedSig(slug: string) {
  return getManagedSigDirectory().find((group) => group.slug === slug);
}

export function updateManagedSig(slug: string, update: { name: string; abbreviation: string; logo: string; visible: boolean }) {
  assertSlug(slug);
  const source = specialInterestGroups.find((group) => group.slug === slug)!;
  const store = readStore();
  store.entries[slug] = {
    name: cleanText(update.name, source.name, 140),
    abbreviation: cleanText(update.abbreviation, source.abbreviation, 24),
    logo: cleanLogo(update.logo, source.logo),
    visible: update.visible,
  };
  writeStore(store);
}

export function setManagedSigVisibility(slug: string, visible: boolean) {
  assertSlug(slug);
  const store = readStore();
  store.entries[slug] = { ...(store.entries[slug] || {}), visible };
  writeStore(store);
}

export function setManagedSigOrder(slugs: string[]) {
  const unique = [...new Set(slugs.filter((slug) => validSlugs.has(slug)))];
  const missing = specialInterestGroups.map((group) => group.slug).filter((slug) => !unique.includes(slug));
  const store = readStore();
  store.order = [...unique, ...missing];
  writeStore(store);
}

function assertSlug(slug: string) {
  if (!validSlugs.has(slug)) throw new Error("Unknown SIG record.");
}

function cleanText(value: unknown, fallback: string, maxLength: number) {
  const clean = String(value || "").trim().slice(0, maxLength);
  return clean || fallback;
}

function cleanLogo(value: unknown, fallback: string) {
  const clean = String(value || "").trim().slice(0, 500);
  return clean.startsWith("/") || clean.startsWith("https://") ? clean : fallback;
}

const getCachedPublicSigDirectory = unstable_cache(
  async () => {
    const supabase = createSupabasePublicDataClient();
    if (!supabase) return null;
    const { data, error } = await supabase.from("admin_sigs").select("slug, name, abbreviation, logo_url, visible, sort_order").order("sort_order");
    if (error) throw error;
    return data;
  },
  ["public-sig-directory"],
  { tags: ["public-sigs"], revalidate: false },
);

export async function getManagedSigDirectoryAsync(access: "public" | "admin" = "public"): Promise<ManagedSigDirectoryEntry[]> {
  if (!getSupabasePublicConfig()) return getManagedSigDirectory();
  try {
    const data = access === "public"
      ? await getCachedPublicSigDirectory()
      : await (async () => {
          const supabase = await createSupabaseServerClient();
          const result = await supabase.from("admin_sigs").select("slug, name, abbreviation, logo_url, visible, sort_order").order("sort_order");
          if (result.error) throw result.error;
          return result.data;
        })();
    if (!data?.length) return getManagedSigDirectory();
    // Stored rows are OVERRIDES on the source group list, not a replacement.
    // Returning only stored rows would hide any SIG never saved in the admin.
    const overrides = new Map(
      data.map((row) => [row.slug, { slug: row.slug, name: row.name, abbreviation: row.abbreviation, logo: row.logo_url, visible: row.visible, order: row.sort_order }] as const),
    );
    return getManagedSigDirectory()
      .map((entry) => overrides.get(entry.slug) || entry)
      .toSorted((a, b) => a.order - b.order);
  } catch (error) {
    reportSupabaseReadFallback("admin-sigs", error);
    return getManagedSigDirectory();
  }
}

export async function getManagedSigAsync(slug: string, access: "public" | "admin" = "public") {
  return (await getManagedSigDirectoryAsync(access)).find((group) => group.slug === slug);
}

export async function getManagedSigProfileAsync(slug: string, access: "public" | "admin" = "public"): Promise<SigProfile | undefined> {
  const sourceProfile = getSigProfile(slug);
  if (sourceProfile) return sourceProfile;
  if (!getSupabasePublicConfig()) return sourceProfile;
  try {
    const supabase = access === "admin" ? await createSupabaseServerClient() : createSupabasePublicDataClient();
    if (!supabase) return sourceProfile;
    const { data, error } = await supabase.from("admin_sigs").select("data").eq("slug", slug).maybeSingle();
    if (error) throw error;
    const raw = data?.data ?? null;
    const stored = raw as { profile?: SigProfile } | SigProfile | null;
    if (stored && "profile" in stored && stored.profile) return stored.profile;
    if (stored && "tabs" in stored) return stored;
  } catch (error) {
    reportSupabaseReadFallback("admin-sig-profile", error);
  }
  return getSigProfile(slug);
}

export async function updateManagedSigAsync(slug: string, update: { name: string; abbreviation: string; logo: string; visible: boolean }) {
  if (!getSupabasePublicConfig()) return updateManagedSig(slug, update);
  assertSlug(slug);
  const source = specialInterestGroups.find((group) => group.slug === slug)!;
  const supabase = await createSupabaseServerClient();
  const createdBy = await getCurrentAdminProfileId(supabase);
  const { error } = await supabase.from("admin_sigs").upsert({
    slug,
    name: cleanText(update.name, source.name, 140),
    abbreviation: cleanText(update.abbreviation, source.abbreviation, 24),
    logo_url: cleanLogo(update.logo, source.logo),
    visible: update.visible,
    data: { directory: { ...source, ...update }, profile: getSigProfile(slug) || null },
    created_by: createdBy,
  });
  if (error) throw error;
}

export async function setManagedSigVisibilityAsync(slug: string, visible: boolean) {
  if (!getSupabasePublicConfig()) return setManagedSigVisibility(slug, visible);
  assertSlug(slug);
  const current = await getManagedSigAsync(slug, "admin");
  if (!current) throw new Error("Unknown SIG record.");
  await updateManagedSigAsync(slug, {
    name: current.name,
    abbreviation: current.abbreviation,
    logo: current.logo,
    visible,
  });
}

export async function setManagedSigOrderAsync(slugs: string[]) {
  if (!getSupabasePublicConfig()) return setManagedSigOrder(slugs);
  const unique = [...new Set(slugs.filter((slug) => validSlugs.has(slug)))];
  const missing = specialInterestGroups.map((group) => group.slug).filter((slug) => !unique.includes(slug));
  const currentDirectory = await getManagedSigDirectoryAsync("admin");
  const currentBySlug = new Map(currentDirectory.map((entry) => [entry.slug, entry]));
  const supabase = await createSupabaseServerClient();
  const createdBy = await getCurrentAdminProfileId(supabase);
  const rows = [...unique, ...missing].map((slug, index) => {
    const source = specialInterestGroups.find((group) => group.slug === slug)!;
    const current = currentBySlug.get(slug);
    return {
      slug,
      name: current?.name || source.name,
      abbreviation: current?.abbreviation || source.abbreviation,
      logo_url: current?.logo || source.logo,
      visible: current?.visible ?? true,
      sort_order: index + 1,
      data: {
        directory: {
          ...source,
          name: current?.name || source.name,
          abbreviation: current?.abbreviation || source.abbreviation,
          logo: current?.logo || source.logo,
          visible: current?.visible ?? true,
        },
        profile: getSigProfile(slug) || null,
      },
      created_by: createdBy,
    };
  });
  const { error } = await supabase.from("admin_sigs").upsert(rows);
  if (error) throw error;
}

// Local persistence adapter. Replace these reads and writes with the future
// Supabase SIG table without changing the admin or public components.
