import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabasePublicDataClient, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type InboxRecordKind = "contact" | "question" | "subscriber";
export type InboxRecordStatus = "unread" | "read" | "resolved" | "archived" | "active" | "unsubscribed";

export type InboxRecord = {
  id: string;
  kind: InboxRecordKind;
  status: InboxRecordStatus;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  role: string;
  organisation: string;
  enquiryType: string;
  subject: string;
  message: string;
  source: string;
  consent: boolean;
};

type InboxStore = { version: 1; records: InboxRecord[] };

const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "inbox-submissions.json");
const production = process.env.NODE_ENV === "production";

function requireProductionSupabase(): never {
  throw new Error("Supabase must be configured for inbox submissions in production.");
}

export function listInboxRecords(kind?: InboxRecordKind) {
  return readStore().records
    .filter((record) => !kind || record.kind === kind)
    .toSorted((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function getInboxRecord(id: string) {
  return readStore().records.find((record) => record.id === id) || null;
}

export function createInboxRecord(input: Omit<InboxRecord, "id" | "createdAt">) {
  const store = readStore();
  const createdAt = new Date().toISOString();
  const prefix = input.kind === "contact" ? "AR" : input.kind === "question" ? "PQ" : "ML";
  const id = `${prefix}-${createdAt.replace(/\D/g, "").slice(2, 14)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const record = sanitizeRecord({ ...input, id, createdAt });
  store.records.push(record);
  writeStore(store);
  return record;
}

export function subscribeInboxEmail(email: string) {
  const store = readStore();
  const existingIndex = store.records.findIndex(
    (record) => record.kind === "subscriber" && record.email === email.toLowerCase(),
  );
  if (existingIndex >= 0) {
    store.records[existingIndex] = { ...store.records[existingIndex], status: "active" };
    writeStore(store);
    return store.records[existingIndex];
  }
  const createdAt = new Date().toISOString();
  const record = sanitizeRecord({
    id: `ML-${createdAt.replace(/\D/g, "").slice(2, 14)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    kind: "subscriber", status: "active", createdAt, name: "", email, phone: "", country: "", role: "",
    organisation: "", enquiryType: "Mailing list", subject: "Website mailing-list subscription",
    message: "Subscribed to receive ArLAR updates.", source: "Website footer", consent: true,
  });
  store.records.push(record);
  writeStore(store);
  return record;
}

export function updateInboxRecordStatus(id: string, status: InboxRecordStatus) {
  const store = readStore();
  const index = store.records.findIndex((record) => record.id === id);
  if (index < 0) throw new Error("Submission not found.");
  store.records[index] = { ...store.records[index], status };
  writeStore(store);
  return store.records[index];
}

function readStore(): InboxStore {
  if (!existsSync(statePath)) return { version: 1, records: [] };
  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<InboxStore>;
    return { version: 1, records: Array.isArray(parsed.records) ? parsed.records.map(sanitizeRecord) : [] };
  } catch {
    return { version: 1, records: [] };
  }
}

function writeStore(store: InboxStore) {
  mkdirSync(stateDirectory, { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, statePath);
}

function sanitizeRecord(record: InboxRecord): InboxRecord {
  const kind: InboxRecordKind = ["contact", "question", "subscriber"].includes(record.kind) ? record.kind : "contact";
  const allowedStatuses: InboxRecordStatus[] = ["unread", "read", "resolved", "archived", "active", "unsubscribed"];
  return {
    id: text(record.id, 80),
    kind,
    status: allowedStatuses.includes(record.status) ? record.status : kind === "subscriber" ? "active" : "unread",
    createdAt: text(record.createdAt, 40) || new Date().toISOString(),
    name: text(record.name, 160),
    email: text(record.email, 240).toLowerCase(),
    phone: text(record.phone, 80),
    country: text(record.country, 120),
    role: text(record.role, 160),
    organisation: text(record.organisation, 200),
    enquiryType: text(record.enquiryType, 180),
    subject: text(record.subject, 240),
    message: text(record.message, 8000),
    source: text(record.source, 160),
    consent: Boolean(record.consent),
  };
}

function text(value: unknown, max: number) {
  return String(value || "").trim().slice(0, max);
}

export async function listInboxRecordsAsync(kind?: InboxRecordKind) {
  if (!getSupabasePublicConfig()) {
    if (production) return requireProductionSupabase();
    return listInboxRecords(kind);
  }
  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from("admin_inbox_records").select("data, status, created_at").order("created_at", { ascending: false });
    if (kind) query = query.eq("kind", kind);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) => ({ ...(row.data as InboxRecord), status: row.status as InboxRecordStatus, createdAt: row.created_at }));
  } catch (error) {
    reportSupabaseReadFallback("admin-inbox", error);
    if (production) throw error;
    return listInboxRecords(kind);
  }
}

