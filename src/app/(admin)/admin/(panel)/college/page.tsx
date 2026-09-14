import { CalendarDays, Check, Settings2, Video } from "lucide-react";

import { AdminContent, AdminLink, AdminPageHeader, MetricCard, StatusPill } from "@/components/admin/admin-ui";
import { CollegeManager } from "@/components/admin/college-manager";
import { AdminRecycleBinLink } from "@/components/admin/admin-recycle-bin-link";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import {
  formatCollegeEventDate,
  formatCollegeEventTime,
  getPublicCollegeUpcomingEventAsync,
  getStoredCollegeUpcomingEventAsync,
} from "@/lib/college-upcoming-event";
import { listManagedCollegeEventsAsync } from "@/lib/admin-college-repository";

export const revalidate = false;

type CollegeData = {
  events: Array<{
    id: string;
    title: string;
    date: string;
    year: number;
    groups: string[];
    speakers?: string | null;
    image: string;
    status?: "published" | "draft";
  }>;
};

export default async function AdminCollegePage() {
  const [managedEvents, storedUpcoming, publicUpcoming] = await Promise.all([
    listManagedCollegeEventsAsync("admin"), getStoredCollegeUpcomingEventAsync(), getPublicCollegeUpcomingEventAsync(),
  ]);
  const events = await filterDeletedAdminRecordsAsync("college-events", managedEvents as CollegeData["events"]);
  const upcomingState = publicUpcoming ? "Scheduled" : storedUpcoming?.published ? "Expired" : storedUpcoming ? "Draft" : "None";
  const years = new Set(events.map((event) => event.year)).size;
  const items = events.map((event) => ({
    id: event.id,
    title: event.title,
    speakers: event.speakers || "",
    image: event.image.startsWith("/") || event.image.startsWith("http") ? event.image : `/images/arlar-college-events/${event.image}`,
    date: event.date,
    year: event.year,
    groups: event.groups,
    status: event.status || "published" as const,
    href: `/admin/college/${event.id}`,
  }));

  return (
    <>
      <AdminPageHeader
        title="ArLAR College"
        description="Manage webinars, replays, and upcoming events."
        actions={<><AdminRecycleBinLink scope="college-events" /><AdminLink href="/admin/college/new">+ Schedule webinar</AdminLink></>}
      />
      <AdminContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Webinars" value={events.length} note="Complete replay catalogue" icon={<Video className="size-5" />} tone="dark" />
          <MetricCard label="Archive span" value={years} note="Years represented" icon={<CalendarDays className="size-5" />} tone="light" />
          <MetricCard label="Upcoming event" value={upcomingState} note={storedUpcoming?.title || "No webinar scheduled"} icon={<Check className="size-5" />} tone="green" />
        </div>

        <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#e1e5e9] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-600"><CalendarDays className="size-5" /></span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-ink-950">Upcoming event</h2>
                <StatusPill tone={publicUpcoming ? "green" : storedUpcoming ? "amber" : "neutral"}>{upcomingState}</StatusPill>
              </div>
              <p className="mt-1 text-xs text-ink-500">
                {storedUpcoming
                  ? `${storedUpcoming.title} · ${formatCollegeEventDate(storedUpcoming.startsAt)} · ${formatCollegeEventTime(storedUpcoming.startsAt)} (GMT+3)`
                  : "No upcoming webinar is currently scheduled."}
              </p>
            </div>
          </div>
          <AdminLink href="/admin/college/new" variant="secondary"><Settings2 size={15} />{storedUpcoming ? "Manage webinar" : "Schedule webinar"}</AdminLink>
        </section>

        <div className="mt-6">
          <CollegeManager events={items} />
        </div>
      </AdminContent>
    </>
  );
}
