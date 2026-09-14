import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import { getDeletedAdminRecordIdsAsync, isAdminRecordDeleted } from "@/lib/admin-deletion-repository";
import { libraryResources, type LibraryResource } from "@/lib/educational-library";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabasePublicDataClient, getCurrentAdminProfileId, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicMediaUrl } from "@/lib/media-url";

export type ProfessionalResourceKind = "publication" | "bulletin" | "document" | "partner";
export type ProfessionalResourceStatus = "published" | "draft";

export type ProfessionalResource = {
  id: string;
  kind: ProfessionalResourceKind;
  title: string;
  description: string;
  collection: string;
  publicHref: string;
  date: string;
  journal: string;
  authors: string[];
  topics: string[];
  image: string;
  resourceUrl: string;
  actionLabel: string;
  language: string;
  issueNumber: string;
  status: ProfessionalResourceStatus;
};

type ResourceStore = { version: 1; records: Record<string, ProfessionalResource> };

const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "professional-resources.json");

const publicationAuthors: Record<string, string[]> = {
  "publication-covid-practice": ["Nelly Ziadé", "Ihsane Hmamouchi", "Lina el Kibbi", "Nizar Abdulateef", "Hussein Halabi", "Fatemah Abutiban", "Wafa Hamdi", "Manal el Rakawi", "Mervat Eissa", "Basel Masri"],
  "publication-covid-patients": ["Nelly Ziadé", "Lina el Kibbi", "Ihsane Hmamouchi", "Nizar Abdulateef", "Hussein Halabi", "Wafa Hamdi", "Fatemah Abutiban", "Manal el Rakawi", "Mervat Eissa", "Basel Masri"],
};

export function getAllProfessionalResourceSources() {
  const seeds = seedResources();
  const store = readStore();
  const seedIds = new Set(seeds.map((resource) => resource.id));
  return [
    ...seeds.map((resource) => store.records[resource.id] || resource),
    ...Object.values(store.records).filter((resource) => !seedIds.has(resource.id)),
  ].toSorted(compareResources);
}

export function getProfessionalResources() {
  return getAllProfessionalResourceSources().filter((resource) => !isAdminRecordDeleted("professional-resources", resource.id));
}

export function getPublishedProfessionalResources(kind?: ProfessionalResourceKind) {
  return getProfessionalResources().filter((resource) => resource.status === "published" && (!kind || resource.kind === kind));
}

export function getPublishedProfessionalLibraryResources(): LibraryResource[] {
  return getPublishedProfessionalResources().map((resource) => ({
    id: resource.id,
    kind: resource.kind === "partner" ? "document" : resource.kind,
    title: resource.title,
    description: resource.description,
    collection: resource.collection,
    collectionHref: resource.publicHref || "/education",
    date: resource.date || undefined,
    year: resource.date ? Number(resource.date.slice(0, 4)) : undefined,
    speakers: resource.authors,
    topics: resource.topics,
    image: resource.image || undefined,
    href: publicMediaUrl(resource.resourceUrl || resource.publicHref || undefined),
    action: resource.actionLabel || "Open resource",
  }));
}

export function getProfessionalResource(id: string) {
  return getAllProfessionalResourceSources().find((resource) => resource.id === id) || null;
}

export function saveProfessionalResource(resource: ProfessionalResource) {
  const clean = sanitizeResource(resource);
  const store = readStore();
  store.records[clean.id] = clean;
  writeStore(store);
  return clean;
}

export function createProfessionalResourceId(title: string) {
  const base = slug(title) || "professional-resource";
  const existing = new Set(getAllProfessionalResourceSources().map((resource) => resource.id));
  if (!existing.has(base)) return base;
  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function seedResources(): ProfessionalResource[] {
  const resources = libraryResources
    .filter((resource) => ["publication", "bulletin", "document"].includes(resource.kind))
    .map((resource): ProfessionalResource => ({
      id: resource.id,
      kind: resource.kind as Exclude<ProfessionalResourceKind, "partner">,
      title: resource.title,
      description: resource.description || "",
      collection: resource.collection,
      publicHref: resource.collectionHref,
      date: resource.date?.slice(0, 10) || "",
      journal: resource.kind === "publication" ? (resource.description || "").replace(/^Published in\s+/i, "").replace(/\.$/, "") : "",
      authors: publicationAuthors[resource.id] || resource.speakers,
      topics: resource.topics,
      image: resource.image || "",
      resourceUrl: resource.href || resource.mediaUrl || "",
      actionLabel: resource.action,
      language: resource.kind === "bulletin" ? "Arabic" : "English",
      issueNumber: resource.kind === "bulletin" ? resource.id.replace("bulletin-", "") : "",
      status: "published",
    }));

  resources.push({
    id: "partner-skills-in-rheumatology",
    kind: "partner",
    title: "Skills in Rheumatology",
    description: "An open-access rheumatology reference edited by Hani Almoallim and Mohamed Cheikh.",
    collection: "ArLAR Partners",
    publicHref: "/professionals/partners",
    date: "2021-01-01",
    journal: "Springer Singapore",
    authors: ["Hani Almoallim", "Mohamed Cheikh"],
    topics: ["Open access", "Clinical education", "Rheumatology"],
    image: "/images/publications/skills-in-rheumatology-cover.png",
    resourceUrl: "https://link.springer.com/book/10.1007/978-981-15-8323-0",
    actionLabel: "Read the book",
    language: "English",
    issueNumber: "",
    status: "published",
  });
  return resources;
}

function readStore(): ResourceStore {
  if (!existsSync(statePath)) return { version: 1, records: {} };
  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<ResourceStore>;
    return { version: 1, records: parsed.records && typeof parsed.records === "object" ? parsed.records : {} };
  } catch {
    return { version: 1, records: {} };
  }
}