export async function getInboxRecordAsync(id: string) {
  return (await listInboxRecordsAsync()).find((record) => record.id === id) || null;
}

export async function createInboxRecordAsync(input: Omit<InboxRecord, "id" | "createdAt">) {
  if (!getSupabasePublicConfig()) {
    if (production) return requireProductionSupabase();
    return createInboxRecord(input);
  }
  const createdAt = new Date().toISOString();
  const prefix = input.kind === "contact" ? "AR" : input.kind === "question" ? "PQ" : "ML";
  const id = `${prefix}-${createdAt.replace(/\D/g, "").slice(2, 14)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const record = sanitizeRecord({ ...input, id, createdAt });
  const supabase = createSupabasePublicDataClient();
  if (!supabase) {
    if (production) return requireProductionSupabase();
    return createInboxRecord(input);
  }
  const { error } = await supabase.from("admin_inbox_records").insert({ id, kind: record.kind, status: record.status, email: record.email, created_at: createdAt, data: record });
  if (error) throw error;
  return record;
}

export async function subscribeInboxEmailAsync(email: string) {
  if (!getSupabasePublicConfig()) {
    if (production) return requireProductionSupabase();
    return subscribeInboxEmail(email);
  }
  const supabase = createSupabasePublicDataClient();
  if (!supabase) {
    if (production) return requireProductionSupabase();
    return subscribeInboxEmail(email);
  }
  const { data, error } = await supabase.rpc("subscribe_public_inbox", {
    subscriber_email: email.trim().toLowerCase(),
  });
  if (error) {
    const missingFunction = error.code === "PGRST202" || error.message.includes("subscribe_public_inbox");
    if (!production && missingFunction) return subscribeInboxEmailAdminFallback(email);
    throw error;
  }
  return sanitizeRecord(data as InboxRecord);
}

async function subscribeInboxEmailAdminFallback(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("admin_inbox_records")
    .select("id, data")
    .eq("kind", "subscriber")
    .ilike("email", normalizedEmail)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    return createInboxRecordAsync({
      kind: "subscriber", status: "active", name: "", email: normalizedEmail, phone: "", country: "", role: "",
      organisation: "", enquiryType: "Mailing list", subject: "Website mailing-list subscription",
      message: "Subscribed to receive ArLAR updates.", source: "Website footer", consent: true,
    });
  }
  const record = sanitizeRecord({ ...(data.data as InboxRecord), email: normalizedEmail, status: "active" });
  const { error: updateError } = await admin
    .from("admin_inbox_records")
    .update({ email: normalizedEmail, status: "active", data: record })
    .eq("id", data.id);
  if (updateError) throw updateError;
  return record;
}

export async function updateInboxRecordStatusAsync(id: string, status: InboxRecordStatus) {
  if (!getSupabasePublicConfig()) {
    if (production) return requireProductionSupabase();
    return updateInboxRecordStatus(id, status);
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("admin_inbox_records").select("data").eq("id", id).maybeSingle();
  if (error || !data) throw error || new Error("Submission not found.");
  const record = { ...(data.data as InboxRecord), status };
  const { error: updateError } = await supabase.from("admin_inbox_records").update({ status, data: record }).eq("id", id);
  if (updateError) throw updateError;
  return record;
}

// Local persistence boundary. Replace readStore/writeStore with the Supabase inbox table at launch.
