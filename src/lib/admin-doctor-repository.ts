import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import { doctorDatabase } from "@/data/doctor-database";
import type { DoctorRecord } from "@/data/doctor-types";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabasePublicDataClient, getCurrentAdminProfileId, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Store = { version: 1; records: Record<string, DoctorRecord> };
const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "doctor-records.json");

/**
 * A stored record may still carry a legacy id from before two spellings of the
 * same person were merged in `identityGroups` (e.g. "tariq-alfanna-al-araimi"
 * for "tariq-al-araimi"). Resolve it back to the canonical record so the edit
 * is not stranded on a dead id.
 */
function canonicalStoredId(stored: DoctorRecord, baseIds: Set<string>): string {
  if (baseIds.has(stored.id)) return stored.id;
  const match = findManagedDoctorByName(doctorDatabase, stored.fullName || stored.name || "");
  return match?.id ?? stored.id;
}

/** Field-wise merge that keeps the canonical record's identity but rescues
 * any value it is missing from a legacy duplicate. */
function mergeStoredDuplicates(base: DoctorRecord, extra: DoctorRecord): DoctorRecord {
  const appearances = [
    ...new Map(
      [...(extra.appearances || []), ...(base.appearances || [])].map((appearance) => [appearance.id, appearance] as const),
    ).values(),
  ];
  return {
    ...base,
    nameAr: base.nameAr || extra.nameAr,
    biographyAr: base.biographyAr?.length ? base.biographyAr : extra.biographyAr,
    nameFr: base.nameFr || extra.nameFr,
    biographyFr: base.biographyFr?.length ? base.biographyFr : extra.biographyFr,
    biography: base.biography?.length ? base.biography : extra.biography,
    appearances,
    availableOn: [...new Set([...(base.availableOn || []), ...(extra.availableOn || []), ...appearances.map((appearance) => appearance.pageId)])],
    // Name spellings must be unioned, never replaced: public pages look a
    // doctor up by the exact spelling on that page, so dropping a variant
    // makes the doctor unresolvable there.
    sourceFullNames: [...new Set([...(base.sourceFullNames || []), ...(extra.sourceFullNames || [])])],
    aliases: [...new Set([...(base.aliases || []), ...(extra.aliases || [])])],
  };
}

function foldStoredRecords(stored: DoctorRecord[]): Map<string, DoctorRecord> {
  const baseIds = new Set(doctorDatabase.map((doctor) => doctor.id));
  const folded = new Map<string, DoctorRecord>();
  for (const record of stored) {
    const id = canonicalStoredId(record, baseIds);
    const existing = folded.get(id);
    // The record whose own id is canonical wins identity; the other only fills gaps.
    if (!existing) folded.set(id, { ...record, id });
    else if (record.id === id) folded.set(id, mergeStoredDuplicates({ ...record, id }, existing));
    else folded.set(id, mergeStoredDuplicates(existing, record));
  }
  return folded;
}

export function listManagedDoctors(): DoctorRecord[] {
  const overrides = foldStoredRecords(Object.values(readStore().records));
  const baseIds = new Set(doctorDatabase.map((doctor) => doctor.id));
  return [
    ...doctorDatabase.map((doctor) => {
      const stored = overrides.get(doctor.id);
      return stored ? mergeArabicSourceProfile(stored, doctor) : doctor;
    }),
    ...[...overrides.values()].filter((doctor) => !baseIds.has(doctor.id)),
  ].toSorted((a, b) => a.name.localeCompare(b.name));
}

export function getManagedDoctor(id: string) { return listManagedDoctors().find((doctor) => doctor.id === id); }
export function saveManagedDoctor(record: DoctorRecord) { const store = readStore(); store.records[record.id] = clone(record); writeStore(store); return record; }
export function createManagedDoctorId(name: string) {
  const base = name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120) || "doctor";
  const ids = new Set(listManagedDoctors().map((doctor) => doctor.id)); let id = base; let suffix = 2; while (ids.has(id)) id = `${base}-${suffix++}`; return id;
}

function readStore(): Store { if (!existsSync(statePath)) return { version: 1, records: {} }; try { const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<Store>; return { version: 1, records: parsed.records && typeof parsed.records === "object" ? parsed.records : {} }; } catch { return { version: 1, records: {} }; } }
function writeStore(store: Store) { mkdirSync(stateDirectory, { recursive: true }); const temporaryPath = `${statePath}.${process.pid}.tmp`; writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8"); renameSync(temporaryPath, statePath); }
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }

export async function listManagedDoctorsAsync(): Promise<DoctorRecord[]> {
  if (!getSupabasePublicConfig()) return listManagedDoctors();
  try {
    const supabase = createSupabasePublicDataClient();
    if (!supabase) return listManagedDoctors();
    const { data, error } = await supabase.from("admin_doctors").select("data").order("name");
    if (error) throw error;
    if (!data?.length) return listManagedDoctors();
    // Stored rows are OVERRIDES layered on the source database, not a
    // replacement for it. Returning only the stored rows would hide every
    // doctor that has never been saved through the admin panel.
    const overrides = foldStoredRecords(data.map((row) => row.data as DoctorRecord));
    const baseIds = new Set(doctorDatabase.map((doctor) => doctor.id));
    return [
      ...doctorDatabase.map((doctor) => {
        const stored = overrides.get(doctor.id);
        return stored ? mergeArabicSourceProfile(stored, doctor) : doctor;
      }),
      ...[...overrides.values()].filter((doctor) => !baseIds.has(doctor.id)),
    ].toSorted((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    reportSupabaseReadFallback("admin-doctors", error);
    return listManagedDoctors();
  }
}

/** Preserve an administrator's saved profile while filling Arabic fields that
 * predate the verified source mapping. */
function mergeArabicSourceProfile(stored: DoctorRecord, source?: DoctorRecord): DoctorRecord {
  if (!source) return stored;
  return {
    ...stored,
    nameAr: stored.nameAr || source.nameAr,
    biographyAr: stored.biographyAr?.length ? stored.biographyAr : source.biographyAr,
    nameFr: stored.nameFr || source.nameFr,
    biographyFr: stored.biographyFr?.length ? stored.biographyFr : source.biographyFr,
    // Public pages resolve a doctor by the exact name spelling used on that
    // page. A saved record must never drop a spelling the source knows, or
    // the doctor becomes unresolvable on the pages using the other spelling.
    sourceFullNames: [...new Set([...(stored.sourceFullNames || []), ...(source.sourceFullNames || [])])],
    aliases: [...new Set([...(stored.aliases || []), ...(source.aliases || [])])],
    // Same reasoning for the profile itself. Rows written before a field
    // existed — or by a bulk import that never carried one — come back blank,
    // and a blank must not erase what the source database still knows. An
    // administrator clearing a field in the editor is not expressible here and
    // was never the case these blanks came from.
    name: stored.name || source.name,
    fullName: stored.fullName || source.fullName,
    credentials: stored.credentials || source.credentials,
    country: stored.country || source.country,
    countryCode: stored.countryCode || source.countryCode,
    flagFilename: stored.flagFilename || source.flagFilename,
    image: isRealPortrait(stored.image) ? stored.image : source.image,
    biography: stored.biography?.length ? stored.biography : source.biography,
  };
}

/** The placeholder is what an unset photo looks like, not a chosen one. */
function isRealPortrait(image: string | undefined) {
  return Boolean(image) && !image!.includes("profile-placeholder");
}

export async function getManagedDoctorAsync(id: string) {
  return (await listManagedDoctorsAsync()).find((doctor) => doctor.id === id);
}

export async function saveManagedDoctorAsync(record: DoctorRecord) {
  if (!getSupabasePublicConfig()) return saveManagedDoctor(record);
  const supabase = await createSupabaseServerClient();
  const createdBy = await getCurrentAdminProfileId(supabase);
  const { error } = await supabase.from("admin_doctors").upsert({ id: record.id, name: record.fullName || record.name, status: "active", data: clone(record), created_by: createdBy });
  if (error) throw error;
  return record;
}

export async function saveManagedDoctorsAsync(records: DoctorRecord[]) {
  if (records.length === 0) return records;
  if (!getSupabasePublicConfig()) {
    const store = readStore();
    for (const record of records) store.records[record.id] = clone(record);
    writeStore(store);
    return records;
  }
  const supabase = await createSupabaseServerClient();
  const createdBy = await getCurrentAdminProfileId(supabase);
  const { error } = await supabase.from("admin_doctors").upsert(records.map((record) => ({ id: record.id, name: record.fullName || record.name, status: "active", data: clone(record), created_by: createdBy })));
  if (error) throw error;
  return records;
}

export async function createManagedDoctorIdAsync(name: string) {
  const base = name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120) || "doctor";
  const ids = new Set((await listManagedDoctorsAsync()).map((doctor) => doctor.id));
  let id = base;
  let suffix = 2;
  while (ids.has(id)) id = `${base}-${suffix++}`;
  return id;
}

export function findManagedDoctorByName(doctors: DoctorRecord[], value: string) {
  const target = normalizeDoctorLookup(value);
  return doctors.find((doctor) => [doctor.name, doctor.fullName, ...(doctor.sourceFullNames || []), ...(doctor.aliases || [])]
    .some((candidate) => normalizeDoctorLookup(candidate) === target));
}

function normalizeDoctorLookup(value: string) {
  return value.toLowerCase().replace(/\b(prof(?:essor)?|dr|md|phd|frcp|facr)\b\.?/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

// Supabase boundary: this maps directly to doctors plus doctor_appearances.
