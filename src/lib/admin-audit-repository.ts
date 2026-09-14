import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { AdminAuditLogEntry } from "@/lib/access-control-types";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getCurrentAdminProfileId, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuditStore = { version: 1; entries: AdminAuditLogEntry[] };

const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "admin-audit-log.json");

export function listAdminAuditLog(limit = 500) {
  return readStore().entries
    .toSorted((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, Math.max(1, Math.min(limit, 2000)));
}

export function recordAdminAuditLog(input: Omit<AdminAuditLogEntry, "id" | "createdAt"> & { createdAt?: string }) {
  const store = readStore();
  const createdAt = input.createdAt || new Date().toISOString();
  store.entries.push({
    id: `audit-${createdAt.replace(/\D/g, "")}-${Math.random().toString(36).slice(2, 8)}`,
    module: text(input.module, 80) || "system",
    action: text(input.action, 120) || "Activity",
    entityType: text(input.entityType, 120),
    entityId: text(input.entityId, 240),
    targetLabel: text(input.targetLabel, 240),
    detail: text(input.detail, 1000),
    actorEmail: text(input.actorEmail, 240).toLowerCase(),
    createdAt,
  });
  store.entries = store.entries.slice(-2000);
  writeStore(store);
}

function readStore(): AuditStore {
  if (!existsSync(statePath)) return { version: 1, entries: [] };
  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<AuditStore>;
    return {
      version: 1,
      entries: Array.isArray(parsed.entries) ? parsed.entries.map(sanitizeEntry).filter((entry) => entry.id) : [],
    };
  } catch {
    return { version: 1, entries: [] };
  }
}

function writeStore(store: AuditStore) {
  mkdirSync(stateDirectory, { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, statePath);
}

function sanitizeEntry(input: Partial<AdminAuditLogEntry>): AdminAuditLogEntry {
  return {
    id: text(input.id, 120),
    module: text(input.module, 80),
    action: text(input.action, 120),
    entityType: text(input.entityType, 120),
    entityId: text(input.entityId, 240),
    targetLabel: text(input.targetLabel, 240),
    detail: text(input.detail, 1000),
    actorEmail: text(input.actorEmail, 240).toLowerCase(),
    createdAt: text(input.createdAt, 40),
  };
}

function text(value: unknown, max: number) {
  return String(value || "").trim().slice(0, max);
}

export async function listAdminAuditLogAsync(limit = 500) {
  if (!getSupabasePublicConfig()) return listAdminAuditLog(limit);
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("admin_audit_log").select("id, action, entity_type, entity_id, summary, metadata, created_at").order("created_at", { ascending: false }).limit(Math.max(1, Math.min(limit, 2000)));
    if (error) throw error;
    return (data || []).map((entry) => ({
      id: entry.id,
      module: String(entry.metadata?.module || "system"),
      action: entry.action,
      entityType: entry.entity_type,
      entityId: entry.entity_id || "",
      targetLabel: String(entry.metadata?.targetLabel || ""),
      detail: entry.summary || "",
      actorEmail: String(entry.metadata?.actorEmail || ""),
      createdAt: entry.created_at,
    })) satisfies AdminAuditLogEntry[];
  } catch (error) {
    reportSupabaseReadFallback("admin-audit-log", error);
    return listAdminAuditLog(limit);
  }
}

export async function recordAdminAuditLogAsync(input: Omit<AdminAuditLogEntry, "id" | "createdAt"> & { createdAt?: string }) {
  if (!getSupabasePublicConfig()) return recordAdminAuditLog(input);
  const supabase = await createSupabaseServerClient();
  const actorId = await getCurrentAdminProfileId(supabase);
  const createdAt = input.createdAt || new Date().toISOString();
  const { error } = await supabase.from("admin_audit_log").insert({
    actor_id: actorId,
    action: text(input.action, 120) || "Activity",
    entity_type: text(input.entityType, 120),
    entity_id: text(input.entityId, 240) || null,
    summary: text(input.detail, 1000) || text(input.targetLabel, 240),
    metadata: { module: text(input.module, 80) || "system", targetLabel: text(input.targetLabel, 240), actorEmail: text(input.actorEmail, 240).toLowerCase() },
    created_at: createdAt,
  });
  if (error) throw error;
}
