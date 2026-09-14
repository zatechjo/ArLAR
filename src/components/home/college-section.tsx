import Image from "next/image";
import Link from "next/link";
import {
  EventCard,
  type CollegeEvent,
} from "@/components/college/events-directory";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
} from "@/components/icons";
import { listManagedCollegeEventsAsync } from "@/lib/admin-college-repository";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import { localizePath, type Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";

const learningPillars = [
  {
    number: "01",
    title: "Expert-led",
    description: "Learning shaped by regional and international faculty.",
  },
  {
    number: "02",
    title: "Practice-ready",
    description: "Clinical insight designed to translate into better care.",
  },
  {
    number: "03",
    title: "Always accessible",
    description: "Live education and on-demand replays in one place.",
  },
] as const;

export async function CollegeSection({ locale = "en" }: { locale?: Locale }) {
  const t = (source: string) => translate(locale, source);
  const href = (path: string) => localizePath(path, locale);
  const recentReplays = (await filterDeletedAdminRecordsAsync(
    "college-events",
    (await listManagedCollegeEventsAsync()).filter((event) => event.status !== "draft") as CollegeEvent[],
  )).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 3);
  return (
    <section className="relative isolate overflow-hidden bg-[#06101f] px-4 py-20 text-white sm:px-6 lg:py-28">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(0,149,59,0.12),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(56,189,248,0.09),transparent_30%),radial-gradient(circle_at_60%_88%,rgba(193,2,48,0.08),transparent_28%)]"
      />
      <svg
        aria-hidden
        className="absolute inset-0 size-full opacity-30"
      >
        <defs>
          <pattern
            id="college-dot-grid"
            width="52"
            height="52"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.1" fill="white" opacity="0.1" />
            <path
              d="M2 2H52M2 2V52"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.025"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#college-dot-grid)" />
      </svg>
      <div
        aria-hidden
        className="absolute -right-48 top-40 size-[34rem] rounded-full border border-sky-300/10"
      />
      <div
        aria-hidden
        className="absolute -right-28 top-60 size-[22rem] rounded-full border border-jade-300/10"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-jade-400" />
              <p className="font-display text-[11px] font-semibold tracking-[0.18em] text-sky-100/60">
                ArLAR COLLEGE
              </p>
            </div>

            <h2 className="mt-6 max-w-xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.4rem]">
              {t("Learning designed for the realities of clinical practice.")}
            </h2>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-sky-100/60 sm:text-base">
              {t("ArLAR College brings together expert faculty, structured education, and practical discussion to help rheumatologists strengthen care across every stage of their career.")}
            </p>

            <div className="mt-9 grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] sm:grid-cols-3 sm:divide-x sm:divide-white/10">
              {learningPillars.map((pillar) => (
                <div
                  key={pillar.number}
                  className="border-b border-white/10 p-5 last:border-b-0 sm:border-b-0"
                >
                  <span className="font-display text-[10px] font-semibold tracking-[0.18em] text-jade-300/70">
                    {pillar.number}
                  </span>
                  <h3 className="mt-3 font-display text-[14px] font-semibold text-white">
                    {t(pillar.title)}
                  </h3>
                  <p className="mt-2 text-[11px] leading-5 text-sky-100/45">
                    {t(pillar.description)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={href("/college/about")}
                className="group inline-flex min-h-12 items-center gap-2 rounded-xl bg-jade-500 px-5 font-display text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-jade-400"
              >
                {t("Explore ArLAR College")}
                <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href={href("/college/events")}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 font-display text-[13px] font-semibold text-white/85 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
              >
                {t("View upcoming learning")}
              </Link>
            </div>
          </div>

          <div className="relative min-h-[450px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1829] shadow-2xl shadow-black/25 sm:min-h-[520px]">
            <Image
              src="/images/arlar-college-learning-laptop.png"
              alt="Online rheumatology education through ArLAR College"
              fill
              sizes="(max-width: 1024px) 100vw, 54vw"
              className="object-cover object-left"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#06101f] via-[#06101f]/15 to-transparent"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-[#06101f]/40 via-transparent to-transparent"
            />

            <div className="absolute right-5 top-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#06101f]/65 px-4 py-3 backdrop-blur-xl sm:right-7 sm:top-7">
              <span className="grid size-10 place-items-center rounded-xl bg-jade-400/15 text-jade-300">
                <GraduationCap className="size-5" />
              </span>
              <span>
                <small className="block text-[9px] font-semibold tracking-[0.15em] text-sky-100/45 uppercase">
                  {t("Built for")}
                </small>
                <strong className="mt-0.5 block font-display text-[12px] font-semibold text-white">
                  {t("Lifelong clinical learning")}
                </strong>
              </span>
            </div>

            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-[#06101f]/75 p-5 backdrop-blur-xl sm:inset-x-7 sm:bottom-7 sm:p-6">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="font-display text-lg font-semibold text-white sm:text-xl">
                    {t("Learn. Apply. Advance.")}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-5 text-sky-100/50 sm:text-xs">
                    {t("One education hub for courses, webinars, and practical workshops.")}
                  </p>
                </div>
                <span className="hidden size-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-jade-300 sm:grid">
                  <BookOpen className="size-5" />
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                {["Courses", "Webinars", "Workshops"].map((format, index) => (
                  <span
                    key={format}
                    className="inline-flex items-center gap-2 font-display text-[10px] font-semibold tracking-[0.08em] text-sky-100/55 uppercase"
                  >
                    {t(format)}
                    {index < 2 ? (
                      <span className="text-jade-400/70">•</span>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-white/10 pt-14 lg:mt-28 lg:pt-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-display text-[11px] font-semibold tracking-[0.18em] text-crimson-300 uppercase">
                {t("Watch on demand")}
              </p>
              <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.025em] text-white sm:text-4xl">
                {t("ArLAR College replays")}
              </h3>
              <p className="mt-3 max-w-xl text-[13px] leading-6 text-sky-100/50">
                {t("Revisit recent webinars from ArLAR College and its collaborating groups, available whenever you are ready to learn.")}
              </p>
            </div>
            <Link
              href={href("/college/events")}
              className="group inline-flex items-center gap-2 font-display text-[13px] font-semibold text-white/70 transition-colors hover:text-white"
            >
              {t("Browse all replays")}
              <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {recentReplays.map((replay) => (
              <EventCard
                key={replay.id}
                event={replay}
                hoverMode="border-only"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
