import { createStaticPageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import {
  EventsDirectory,
  UpcomingEventCard,
  type CollegeEvent,
} from "@/components/college/events-directory";
import { listManagedCollegeEventsAsync } from "@/lib/admin-college-repository";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";

export const generateMetadata = createStaticPageMetadata("/college/events");

/** Public content changes through the admin workspace and is refreshed there. */
export const revalidate = false;

/**
 * Kept outside the component: reading the clock during render is impure, and
 * splitting on the server means the client filter never compares against its
 * own clock (which would risk a hydration mismatch).
 */
async function splitByDate(allEvents: CollegeEvent[]) {
  const now = Date.now();

  return {
    upcoming: allEvents
      .filter((event) => Date.parse(event.date) >= now)
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date)),
    past: allEvents.filter((event) => Date.parse(event.date) < now),
  };
}

export default async function CollegeEventsPage() {
  const allEvents = await filterDeletedAdminRecordsAsync(
    "college-events",
    (await listManagedCollegeEventsAsync()).filter((event) => event.status !== "draft") as CollegeEvent[],
  );
  const { upcoming, past } = await splitByDate(allEvents);

  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "ArLAR College", href: "/college/about" },
          { label: "ArLAR College Events" },
        ]}
        title="ArLAR College Events"
        description="Live webinars, workshops, and the full replay archive."
        grainId="college-events-hero-grain"
      />

      {/*
        Upcoming events render only when there are any. Once the admin panel can
        publish future sessions, adding an event with a future `date` to the
        events source is all that is needed for this section to appear.
      */}
      {upcoming.length > 0 ? (
        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-jade-600" />
              <p className="font-display text-[11px] font-semibold tracking-[0.17em] text-ink-500 uppercase">
                Upcoming events
              </p>
            </div>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink-950 sm:text-4xl">
              What&apos;s coming up
            </h2>

            <div className="mt-9 space-y-5">
              {upcoming.map((event) => (
                <UpcomingEventCard key={event.id} event={{ ...event, registration: true }} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <EventsDirectory events={past} />
    </main>
  );
}
