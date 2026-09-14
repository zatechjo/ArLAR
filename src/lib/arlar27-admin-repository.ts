import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";

import {
  arlar27AboutIraq,
  arlar27Committee,
  arlar27ExternalDestinations,
  arlar27Faculty,
  arlar27Welcome,
  type Arlar27PersonPlacement,
} from "@/data/arlar27";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabasePublicDataClient, getCurrentAdminProfileId, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Arlar27SectionStatus = "ready" | "waiting";
export type Arlar27WelcomeTranslation = {
  pageTitle: string; pageDescription: string; greeting: string; paragraphs: string[];
  closing: string; signoff: string; authorRoles: string[];
};
export type Arlar27WelcomeContent = {
  pageTitle: string; pageDescription: string; greeting: string; paragraphs: string[];
  closing: string; signoff: string; authorDoctorId: string; authorRoles: string[];
  translations?: Partial<Record<"ar" | "fr", Arlar27WelcomeTranslation>>;
};
export type Arlar27EssentialCard = { id: string; icon: string; label: string; value: string; note: string };
export type Arlar27VisaFact = { id: string; title: string; text: string };
export type Arlar27WeatherStat = { id: string; label: string; value: string };

export type Arlar27AboutContent = {
  pageTitle: string; pageDescription: string; destinationLabel: string; destination: string;
  heading: string; paragraphs: string[]; planningTitle: string;
  planningCards: Array<{ id: string; title: string; text: string }>;
  heroImage: string;
  essentials: { eyebrow: string; title: string; intro: string; cards: Arlar27EssentialCard[] };
  gallery: { eyebrow: string; title: string; intro: string };
  visa: {
    eyebrow: string; title: string; lead: string; ctaLabel: string; portalUrl: string;
    facts: Arlar27VisaFact[]; note: string;
  };
  weather: { eyebrow: string; title: string; intro: string; stats: Arlar27WeatherStat[] };
};
export type Arlar27ExternalDestination = { label: string; url: string; enabled: boolean };

type Store = {
  version: 1;
  statuses: Record<string, Arlar27SectionStatus>;
  welcome?: Arlar27WelcomeContent;
  aboutIraq?: Arlar27AboutContent;
  external?: Partial<Record<"abstracts" | "registration", Arlar27ExternalDestination>>;
  committee?: Arlar27PersonPlacement[];
  faculty?: Arlar27PersonPlacement[];
};

const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "arlar27-content.json");
const defaultStatuses: Record<string, Arlar27SectionStatus> = { welcome: "ready", committee: "ready", faculty: "waiting", abstracts: "waiting", registration: "waiting", programme: "waiting", "about-iraq": "ready" };

export function getArlar27Statuses() { return { ...defaultStatuses, ...readStore().statuses }; }
export function getArlar27SectionStatus(section: string) { return getArlar27Statuses()[section] || "waiting"; }
export function setArlar27SectionStatus(section: string, status: Arlar27SectionStatus) { const store = readStore(); store.statuses[cleanKey(section)] = status; writeStore(store); }

export function getManagedArlar27Welcome(): Arlar27WelcomeContent {
  return readStore().welcome || clone({ ...arlar27Welcome, paragraphs: [...arlar27Welcome.paragraphs], authorRoles: [...arlar27Welcome.authorRoles] });
}
export function saveManagedArlar27Welcome(value: Arlar27WelcomeContent) { const store = readStore(); store.welcome = clone(value); writeStore(store); }

/** The shipped defaults, as a plain mutable object. `arlar27AboutIraq` is
 * declared `as const`, so the deep clone is widened back to a writable shape. */
function defaultAboutContent(heroImage: string): Arlar27AboutContent {
  return clone({ ...arlar27AboutIraq, heroImage }) as unknown as Arlar27AboutContent;
}

/**
 * Records saved before the guide sections existed only carry the original
 * fields, so a stored row is layered ON TOP of the defaults rather than
 * replacing them. Without this, an older row would leave `essentials`, `visa`,
 * `gallery` and `weather` undefined and the public page would throw.
 */