function writeStore(store: ResourceStore) {
  mkdirSync(stateDirectory, { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, statePath);
}

function sanitizeResource(resource: ProfessionalResource): ProfessionalResource {
  const title = text(resource.title, 240);
  if (!title) throw new Error("Resource title is required.");
  const kind: ProfessionalResourceKind = ["publication", "bulletin", "document", "partner"].includes(resource.kind) ? resource.kind : "document";
  return {
    id: cleanId(resource.id),
    kind,
    title,
    description: text(resource.description, 1600),
    collection: text(resource.collection, 160),
    publicHref: safeUrl(resource.publicHref),
    date: text(resource.date, 20),
    journal: text(resource.journal, 180),
    authors: resource.authors.map((author) => text(author, 140)).filter(Boolean),
    topics: resource.topics.map((topic) => text(topic, 80)).filter(Boolean),
    image: safeUrl(resource.image),
    resourceUrl: safeUrl(resource.resourceUrl),
    actionLabel: text(resource.actionLabel, 60) || "Open resource",
    language: text(resource.language, 60),
    issueNumber: text(resource.issueNumber, 30),
    status: resource.status === "draft" ? "draft" : "published",
  };
}

function compareResources(a: ProfessionalResource, b: ProfessionalResource) {
  return (b.date || "").localeCompare(a.date || "") || a.title.localeCompare(b.title);
}

function text(value: unknown, max: number) { return String(value || "").trim().slice(0, max); }
function slug(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100); }
function cleanId(value: unknown) { const id = slug(String(value || "")); if (!id) throw new Error("A valid resource ID is required."); return id; }
function safeUrl(value: unknown) { const url = text(value, 800); return url.startsWith("/") || url.startsWith("https://") || url.startsWith("http://") ? url : ""; }

export async function getAllProfessionalResourceSourcesAsync(access: "public" | "admin" = "public") {
  if (!getSupabasePublicConfig()) return getAllProfessionalResourceSources();
  try {
    const supabase = access === "admin" ? await createSupabaseServerClient() : createSupabasePublicDataClient();
    if (!supabase) return getAllProfessionalResourceSources();
    const { data, error } = await supabase.from("admin_professional_resources").select("data, status").order("updated_at", { ascending: false });
    if (error) throw error;
    if (!data?.length) return getAllProfessionalResourceSources();
    // Stored rows are OVERRIDES on the seed list, not a replacement. Mirrors
    // getAllProfessionalResourceSources() so a seeded resource that has never
    // been saved through the admin panel still appears.
    const stored = data.map((row) => ({ ...(row.data as ProfessionalResource), status: row.status as ProfessionalResourceStatus }));
    const overrides = new Map(stored.map((resource) => [resource.id, resource] as const));
    const seeds = seedResources();
    const seedIds = new Set(seeds.map((resource) => resource.id));
    return [
      ...seeds.map((resource) => overrides.get(resource.id) || resource),
      ...stored.filter((resource) => !seedIds.has(resource.id)),
    ].toSorted(compareResources);
  } catch (error) {
    reportSupabaseReadFallback("admin-professional-resources", error);
    return getAllProfessionalResourceSources();
  }
}

export async function getProfessionalResourcesAsync(access: "public" | "admin" = "public") {
  const [resources, deletedIds] = await Promise.all([
    getAllProfessionalResourceSourcesAsync(access),
    getDeletedAdminRecordIdsAsync("professional-resources"),
  ]);
  return resources.filter((resource) => !deletedIds.has(resource.id));
}

export async function getPublishedProfessionalResourcesAsync(kind?: ProfessionalResourceKind) {
  return (await getProfessionalResourcesAsync()).filter((resource) => resource.status === "published" && (!kind || resource.kind === kind));
}

export async function getPublishedProfessionalLibraryResourcesAsync(): Promise<LibraryResource[]> {
  return (await getPublishedProfessionalResourcesAsync()).map((resource) => ({
    id: resource.id,
    kind: resource.kind === "partner" ? "document" : resource.kind,
    title: resource.title,
    description: resource.description,
    collection: resource.collection,
    collectionHref: resource.publicHref || "/education",
    date: resource.date || undefined,
    year: resource.date ? Number(resource.date.slice(0, 4)) : undefined,
    speakers: resource.authors,
    topics: resource.topics,
    image: resource.image || undefined,
    href: publicMediaUrl(resource.resourceUrl || resource.publicHref || undefined),
    action: resource.actionLabel || "Open resource",
  }));
}

export async function getProfessionalResourceAsync(id: string, access: "public" | "admin" = "public") {
  return (await getProfessionalResourcesAsync(access)).find((resource) => resource.id === id) || null;
}

export async function saveProfessionalResourceAsync(resource: ProfessionalResource) {
  const clean = sanitizeResource(resource);
  if (!getSupabasePublicConfig()) return saveProfessionalResource(clean);
  const supabase = await createSupabaseServerClient();
  const createdBy = await getCurrentAdminProfileId(supabase);
  const { error } = await supabase.from("admin_professional_resources").upsert({ id: clean.id, kind: clean.kind, title: clean.title, status: clean.status, data: clean, created_by: createdBy });
  if (error) throw error;
  return clean;
}

export async function createProfessionalResourceIdAsync(title: string) {
  const base = slug(title) || "professional-resource";
  const existing = new Set((await getAllProfessionalResourceSourcesAsync("admin")).map((resource) => resource.id));
  if (!existing.has(base)) return base;
  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

// Local persistence boundary for the future Supabase resource table and Cloudflare R2 media storage.
