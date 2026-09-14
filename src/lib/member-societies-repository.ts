import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import sourceData from "@/data/national-societies.json";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabasePublicDataClient, getCurrentAdminProfileId, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MemberSocietySocial = {
  platform: string;
  url: string;
  verified: boolean;
};

export type ManagedMemberSociety = {
  id: string;
  name: string;
  abbreviation: string;
  websiteUrl: string | null;
  websiteDisplay: string;
  socials: MemberSocietySocial[];
};

export type ManagedMemberCountry = {
  country: string;
  countryCode: string;
  slug: string;
  flag: string;
  background: string;
  backgroundCredit: string;
  societies: ManagedMemberSociety[];
};

type Store = { version: 1; countries: Record<string, ManagedMemberCountry> };

const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "member-societies.json");

function sourceCountries() {
  return structuredClone(sourceData.countries) as ManagedMemberCountry[];
}

function readStore(): Store {
  if (!existsSync(statePath)) return { version: 1, countries: {} };
  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<Store>;
    return { version: 1, countries: parsed.countries && typeof parsed.countries === "object" ? parsed.countries : {} };
  } catch {
    return { version: 1, countries: {} };
  }
}

function writeStore(store: Store) {
  mkdirSync(stateDirectory, { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, statePath);
}

export function getManagedMemberCountries(): ManagedMemberCountry[] {
  const store = readStore();
  const source = sourceCountries();
  const sourceSlugs = new Set(source.map((country) => country.slug));
  return [
    ...source.map((country) => store.countries[country.slug] || country),
    ...Object.values(store.countries).filter((country) => !sourceSlugs.has(country.slug)),
  ];
}

export function getManagedMemberCountry(slug: string) {
  return getManagedMemberCountries().find((country) => country.slug === slug);
}

export function saveManagedMemberCountry(input: ManagedMemberCountry) {
  const country = sanitizeCountry(input);
  const store = readStore();
  store.countries[country.slug] = country;
  writeStore(store);
  return country;
}

export function makeMemberCountrySlug(country: string, countryCode: string) {
  const base = country.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (base || countryCode.toLowerCase() || "member-country").slice(0, 80);
}

function sanitizeCountry(input: ManagedMemberCountry): ManagedMemberCountry {
  const country = cleanText(input.country, 100);
  const countryCode = cleanText(input.countryCode, 3).toUpperCase();
  const slug = cleanId(input.slug || makeMemberCountrySlug(country, countryCode));
  if (!country || countryCode.length !== 2) throw new Error("Country name and a two-letter country code are required.");
  return {
    country,
    countryCode,
    slug,
    flag: cleanMedia(input.flag),
    background: cleanMedia(input.background),
    backgroundCredit: cleanText(input.backgroundCredit, 120),
    societies: input.societies.map(sanitizeSociety),
  };
}

function sanitizeSociety(society: ManagedMemberSociety): ManagedMemberSociety {
  const name = cleanText(society.name, 180);
  if (!name) throw new Error("Every society needs a name.");
  return {
    id: cleanId(society.id),
    name,
    abbreviation: cleanText(society.abbreviation, 30),
    websiteUrl: cleanUrl(society.websiteUrl),
    websiteDisplay: cleanText(society.websiteDisplay, 140),
    socials: society.socials.flatMap((social): MemberSocietySocial[] => {
      const platform = cleanText(social.platform, 30);
      const url = cleanUrl(social.url);
      return platform && url ? [{ platform, url, verified: Boolean(social.verified) }] : [];
    }),
  };
}

function cleanText(value: unknown, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanId(value: unknown) {
  const id = cleanText(value, 180).replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "");
  if (!id) throw new Error("A valid record ID is required.");
  return id;
}

function cleanMedia(value: unknown) {
  const media = cleanText(value, 500);
  return media.startsWith("/") || media.startsWith("https://") ? media : "";
}

function cleanUrl(value: unknown) {
  const url = cleanText(value, 500);
  if (!url) return null;
  return url.startsWith("https://") || url.startsWith("http://") ? url : null;
}

export async function getManagedMemberCountriesAsync(): Promise<ManagedMemberCountry[]> {
  if (!getSupabasePublicConfig()) return getManagedMemberCountries();
  try {
    const supabase = createSupabasePublicDataClient();
    if (!supabase) return getManagedMemberCountries();
    const { data, error } = await supabase.from("admin_member_countries").select("data").order("country");
    if (error) throw error;
    if (!data?.length) return getManagedMemberCountries();
    // Stored rows are OVERRIDES on the source list, not a replacement. Mirrors
    // getManagedMemberCountries() so a country that has never been saved
    // through the admin panel still appears on the public directory.
    const stored = data.map((row) => row.data as ManagedMemberCountry);
    const overrides = new Map(stored.map((country) => [country.slug, country] as const));
    const source = sourceCountries();
    const sourceSlugs = new Set(source.map((country) => country.slug));
    return [
      ...source.map((country) => overrides.get(country.slug) || country),
      ...stored.filter((country) => !sourceSlugs.has(country.slug)),
    ];
  } catch (error) {
    reportSupabaseReadFallback("admin-member-countries", error);
    return getManagedMemberCountries();
  }
}

export async function getManagedMemberCountryAsync(slug: string) {
  return (await getManagedMemberCountriesAsync()).find((country) => country.slug === slug);
}

export async function saveManagedMemberCountryAsync(input: ManagedMemberCountry) {
  const country = sanitizeCountry(input);
  if (!getSupabasePublicConfig()) return saveManagedMemberCountry(country);
  const supabase = await createSupabaseServerClient();
  const createdBy = await getCurrentAdminProfileId(supabase);
  const { error: countryError } = await supabase.from("admin_member_countries").upsert({ slug: country.slug, country: country.country, country_code: country.countryCode, data: country, created_by: createdBy });
  if (countryError) throw countryError;
  const { error: deleteError } = await supabase.from("admin_member_societies").delete().eq("country_slug", country.slug);
  if (deleteError) throw deleteError;
  if (country.societies.length) {
    const { error: societyError } = await supabase.from("admin_member_societies").insert(country.societies.map((society) => ({ id: society.id, country_slug: country.slug, name: society.name, abbreviation: society.abbreviation, data: society, created_by: createdBy })));
    if (societyError) throw societyError;
  }
  return country;
}

// Local persistence boundary. Replace with Supabase country, society, and
// society-social tables without changing the editor or public directory.
