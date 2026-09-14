import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";

import collegeData from "@/data/college-events.json";
import type { CollegeEventRecord } from "@/components/admin/college-event-editor";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabasePublicDataClient, getCurrentAdminProfileId, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStoredCollegeUpcomingEvent, type CollegeUpcomingEvent } from "@/lib/college-upcoming-event";

type Store = { version: 1; records: Record<string, CollegeEventRecord & { status?: "published" | "draft" }> };
const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "college-archive.json");

export function listManagedCollegeEvents() {
  const store = readStore();
  return (collegeData.events as CollegeEventRecord[]).map((event) => store.records[event.id || ""] || event);
}
export function getManagedCollegeEvent(id: string) { return listManagedCollegeEvents().find((event) => event.id === id); }
export function saveManagedCollegeEvent(record: CollegeEventRecord & { id: string; status: "published" | "draft" }) { const store = readStore(); store.records[record.id] = { ...record }; writeStore(store); }
function readStore(): Store { if (!existsSync(statePath)) return { version: 1, records: {} }; try { const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<Store>; return { version: 1, records: parsed.records && typeof parsed.records === "object" ? parsed.records : {} }; } catch { return { version: 1, records: {} }; } }
function writeStore(store: Store) { mkdirSync(stateDirectory, { recursive: true }); const temporaryPath = `${statePath}.${process.pid}.tmp`; writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8"); renameSync(temporaryPath, statePath); }

const listCachedPublicCollegeEvents = unstable_cache(
  async () => {
    const supabase = createSupabasePublicDataClient();
    if (!supabase) return null;
    const { data, error } = await supabase.from("admin_college_events").select("id, data, status").order("event_date", { ascending: false });
    if (error) throw error;
    return data;
  },
  ["public-college-events"],
  { tags: ["public-college-events"], revalidate: false },
);

export async function listManagedCollegeEventsAsync(access: "public" | "admin" = "public") {
  if (!getSupabasePublicConfig()) {
    const events = listManagedCollegeEvents();
    const scheduled = access === "public" ? scheduledEventRecord(getStoredCollegeUpcomingEvent()) : null;
    return scheduled ? [scheduled, ...events] : events;
  }
  try {
    const data = access === "public"
      ? await listCachedPublicCollegeEvents()
      : await (async () => {
          const supabase = await createSupabaseServerClient();
          const result = await supabase.from("admin_college_events").select("id, data, status").order("event_date", { ascending: false });
          if (result.error) throw result.error;
          return result.data;
        })();
    if (!data?.length) return listManagedCollegeEvents();
    const scheduledRow = data.find((row) => row.id === "scheduled-webinar");
    const scheduled = access === "public"
      ? scheduledEventRecord(scheduledRow?.data as CollegeUpcomingEvent | null, scheduledRow?.status as "published" | "draft" | undefined)
      : null;
    const stored = data
      .filter((row) => row.id !== "scheduled-webinar")
      .map((row) => ({ ...(row.data as CollegeEventRecord), status: row.status as "published" | "draft" }));
    // Saved rows are overrides on the bundled archive. Keeping only Supabase
    // rows would make every untouched imported webinar disappear as soon as
    // the first event (including the special scheduled webinar) is saved.
    const seeds = listManagedCollegeEvents();
    const storedById = new Map(stored.map((event) => [event.id, event]));
    const seedIds = new Set(seeds.map((event) => event.id));
    return [
      ...(scheduled ? [scheduled] : []),
      ...seeds.map((event) => storedById.get(event.id) || event),
      ...stored.filter((event) => !seedIds.has(event.id)),
    ];
  } catch (error) {
    reportSupabaseReadFallback("admin-college-events", error);
    return listManagedCollegeEvents();
  }
}

function scheduledEventRecord(event: CollegeUpcomingEvent | null | undefined, storedStatus?: "published" | "draft"): (CollegeEventRecord & { id: string; status: "published" | "draft" }) | null {
  if (!event?.startsAt || !event.title) return null;
  const startsAt = Date.parse(event.startsAt);
  if (Number.isNaN(startsAt)) return null;
  // A scheduled webinar always points at its registration link. Turning one
  // into a replay is a manual step: an administrator adds the archive record
  // themselves, so nothing here rewrites the destination once the date passes.
  if (!event.registrationUrl) return null;
  return {
    id: "scheduled-webinar",
    title: event.title,
    date: event.startsAt,
    year: new Date(startsAt).getUTCFullYear(),
    groups: event.groups,
    speakers: event.speakers || null,
    moderators: event.moderators || null,
    webinarUrl: event.registrationUrl,
    image: event.banner,
    status: storedStatus === "draft" || !event.published ? "draft" : "published",
    updatedDate: event.updatedAt,
  };
}

export async function getManagedCollegeEventAsync(id: string, access: "public" | "admin" = "public") {
  return (await listManagedCollegeEventsAsync(access)).find((event) => event.id === id);
}

export async function saveManagedCollegeEventAsync(record: CollegeEventRecord & { id: string; status: "published" | "draft" }) {
  if (!getSupabasePublicConfig()) return saveManagedCollegeEvent(record);
  const supabase = await createSupabaseServerClient();
  const createdBy = await getCurrentAdminProfileId(supabase);
  const { error } = await supabase.from("admin_college_events").upsert({ id: record.id, title: record.title || "", status: record.status, event_date: record.date || null, data: record, created_by: createdBy });
  if (error) throw error;
}

// Supabase boundary: imported source IDs remain stable primary/external keys.