export function normalizeArlar27About(
  stored: Partial<Arlar27AboutContent> | null | undefined,
  heroImage: string,
): Arlar27AboutContent {
  const base = defaultAboutContent(heroImage);
  if (!stored) return base;
  return {
    ...base,
    ...stored,
    paragraphs: stored.paragraphs?.length ? stored.paragraphs : base.paragraphs,
    planningCards: stored.planningCards?.length ? stored.planningCards : base.planningCards,
    heroImage: stored.heroImage || base.heroImage,
    essentials: {
      ...base.essentials,
      ...(stored.essentials ?? {}),
      cards: stored.essentials?.cards?.length ? stored.essentials.cards : base.essentials.cards,
    },
    gallery: { ...base.gallery, ...(stored.gallery ?? {}) },
    visa: {
      ...base.visa,
      ...(stored.visa ?? {}),
      facts: stored.visa?.facts?.length ? stored.visa.facts : base.visa.facts,
    },
    weather: {
      ...base.weather,
      ...(stored.weather ?? {}),
      stats: stored.weather?.stats?.length ? stored.weather.stats : base.weather.stats,
    },
  };
}

export function getManagedArlar27About(heroImage: string): Arlar27AboutContent {
  return normalizeArlar27About(readStore().aboutIraq, heroImage);
}
export function saveManagedArlar27About(value: Arlar27AboutContent) { const store = readStore(); store.aboutIraq = clone(value); writeStore(store); }

export function getManagedArlar27External(kind: "abstracts" | "registration"): Arlar27ExternalDestination {
  return readStore().external?.[kind] || { ...arlar27ExternalDestinations[kind] };
}
export function saveManagedArlar27External(kind: "abstracts" | "registration", value: Arlar27ExternalDestination) { const store = readStore(); store.external = { ...store.external, [kind]: { ...value } }; writeStore(store); }

export function getManagedArlar27People(kind: "committee" | "faculty") {
  const store = readStore();
  const fallback = kind === "committee" ? arlar27Committee : arlar27Faculty;
  return clone(store[kind] || fallback);
}
export function saveManagedArlar27People(kind: "committee" | "faculty", value: Arlar27PersonPlacement[]) { const store = readStore(); store[kind] = clone(value); writeStore(store); }

function readStore(): Store {
  if (!existsSync(statePath)) return { version: 1, statuses: {} };
  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<Store>;
    return { version: 1, statuses: parsed.statuses && typeof parsed.statuses === "object" ? parsed.statuses : {}, welcome: parsed.welcome, aboutIraq: parsed.aboutIraq, external: parsed.external, committee: parsed.committee, faculty: parsed.faculty };
  } catch { return { version: 1, statuses: {} }; }
}

function writeStore(store: Store) {
  mkdirSync(stateDirectory, { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, statePath);
}

function cleanKey(value: string) { const key = value.trim().slice(0, 80); if (!key) throw new Error("Invalid ArLAR27 section."); return key; }
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }

export async function getArlar27StatusesAsync(access: "public" | "admin" = "public") {
  if (!getSupabasePublicConfig()) return getArlar27Statuses();
  try {
    const supabase = access === "admin" ? await createSupabaseServerClient() : createSupabasePublicDataClient();
    if (!supabase) return getArlar27Statuses();
    const { data, error } = await supabase.from("admin_arlar27_sections").select("section, status");
    if (error) throw error;
    if (!data?.length) return getArlar27Statuses();
    const statuses = Object.fromEntries(data.filter((row) => !row.section.endsWith("-content") && !row.section.endsWith("-external")).map((row) => [row.section, row.status]));
    return { ...defaultStatuses, ...statuses } as Record<string, Arlar27SectionStatus>;
  } catch (error) {
    reportSupabaseReadFallback("admin-arlar27-statuses", error);
    return getArlar27Statuses();
  }
}

export async function getArlar27SectionStatusAsync(section: string, access: "public" | "admin" = "public") {
  return (await getArlar27StatusesAsync(access))[section] || "waiting";
}

export async function setArlar27SectionStatusAsync(section: string, status: Arlar27SectionStatus) {
  if (!getSupabasePublicConfig()) return setArlar27SectionStatus(section, status);
  const supabase = await createSupabaseServerClient();
  const updatedBy = await getCurrentAdminProfileId(supabase);
  const cleanSection = cleanKey(section);
  const { error } = await supabase.from("admin_arlar27_sections").upsert({ section: cleanSection, status, data: { section: cleanSection, status }, updated_by: updatedBy });
  if (error) throw error;
}

async function getArlar27Content<T>(section: string, fallback: T, access: "public" | "admin" = "public"): Promise<T> {
  if (!getSupabasePublicConfig()) return fallback;
  try {
    if (access === "public") {
      const data = await getCachedPublicArlar27Content(section);
      return data ? data as T : fallback;
    }
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("admin_arlar27_sections").select("data").eq("section", section).maybeSingle();
    if (error) throw error;
    return data?.data ? data.data as T : fallback;
  } catch (error) {
    reportSupabaseReadFallback(`admin-arlar27-${section}`, error);
    return fallback;
  }
}

