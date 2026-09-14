import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  type Arlar21Replay,
  Arlar21ReplayLibrary,
} from "@/components/congresses/arlar21-replay-library";
import {
  ArrowRight,
  CalendarDays,
  Globe,
  Play,
  Quote,
  Users,
} from "@/components/icons";
import congressData from "@/data/arlar21-jordan.json";
import { localizePath, type Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { findManagedDoctorByName, listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import { getDeletedAdminRecordIdsAsync, isAdminRecordDeletedAsync } from "@/lib/admin-deletion-repository";
import { getCongressAsync } from "@/lib/admin-congress-data";

export const generateMetadata = createStaticPageMetadata("/congresses/arlar21");

const programHighlights = [
  "Adult Rheumatology — two parallel sessions",
  "Pediatric Rheumatology session",
  "Poster sessions",
  "Post-e-Congress abstract sessions",
];

const presidentMessage = [
  congressData.pageCopy.covidPostponement,
  congressData.pageCopy.themeExplanation,
  congressData.pageCopy.programDescription,
  congressData.pageCopy.programItems[0],
];

export default async function Arlar21Page({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const href = (path: string) => localizePath(path, lang);
  const [managedCongress, congressDeleted, deletedReplayIds, doctors] = await Promise.all([
    getCongressAsync("arlar21"), isAdminRecordDeletedAsync("congresses", "arlar21"), getDeletedAdminRecordIdsAsync("congress-replays"), listManagedDoctorsAsync(),
  ]);
  if (congressDeleted || !managedCongress || managedCongress.status !== "published") notFound();
  const congressPresident = findManagedDoctorByName(doctors, "Basel Masri");
  const congressPresidentName =
    (lang === "ar" && congressPresident?.nameAr) ||
    congressPresident?.fullName ||
    "Basel Masri, MD";
  const congressPresidentImage = congressPresident?.image ?? "/images/arlar21/page/basel-masri.jpg";
  const visibleReplayVideos: Arlar21Replay[] = managedCongress.videos.filter((video) => video.status === "published" && !deletedReplayIds.has(`arlar21:${video.id}`)).map((video, index) => ({ order: index + 1, speaker: video.speaker, title: video.title, track: video.track || "Opening & closing", date: video.date, dateLabel: video.date, youtubeId: video.youtubeId, duration: video.duration }));
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-[#180629] text-white">
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[linear-gradient(118deg,#12031f_0%,#2a0845_48%,#511174_100%)]"
        />
        <div
          aria-hidden
          className="absolute -right-20 -top-36 size-[30rem] rounded-full bg-[#b638d1]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-48 left-[22%] size-[28rem] rounded-full bg-[#5920d6]/18 blur-3xl"
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_0)] opacity-20 [background-size:25px_25px] [mask-image:linear-gradient(90deg,black,transparent_82%)]"
        />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.75fr] lg:items-center lg:py-16">
          <div>
            <nav
              aria-label={t("Breadcrumb")}
              className="flex flex-wrap items-center gap-2.5 font-display text-[13px] font-medium text-white/58"
            >
              <Link href={href("/")} className="transition-colors hover:text-white">
                {t("Home")}
              </Link>
              <span aria-hidden className="text-white/25">
                /
              </span>
              <span className="text-white/72">{t("Congresses")}</span>
              <span aria-hidden className="text-white/25">
                /
              </span>
              <span className="text-white/82">{managedCongress.title}</span>
            </nav>

            <h1 className="mt-8 max-w-3xl font-display text-5xl font-semibold leading-[0.96] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              {lang === "ar" ? (
                <>
                  <span className="block">مؤتمر <bdi dir="ltr">ArLAR21</bdi></span>
                  <span className="block text-[#dca7ef]">الأردن الإلكتروني</span>
                </>
              ) : (
                <>
                  {managedCongress.title}
                  <span className="block text-[#dca7ef]">{t("e-Congress")}</span>
                </>
              )}
            </h1>

            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-white/70 sm:text-[16px]">
              {t("Raising awareness of high-quality rheumatology practice to empower rheumatologists across the Arab world.")}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 font-display text-[12px] font-semibold text-white/88">
                <CalendarDays className="size-4 text-[#dda9ee]" />
                {t("3–7 March 2021")}
              </span>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 font-display text-[12px] font-semibold text-white/88">
                <Globe className="size-4 text-[#dda9ee]" />
                {t("Virtual meeting · Jordan")}
              </span>
            </div>

            <Link
              href="#replays"
              className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-5 font-display text-[13px] font-semibold text-[#38104e] transition-colors hover:bg-[#f1dcf7]"
            >
              <Play className="size-4 fill-current" />
              {t("Browse congress replays")}
              <ArrowRight className="rtl-flip size-4" />
            </Link>
          </div>

          <div className="mx-auto w-full max-w-[29rem] lg:mr-0">
            <div className="overflow-hidden rounded-[2rem] border border-white/16 bg-[#11031d]/40 p-2">
              <Image
                src="/images/arlar21/page/arlar21-replay.png"
                alt={t("ArLAR21 Jordan e-Congress highlights")}
                width={882}
                height={835}
                priority
                className="aspect-[1.055/1] w-full rounded-[1.55rem] object-cover"
              />
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-[#10021b]/32">
          <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
            {[
              { value: String(visibleReplayVideos.length), label: "Recordings" },
              { value: "76", label: "Speakers" },
              { value: "29", label: "Scientific tracks" },
              { value: "English", label: "Official language" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border-white/10 px-3 py-5 first:pl-0 odd:border-r lg:border-r lg:last:border-r-0 lg:last:pr-0"
              >
                <p className="font-display text-2xl font-semibold tracking-[-0.03em] text-white">
                  {t(stat.value)}
                </p>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.13em] text-[#d6b6e3]/70 uppercase">
                  {t(stat.label)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-[#7a2aad] uppercase">
              {t("Congress overview")}
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
              {t("Regional science, delivered virtually.")}
            </h2>
            <p className="mt-6 max-w-3xl text-[14px] leading-7 text-ink-600">
              {t(congressData.pageCopy.replayIntro)}
            </p>
            <p className="mt-5 max-w-3xl text-[14px] leading-7 text-ink-600">
              {t("The congress was held in conjunction with the 6th International e-Congress of the Jordanian Society of Rheumatology. Originally planned as an in-person meeting, it moved online in response to the COVID-19 pandemic with ArLAR College.")}
            </p>
          </div>

          <aside className="rounded-[1.75rem] border border-[#d8c4e4] bg-[#241033] p-6 text-white sm:p-8">
            <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-[#d9a9ea] uppercase">
              {t("Congress theme")}
            </p>
            <blockquote className="mt-5 font-display text-2xl font-semibold leading-9 tracking-[-0.025em] text-white">
              “{t(congressData.pageCopy.theme)}”
            </blockquote>
            <div className="mt-7 grid gap-3 border-t border-white/12 pt-5 text-[12px] text-white/65 sm:grid-cols-2">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-[#d9a9ea]" />
                {t("3–7 March 2021")}
              </span>
              <span className="inline-flex items-center gap-2">
                <Globe className="size-4 text-[#d9a9ea]" />
                {t("English")}
              </span>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-[#f7f4f9] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-[#7a2aad] uppercase">
              {t("Scientific programme")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
              {t("Five days of specialist education")}
            </h2>
            <p className="mt-5 text-[14px] leading-7 text-ink-600">
              {t("Distinguished regional and international speakers delivered presentations and workshops designed for clinicians, academicians, and researchers in rheumatology.")}
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {programHighlights.map((item, index) => (
              <article
                key={item}
                className="rounded-[1.7rem] border border-[#dfd4e6] bg-white p-6"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-[#f0e5f5] font-display text-[11px] font-semibold text-[#6f258f]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-[17px] font-semibold leading-6 text-ink-950">
                  {t(item)}
                </h3>
              </article>
            ))}
          </div>

        </div>
      </section>

      <section className="bg-[#f7f4f9] pb-14 lg:pb-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Arlar21ReplayLibrary videos={visibleReplayVideos} />
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
            {t("President's Message")}
          </h2>

          <article className="mt-9 grid min-w-0 gap-8 lg:grid-cols-[320px_1fr] lg:gap-12">
            <aside className="min-w-0 lg:sticky lg:top-[13rem] lg:self-start">
              <div className="overflow-hidden rounded-3xl border border-transparent bg-linear-to-br from-[#321044] via-[#57206f] to-[#7f2ca3] p-5 text-white sm:p-6">
                <div className="grid justify-items-center gap-4 text-center">
                  <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/35">
                    <Image
                      src={congressPresidentImage}
                      alt={congressPresidentName}
                      fill
                      sizes="144px"
                      className="object-cover object-top"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold leading-tight text-white">
                      {congressPresidentName}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-white/68 uppercase">
                      {t("President of the e-Congress")}
                    </p>
                  </div>
                </div>

                <ul className="mt-5 grid gap-2.5 border-t border-white/15 pt-5 text-sm">
                  {["ArLAR President", "JSR President"].map((role) => (
                    <li
                      key={role}
                      className="flex items-start gap-2.5 leading-6 text-white/85"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#e4b7f3]" />
                      <span className="min-w-0">{t(role)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 rounded-xl bg-white/94 p-3">
                  <Image
                    src="/images/arlar21/page/basel-masri-signature.png"
                    alt=""
                    width={180}
                    height={48}
                    className="h-auto w-40 object-contain object-left"
                  />
                </div>
              </div>
            </aside>

            <div className="relative min-w-0">
              <Quote
                className="size-12 text-[#7a2aad]/25"
                aria-hidden="true"
              />
              <p className="mt-3 font-display text-lg font-semibold text-ink-950">
                {t(congressData.pageCopy.salutation)}
              </p>

              <div className="mt-4 space-y-4 text-[15px] leading-8 text-ink-600 sm:text-base">
                {presidentMessage.map((paragraph) => (
                  <p key={paragraph}>{t(paragraph)}</p>
                ))}

                <div className="pt-2">
                  <p className="font-display font-semibold text-ink-900">
                    {t("It will include:")}
                  </p>
                  <ul className="mt-3 grid gap-2.5">
                    {programHighlights.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-3 size-1.5 shrink-0 rounded-full bg-[#7a2aad]" />
                        <span>{t(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 border-t border-ink-100 pt-5">
                <p className="font-display text-base font-semibold text-ink-950">
                  {congressPresidentName}
                </p>
                <p className="mt-1 text-sm leading-6 text-ink-500">
                  {t("President of the ArLAR21 Jordan e-Congress")}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-[#f7f4f9] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-[#7a2aad] uppercase">
                {t("Congress partners")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
                {t("With thanks to our sponsors")}
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 text-[12px] text-ink-500">
              <Users className="size-4 text-[#7a2aad]" />
              ArLAR21 e-Congress
            </span>
          </div>

          <div className="mt-7 overflow-hidden rounded-[1.75rem] border border-[#ded3e8] bg-[#26043f]">
            <Image
              src="/images/arlar21/sponsors/sponsors-thank-you.png"
              alt={t("ArLAR21 sponsor acknowledgements")}
              width={1377}
              height={929}
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
