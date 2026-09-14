import "server-only";

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabasePublicDataClient, getCurrentAdminProfileId, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminRecordDeletedAsync } from "@/lib/admin-deletion-repository";
import type { Locale } from "@/i18n/config";

export type CollegeUpcomingEvent = {
  title: string;
  startsAt: string;
  groups: string[];
  banner: string;
  registrationUrl: string;
  speakers?: string;
  moderators?: string;
  published: boolean;
  internalNotes?: string;
  updatedAt: string;
};

type CollegeUpcomingEventStore = {
  version: 2;
  event: CollegeUpcomingEvent | null;
  trashedEvent: (CollegeUpcomingEvent & { deletedAt: string }) | null;
};

export const UPCOMING_EVENT_GRACE_HOURS = 4;

const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "college-upcoming-event.json");

function readStore(): CollegeUpcomingEventStore {
  if (!existsSync(statePath)) return { version: 2, event: null, trashedEvent: null };

  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<CollegeUpcomingEventStore>;
    return {
      version: 2,
      event: parsed.event && isCollegeUpcomingEvent(parsed.event) ? parsed.event : null,
      trashedEvent: parsed.trashedEvent && isCollegeUpcomingEvent(parsed.trashedEvent)
        ? { ...parsed.trashedEvent, deletedAt: typeof parsed.trashedEvent.deletedAt === "string" ? parsed.trashedEvent.deletedAt : new Date().toISOString() }
        : null,
    };
  } catch {
    return { version: 2, event: null, trashedEvent: null };
  }
}

function writeStore(store: CollegeUpcomingEventStore) {
  mkdirSync(stateDirectory, { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, statePath);
}

function isCollegeUpcomingEvent(value: unknown): value is CollegeUpcomingEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<CollegeUpcomingEvent>;
  return Boolean(
    typeof event.title === "string"
    && typeof event.startsAt === "string"
    && Array.isArray(event.groups)
    && typeof event.banner === "string"
    && typeof event.registrationUrl === "string"
    && typeof event.published === "boolean",
  );
}

export function getStoredCollegeUpcomingEvent() {
  return readStore().event;
}

export function getPublicCollegeUpcomingEvent(now = new Date()) {
  const event = getStoredCollegeUpcomingEvent();
  if (
    !event?.published
    || !event.title
    || !event.startsAt
    || !event.groups.length
    || !event.banner
    || !event.registrationUrl
  ) return null;

  const startTime = Date.parse(event.startsAt);
  if (Number.isNaN(startTime)) return null;
  const expiresAt = startTime + UPCOMING_EVENT_GRACE_HOURS * 60 * 60 * 1000;
  return now.getTime() <= expiresAt ? event : null;
}

export async function getStoredCollegeUpcomingEventSourceAsync() {
  if (!getSupabasePublicConfig()) return getStoredCollegeUpcomingEvent();
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("admin_college_events").select("data").eq("id", "scheduled-webinar").maybeSingle();
    if (error) throw error;
    return data?.data && isCollegeUpcomingEvent(data.data) ? data.data : null;
  } catch (error) {
    reportSupabaseReadFallback("admin-college-upcoming", error);
    return getStoredCollegeUpcomingEvent();
  }
}

export async function getStoredCollegeUpcomingEventAsync() {
  const [event, deleted] = await Promise.all([
    getStoredCollegeUpcomingEventSourceAsync(),
    isAdminRecordDeletedAsync("college-events", "scheduled-webinar"),
  ]);
  return deleted ? null : event;
}

export async function getPublicCollegeUpcomingEventAsync(now = new Date()) {
  if (await isAdminRecordDeletedAsync("college-events", "scheduled-webinar")) return null;
  if (!getSupabasePublicConfig()) return getPublicCollegeUpcomingEvent(now);
  try {
    const supabase = createSupabasePublicDataClient();
    if (!supabase) return getPublicCollegeUpcomingEvent(now);
    const { data, error } = await supabase.from("admin_college_events").select("data").eq("id", "scheduled-webinar").eq("status", "published").maybeSingle();
    if (error) throw error;
    const event = data?.data && isCollegeUpcomingEvent(data.data) ? data.data : null;
    if (!event?.published || !event.title || !event.startsAt || !event.groups.length || !event.banner || !event.registrationUrl) return null;
    const startTime = Date.parse(event.startsAt);
    return !Number.isNaN(startTime) && now.getTime() <= startTime + UPCOMING_EVENT_GRACE_HOURS * 60 * 60 * 1000 ? event : null;
  } catch (error) {
    reportSupabaseReadFallback("public-college-upcoming", error);
    return getPublicCollegeUpcomingEvent(now);
  }
}

export function saveCollegeUpcomingEvent(event: Omit<CollegeUpcomingEvent, "updatedAt">) {
  const record: CollegeUpcomingEvent = { ...event, updatedAt: new Date().toISOString() };
  const store = readStore();
  writeStore({ ...store, version: 2, event: record });
  return record;
}

export async function saveCollegeUpcomingEventAsync(event: Omit<CollegeUpcomingEvent, "updatedAt">) {
  if (!getSupabasePublicConfig()) return saveCollegeUpcomingEvent(event);
  const record: CollegeUpcomingEvent = { ...event, updatedAt: new Date().toISOString() };
  const supabase = await createSupabaseServerClient();
  const createdBy = await getCurrentAdminProfileId(supabase);
  const { error } = await supabase.from("admin_college_events").upsert({
    id: "scheduled-webinar",
    title: record.title,
    status: record.published ? "published" : "draft",
    event_date: record.startsAt || null,
    data: record,
    created_by: createdBy,
  });
  if (error) throw error;
  return record;
}

export function deleteCollegeUpcomingEvent() {
  const store = readStore();
  if (!store.event) return;
  writeStore({
    version: 2,
    event: null,
    trashedEvent: { ...store.event, deletedAt: new Date().toISOString() },
  });
}

export async function deleteCollegeUpcomingEventAsync() {
  if (!getSupabasePublicConfig()) return deleteCollegeUpcomingEvent();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("admin_college_events").delete().eq("id", "scheduled-webinar");
  if (error) throw error;
}

export function getTrashedCollegeUpcomingEvent() {
  return readStore().trashedEvent;
}

export function restoreCollegeUpcomingEvent() {
  const store = readStore();
  if (!store.trashedEvent) return;
  const { deletedAt: _deletedAt, ...event } = store.trashedEvent;
  void _deletedAt;
  writeStore({
    version: 2,
    event,
    trashedEvent: store.event ? { ...store.event, deletedAt: new Date().toISOString() } : null,
  });
}

export function permanentlyDeleteCollegeUpcomingEvent() {
  const store = readStore();
  writeStore({ ...store, version: 2, trashedEvent: null });
}

export function formatCollegeEventDate(startsAt: string, locale: Locale = "en") {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return "Date not set";
  const dateLocale = locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-GB";
  return new Intl.DateTimeFormat(dateLocale, {
    timeZone: "Asia/Amman",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatCollegeEventTime(startsAt: string, locale: Locale = "en") {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return "Time not set";
  const timeLocale = locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-US";
  return new Intl.DateTimeFormat(timeLocale, {
    timeZone: "Asia/Amman",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

// This file is the College scheduling persistence boundary. Replace its local
// store with Supabase later without changing the public page or admin screens.