const getCachedPublicArlar27Content = unstable_cache(
  async (section: string) => {
    const supabase = createSupabasePublicDataClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("admin_arlar27_sections")
      .select("data")
      .eq("section", section)
      .maybeSingle();
    if (error) throw error;
    return data?.data ?? null;
  },
  ["public-arlar27-content"],
  { tags: ["public-arlar27"], revalidate: false },
);

async function saveArlar27Content(section: string, status: Arlar27SectionStatus, data: unknown) {
  const supabase = await createSupabaseServerClient();
  const updatedBy = await getCurrentAdminProfileId(supabase);
  const { error } = await supabase.from("admin_arlar27_sections").upsert({ section, status, data, updated_by: updatedBy });
  if (error) throw error;
}

export function getManagedArlar27WelcomeAsync(access: "public" | "admin" = "public") {
  return getArlar27Content("welcome-content", getManagedArlar27Welcome(), access);
}
export async function saveManagedArlar27WelcomeAsync(value: Arlar27WelcomeContent) {
  if (!getSupabasePublicConfig()) return saveManagedArlar27Welcome(value);
  return saveArlar27Content("welcome-content", "ready", clone(value));
}
export async function getManagedArlar27AboutAsync(heroImage: string, access: "public" | "admin" = "public") {
  // Normalised again here: the Supabase row is what predates the guide
  // sections, so it needs the same defaults layered underneath it.
  const stored = await getArlar27Content<Partial<Arlar27AboutContent> | null>(
    "about-iraq-content",
    null,
    access,
  );
  return normalizeArlar27About(stored ?? readStore().aboutIraq, heroImage);
}
export async function saveManagedArlar27AboutAsync(value: Arlar27AboutContent) {
  if (!getSupabasePublicConfig()) return saveManagedArlar27About(value);
  return saveArlar27Content("about-iraq-content", "ready", clone(value));
}
export function getManagedArlar27ExternalAsync(kind: "abstracts" | "registration", access: "public" | "admin" = "public") {
  return getArlar27Content(`${kind}-external`, getManagedArlar27External(kind), access);
}
export async function saveManagedArlar27ExternalAsync(kind: "abstracts" | "registration", value: Arlar27ExternalDestination) {
  if (!getSupabasePublicConfig()) return saveManagedArlar27External(kind, value);
  // `status` is this row's public-read gate (RLS: `status = 'ready'`), not an editorial
  // state — the payload's own `enabled` flag decides whether visitors get redirected.
  // Stamping the section's Ready/Waiting pill here hid the row from the anon client, so
  // the redirect never fired. Matches welcome-content and about-iraq-content.
  return saveArlar27Content(`${kind}-external`, "ready", { ...value });
}
export async function getManagedArlar27PeopleAsync(kind: "committee" | "faculty", access: "public" | "admin" = "public") {
  if (!getSupabasePublicConfig()) return getManagedArlar27People(kind);
  try {
    const supabase = access === "admin" ? await createSupabaseServerClient() : createSupabasePublicDataClient();
    if (!supabase) return getManagedArlar27People(kind);
    const { data, error } = await supabase.from("admin_arlar27_people").select("data").eq("section", kind).order("sort_order");
    if (error) throw error;
    return data?.length ? data.map((row) => row.data as Arlar27PersonPlacement) : getManagedArlar27People(kind);
  } catch (error) {
    reportSupabaseReadFallback(`admin-arlar27-${kind}`, error);
    return getManagedArlar27People(kind);
  }
}
export async function saveManagedArlar27PeopleAsync(kind: "committee" | "faculty", value: Arlar27PersonPlacement[]) {
  if (!getSupabasePublicConfig()) return saveManagedArlar27People(kind, value);
  const supabase = await createSupabaseServerClient();
  const createdBy = await getCurrentAdminProfileId(supabase);
  const { error: deleteError } = await supabase.from("admin_arlar27_people").delete().eq("section", kind);
  if (deleteError) throw deleteError;
  if (value.length) {
    const { error } = await supabase.from("admin_arlar27_people").insert(value.map((person, index) => ({ id: person.id, section: kind, doctor_id: person.doctorId, sort_order: index, data: person, created_by: createdBy })));
    if (error) throw error;
  }
}

// Supabase boundary: arlar27_sections, arlar27_people, and arlar27_content can
// replace this store while preserving the editor-facing functions above.
