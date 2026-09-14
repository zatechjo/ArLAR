import "server-only";

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabasePublicDataClient, getCurrentAdminProfileId, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminDeletionScope =
  | "doctors"
  | "college-events"
  | "congresses"
  | "congress-replays"
  | "sigs"
  | "professional-resources"
  | "member-countries"
  | "member-societies"
  | "arlar27-committee"
  | "arlar27-faculty";

type DeletionStore = {
  version: 2;
  deleted: Partial<Record<AdminDeletionScope, Record<string, string>>>;
  permanentlyDeleted: Partial<Record<AdminDeletionScope, Record<string, string>>>;
};

const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "deleted-records.json");

function readStore(): DeletionStore {
  if (!existsSync(statePath)) return { version: 2, deleted: {}, permanentlyDeleted: {} };
  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<DeletionStore>;
    return {
      version: 2,
      deleted: parsed.deleted && typeof parsed.deleted === "object" ? parsed.deleted : {},
      permanentlyDeleted: parsed.permanentlyDeleted && typeof parsed.permanentlyDeleted === "object" ? parsed.permanentlyDeleted : {},
    };
  } catch {
    return { version: 2, deleted: {}, permanentlyDeleted: {} };
  }
}

function writeStore(store: DeletionStore) {
  mkdirSync(stateDirectory, { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, statePath);
}

export function isAdminRecordDeleted(scope: AdminDeletionScope, id: string) {
  const store = readStore();
  return Boolean(store.deleted[scope]?.[id] || store.permanentlyDeleted[scope]?.[id]);
}

export function getDeletedAdminRecordIds(scope: AdminDeletionScope) {
  const store = readStore();
  return new Set([
    ...Object.keys(store.deleted[scope] || {}),
    ...Object.keys(store.permanentlyDeleted[scope] || {}),
  ]);
}

export function getTrashedAdminRecords(scope: AdminDeletionScope) {
  return new Map(Object.entries(readStore().deleted[scope] || {}));
}

export function filterDeletedAdminRecords<T extends { id: string }>(scope: AdminDeletionScope, records: T[]) {
  const store = readStore();
  const trashed = store.deleted[scope] || {};
  const permanentlyDeleted = store.permanentlyDeleted[scope] || {};
  return records.filter((record) => !trashed[record.id] && !permanentlyDeleted[record.id]);
}

export function deleteAdminRecord(scope: AdminDeletionScope, id: string) {
  const cleanId = validateId(id);
  const store = readStore();
  if (store.permanentlyDeleted[scope]?.[cleanId]) return;
  store.deleted[scope] = {
    ...(store.deleted[scope] || {}),
    [cleanId]: new Date().toISOString(),
  };
  writeStore(store);
}

export function restoreAdminRecord(scope: AdminDeletionScope, id: string) {
  const cleanId = validateId(id);
  const store = readStore();
  if (!store.deleted[scope]?.[cleanId]) return;
  const { [cleanId]: _restored, ...remaining } = store.deleted[scope] || {};
  void _restored;
  store.deleted[scope] = remaining;
  writeStore(store);
}

export function permanentlyDeleteAdminRecord(scope: AdminDeletionScope, id: string) {
  const cleanId = validateId(id);
  const store = readStore();
  if (!store.deleted[scope]?.[cleanId]) return;
  const { [cleanId]: _deleted, ...remaining } = store.deleted[scope] || {};
  void _deleted;
  store.deleted[scope] = remaining;
  store.permanentlyDeleted[scope] = {
    ...(store.permanentlyDeleted[scope] || {}),
    [cleanId]: new Date().toISOString(),
  };
  writeStore(store);
}

function validateId(id: string) {
  const cleanId = id.trim();
  if (!cleanId || cleanId.length > 240) throw new Error("Invalid record identifier.");
  return cleanId;
}

async function listPublicSupabaseDeletionIds(scope: AdminDeletionScope): Promise<Array<{ record_id: string }>> {
  const supabase = createSupabasePublicDataClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("public_deleted_record_ids", { requested_scope: scope });
  if (error) throw error;
  return data || [];
}

const listCachedPublicSupabaseDeletionIds = unstable_cache(
  listPublicSupabaseDeletionIds,
  ["public-deletion-ids"],
  { tags: ["public-deletions"], revalidate: false },
);

export async function getDeletedAdminRecordIdsAsync(scope: AdminDeletionScope) {
  if (!getSupabasePublicConfig()) return getDeletedAdminRecordIds(scope);
  try {
    return new Set((await listCachedPublicSupabaseDeletionIds(scope)).map((row) => row.record_id));
  } catch (error) {
    reportSupabaseReadFallback("admin-deletions", error);
    return getDeletedAdminRecordIds(scope);
  }
}

export async function isAdminRecordDeletedAsync(scope: AdminDeletionScope, id: string) {
  return (await getDeletedAdminRecordIdsAsync(scope)).has(id);
}

export async function getTrashedAdminRecordsAsync(scope: AdminDeletionScope) {
  if (!getSupabasePublicConfig()) return getTrashedAdminRecords(scope);
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("admin_deletions").select("record_id, deleted_at, permanently_deleted").eq("scope", scope);
    if (error) throw error;
    return new Map((data || []).filter((row) => !row.permanently_deleted).map((row) => [row.record_id, row.deleted_at]));
  } catch (error) {
    reportSupabaseReadFallback("admin-trash", error);
    return getTrashedAdminRecords(scope);
  }
}

export async function filterDeletedAdminRecordsAsync<T extends { id: string }>(scope: AdminDeletionScope, records: T[]) {
  const deleted = await getDeletedAdminRecordIdsAsync(scope);
  return records.filter((record) => !deleted.has(record.id));
}

export async function deleteAdminRecordAsync(scope: AdminDeletionScope, id: string) {
  if (!getSupabasePublicConfig()) return deleteAdminRecord(scope, id);
  const cleanId = validateId(id);
  const supabase = await createSupabaseServerClient();
  const deletedBy = await getCurrentAdminProfileId(supabase);
  const { error } = await supabase.from("admin_deletions").upsert({ scope, record_id: cleanId, deleted_at: new Date().toISOString(), permanently_deleted: false, deleted_by: deletedBy });
  if (error) throw error;
}

export async function restoreAdminRecordAsync(scope: AdminDeletionScope, id: string) {
  if (!getSupabasePublicConfig()) return restoreAdminRecord(scope, id);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("admin_deletions").delete().eq("scope", scope).eq("record_id", validateId(id)).eq("permanently_deleted", false);
  if (error) throw error;
}

export async function permanentlyDeleteAdminRecordAsync(scope: AdminDeletionScope, id: string) {
  if (!getSupabasePublicConfig()) return permanentlyDeleteAdminRecord(scope, id);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("admin_deletions").update({ permanently_deleted: true }).eq("scope", scope).eq("record_id", validateId(id));
  if (error) throw error;
}

// Imported JSON remains immutable. This deletion overlay is the persistence
// boundary that can later be replaced by Supabase soft-delete columns.
