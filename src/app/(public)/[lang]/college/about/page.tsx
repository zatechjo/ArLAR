import Image from "next/image";
import Link from "next/link";
import {
  PeopleCarousel,
  type DirectoryPerson,
} from "@/components/about/people-directory";
import {
  EventCard,
  type CollegeEvent,
} from "@/components/college/events-directory";
import { PageHero } from "@/components/page-hero";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  GraduationCap,
  Globe,
  Microscope,
  Users,
} from "@/components/icons";
import collegeMembers from "@/data/college-members.json";
import { findManagedDoctorByName } from "@/lib/admin-doctor-repository";
import { listManagedCollegeEventsAsync } from "@/lib/admin-college-repository";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import { listAssignedDoctorsAsync } from "@/lib/doctor-placement-repository";
import {
  formatCollegeEventDate,
  formatCollegeEventTime,
  getPublicCollegeUpcomingEventAsync,
} from "@/lib/college-upcoming-event";
import { getPublishedSiteContent } from "@/lib/site-content-repository";
import { createStaticPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";

// Public content changes through the admin workspace and is refreshed there.
export const revalidate = false;

export const generateMetadata = createStaticPageMetadata("/college/about");

const objectives = [
  {
    number: "01",
    title: "Collaborative research",
    description:
      "Increase scientific collaborative research among ArLAR members, and between them and the international rheumatology community.",
    Icon: Microscope,
  },
  {
    number: "02",
    title: "Awareness and mentorship",
    description:
      "Increase awareness of rheumatology and musculoskeletal diseases among Arab rheumatologists by organizing regular webinars, workshops, and training, and by mentoring younger rheumatologists.",
    Icon: Users,
  },
  {
    number: "03",
    title: "Programs and projects",
    description:
      "Develop programs and projects that reach the objectives the College sets across all fields of rheumatology and musculoskeletal disease.",
    Icon: GraduationCap,
  },
  {
    number: "04",
    title: "Continuous medical education",
    description:
      "Promote the continuous medical education of ArLAR members across the different sectors of rheumatology.",
    Icon: BookOpen,
  },
] as const;

export default async function AboutCollegePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const [upcomingEvent, managedEvents, managedMembers, assignedDoctors] = await Promise.all([
    getPublicCollegeUpcomingEventAsync(),
    listManagedCollegeEventsAsync(),
    getPublishedSiteContent("people", "college-members", collegeMembers),
    listAssignedDoctorsAsync("arlar-college-members"),
  ]);
  const sourcePeople = managedMembers.people;
  const memberPreview = assignedDoctors.map(({ doctor, placement }, index): DirectoryPerson => {
    const person = sourcePeople.find((candidate) => findManagedDoctorByName([doctor], candidate.fullName));
    return { ...person, doctorId: doctor.id, id: doctor.id, slug: doctor.slug, sortOrder: person?.sortOrder ?? sourcePeople.length + index + 1, group: (person?.group as DirectoryPerson["group"] | undefined) ?? "members", fullName: doctor.fullName, nameAr: doctor.nameAr, nameFr: doctor.nameFr, credentials: doctor.credentials, displayRole: placement.role || person?.displayRole || "ArLAR College Member", countryName: doctor.country, flagFilename: doctor.flagFilename, bio: doctor.biography, biographyAr: doctor.biographyAr, biographyFr: doctor.biographyFr, imageFilename: doctor.image, imagePosition: doctor.imagePosition, appearances: doctor.appearances };
  });
  const pastEventPreview = (await filterDeletedAdminRecordsAsync(
    "college-events",
    managedEvents.filter((event) => event.status !== "draft") as CollegeEvent[],
  )).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 3);

  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "ArLAR College", href: "/college/about" },
          { label: "About the College" },
        ]}
        title="ArLAR College"
        description="Scientific collaboration, awareness, and continuous medical education for rheumatologists."
        grainId="college-about-grain"
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/college/members"
            className="group inline-flex min-h-12 items-center gap-2 rounded-xl bg-jade-500 px-5 font-display text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-jade-400"
          >
            {t("ArLAR College Members")}
            <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/college/events"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-5 font-display text-[13px] font-semibold text-white/85 backdrop-blur transition-colors hover:border-white/35 hover:bg-white/12 hover:text-white"
          >
            <CalendarDays className="size-4" />
            {t("ArLAR College Events")}
          </Link>
        </div>
      </PageHero>

      {/* What is the ArLAR College */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28">
        <div
          aria-hidden
          className="absolute -left-44 top-20 size-80 rounded-full bg-jade-50/70 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-crimson-600" />
              <p
                className={`font-display font-semibold tracking-[0.17em] text-ink-500 uppercase ${
                  lang === "ar" ? "text-[13px]" : "text-[11px]"
                }`}
              >
                {t("What is ArLAR College")}
              </p>
            </div>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-[2.9rem]">
              {t("A college built by")} {" "}
              <span className="text-jade-700">{t("Arab rheumatologists.")}</span>
            </h2>

            <div className="mt-7 space-y-5 text-[15px] leading-7 text-ink-500">
              <p>
                {t("ArLAR College gathers the efforts of expert Arab rheumatologists, working in collaboration with the international rheumatology community.")}
              </p>
              <p>
                {t("It is where the region trains together: regular webinars, workshops, and mentoring that raise awareness of rheumatic and musculoskeletal disease and keep clinical practice current.")}
              </p>
            </div>

            <dl className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 sm:grid-cols-3">
              {[
                { term: "Webinars", detail: "Live, year-round" },
                { term: "Workshops", detail: "Hands-on training" },
                { term: "Mentoring", detail: "For younger rheumatologists" },
              ].map((item) => (
                <div key={item.term} className="bg-[#fafbfc] p-5">
                  <dt className="font-display text-[14px] font-semibold text-ink-950">
                    {t(item.term)}
                  </dt>
                  <dd className="mt-1.5 text-[11.5px] leading-5 text-ink-500">
                    {t(item.detail)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] border border-ink-100 bg-ink-100 shadow-2xl shadow-ink-950/10">
            <Image
              src="/images/arlar-college-learning-laptop.png"
              alt="An ArLAR College session on musculoskeletal imaging"
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover object-center"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950/70 to-transparent"
            />

            <div className="absolute inset-x-5 bottom-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#06101f]/70 px-5 py-4 backdrop-blur-xl">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-jade-400/15 text-jade-300">
                <Globe className="size-5" />
              </span>
              <span className="min-w-0">
                <small className="block text-[9px] font-semibold tracking-[0.15em] text-sky-100/45 uppercase">
                  {t("Open across")}
                </small>
                <strong className="mt-0.5 block font-display text-[12.5px] font-semibold text-white">
                  {t("The Arab countries and beyond")}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="relative isolate overflow-hidden bg-[#f5f8f8] py-20 lg:py-28">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_8%_20%,rgba(193,2,48,0.05),transparent_24%),radial-gradient(circle_at_92%_80%,rgba(0,149,59,0.07),transparent_27%)]"
        />
        <svg
          aria-hidden
          className="absolute right-[-8rem] top-16 size-[32rem] text-jade-700 opacity-[0.045]"
          viewBox="0 0 500 500"
          fill="none"
        >
          <circle cx="250" cy="250" r="180" stroke="currentColor" />
          <circle cx="250" cy="250" r="120" stroke="currentColor" />
          <circle cx="250" cy="250" r="55" stroke="currentColor" />
          <path d="M250 70V430M70 250H430" stroke="currentColor" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-crimson-600" />
              <p className="font-display text-[11px] font-semibold tracking-[0.17em] text-ink-500 uppercase">
                {t("College objectives")}
              </p>
            </div>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink-950 sm:text-4xl">
              {t("What ArLAR College sets out to do.")}
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {objectives.map((objective) => (
              <article
                key={objective.number}
                className="group relative overflow-hidden rounded-[1.5rem] border border-ink-100 bg-white p-7 transition-[border-color,background-color] duration-300 hover:border-jade-200 hover:bg-jade-50/25 sm:p-8"
              >
                <span
                  aria-hidden
                  className="absolute -right-14 -top-14 size-40 rounded-full border-[20px] border-jade-50 transition-transform duration-500 group-hover:scale-110"
                />
                <div className="relative flex items-start justify-between gap-5">
                  <span className="grid size-12 place-items-center rounded-xl border border-ink-100 bg-gradient-to-br from-crimson-50 via-white to-jade-50 text-ink-800">
                    <objective.Icon className="size-5" />
                  </span>
                  <span className="font-display text-3xl font-semibold leading-none tracking-[-0.05em] text-ink-100 transition-colors group-hover:text-jade-200">
                    {objective.number}
                  </span>
                </div>
                <h3 className="relative mt-6 font-display text-[19px] font-semibold tracking-[-0.02em] text-ink-950">
                  {t(objective.title)}
                </h3>
                <p className="relative mt-3 text-[13.5px] leading-7 text-ink-500">
                  {t(objective.description)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Members preview */}
      <section id="members-preview" className="relative scroll-mt-32 overflow-hidden bg-white py-20 lg:py-28">
        <div aria-hidden className="absolute -right-32 top-10 size-96 rounded-full bg-jade-50/70 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-7">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-crimson-600" />
                <p className="font-display text-[11px] font-semibold tracking-[0.17em] text-ink-500 uppercase">
                  {t("College members")}
                </p>
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink-950 sm:text-4xl">
                {t("The people behind the programme.")}
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-ink-500">
                {t("Expert rheumatologists from across the Arab world shaping education, mentorship, and scientific exchange.")}
              </p>
            </div>
            <Link
              href="/college/members"
              className="group inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink-200 bg-white px-5 font-display text-[12.5px] font-semibold text-ink-900 transition-colors hover:border-jade-300 hover:text-jade-700"
            >
              {t("Meet all members")}
              <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <PeopleCarousel
            people={memberPreview}
            imageDirectory="/images/college-members"
            className="mt-10"
          />
        </div>
      </section>

      {upcomingEvent ? (
        <section id="upcoming-webinar" className="relative isolate scroll-mt-32 overflow-hidden bg-[#edf2f4] py-20 lg:py-24">
          <div aria-hidden className="absolute -left-24 top-0 size-80 rounded-full bg-crimson-100/65 blur-3xl" />
          <div aria-hidden className="absolute -right-20 bottom-0 size-96 rounded-full bg-jade-100/65 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div>
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-crimson-600" />
                  <p className="font-display text-[11px] font-semibold tracking-[0.17em] text-ink-500 uppercase">
                    {t("Upcoming webinar")}
                  </p>
                </div>
                <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink-950 sm:text-4xl">
                  {t("Continue learning live.")}
                </h2>
              </div>
            </div>

            <article className="mt-10 grid overflow-hidden rounded-[2rem] border border-ink-100 bg-white lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
              <div className="flex items-center justify-center border-b border-ink-100 bg-[#f7f9fa] p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-7">
                <div className="relative aspect-[952/1200] w-full max-w-[22rem] overflow-hidden rounded-2xl border border-ink-100 bg-white">
                  <Image
                    src={upcomingEvent.banner}
                    alt={`${upcomingEvent.title} webinar banner`}
                    fill
                    sizes="(max-width: 640px) calc(100vw - 5rem), 22rem"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12 xl:p-14">
                <div className="flex flex-wrap gap-2">
                    {upcomingEvent.groups.map((group) => (
                      <span key={group} className="rounded-full border border-jade-100 bg-jade-50 px-3 py-1.5 font-display text-[10px] font-semibold text-jade-700">
                      {t(group)}
                      </span>
                    ))}
                </div>
                <h3 className="mt-6 max-w-3xl font-display text-2xl font-semibold leading-[1.25] tracking-[-0.025em] text-ink-950 sm:text-3xl lg:text-[2.1rem]">
                  {t(upcomingEvent.title)}
                </h3>
                <p className="mt-4 max-w-2xl text-[14px] leading-7 text-ink-500">
                  {t("Join ArLAR College live for a focused educational session led by regional experts.")}
                </p>

                <div className="mt-7 flex flex-wrap gap-x-10 gap-y-4 border-y border-ink-100 py-5 sm:gap-x-12">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-crimson-50 text-crimson-600">
                      <CalendarDays className="size-4.5" />
                    </span>
                    <span>
                      <small className="block font-display text-[9px] font-semibold tracking-[0.13em] text-ink-400 uppercase">{t("Date")}</small>
                      <strong className="mt-1 block font-display text-[13px] font-semibold text-ink-900">{formatCollegeEventDate(upcomingEvent.startsAt, lang)}</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-jade-50 text-jade-700">
                      <Clock3 className="size-4.5" />
                    </span>
                    <span>
                      <small className="block font-display text-[9px] font-semibold tracking-[0.13em] text-ink-400 uppercase">{t("Time")}</small>
                      <strong className="mt-1 block font-display text-[13px] font-semibold text-ink-900">{formatCollegeEventTime(upcomingEvent.startsAt, lang)} (GMT+3)</strong>
                    </span>
                  </div>
                </div>

                {upcomingEvent.registrationUrl ? (
                  <a
                    href={upcomingEvent.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-8 inline-flex min-h-12 w-fit items-center rounded-xl bg-crimson-600 px-6 font-display text-[13px] font-semibold text-white transition-colors hover:bg-crimson-700"
                  >
                    {t("Register now")}
                  </a>
                ) : (
                  <span aria-disabled="true" className="mt-8 inline-flex min-h-12 w-fit items-center rounded-xl bg-crimson-600 px-6 font-display text-[13px] font-semibold text-white">
                    {t("Register now")}
                  </span>
                )}
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {/* Past events preview */}
      <section id="recent-replays" className="relative scroll-mt-32 overflow-hidden bg-[#f5f8f8] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-7">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-crimson-600" />
                <p className="font-display text-[11px] font-semibold tracking-[0.17em] text-ink-500 uppercase">
                  {t("Past events")}
                </p>
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink-950 sm:text-4xl">
                {t("Recent webinar replays.")}
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-ink-500">
                {t("Revisit the latest ArLAR College sessions or explore the complete educational archive.")}
              </p>
            </div>
            <Link
              href="/college/events#replays"
              className="group inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink-200 bg-white px-5 font-display text-[12.5px] font-semibold text-ink-900 transition-colors hover:border-jade-300 hover:text-jade-700"
            >
              {t("Browse all replays")}
              <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pastEventPreview.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
