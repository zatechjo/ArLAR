import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Arlar23Gallery,
  type Arlar23Replay,
  Arlar23ReplayLibrary,
} from "@/components/congresses/arlar23-replay-library";
import { ArrowRight, CalendarDays, MapPin, Play, Users, Video } from "@/components/icons";
import { localizePath, type Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { getDeletedAdminRecordIdsAsync, isAdminRecordDeletedAsync } from "@/lib/admin-deletion-repository";
import { getCongressAsync } from "@/lib/admin-congress-data";
import { getArlar23GalleryThumbnailSrc } from "@/lib/arlar23-gallery";

export const generateMetadata = createStaticPageMetadata("/congresses/arlar23-replay");

export default async function Arlar23ReplayPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const href = (path: string) => localizePath(path, lang);
  const [managedCongress, congressDeleted, deletedReplayIds] = await Promise.all([
    getCongressAsync("arlar23"), isAdminRecordDeletedAsync("congresses", "arlar23"), getDeletedAdminRecordIdsAsync("congress-replays"),
  ]);
  if (congressDeleted || !managedCongress || managedCongress.status !== "published") notFound();
  const visibleReplayVideos: Arlar23Replay[] = managedCongress.videos.filter((video) => video.status === "published" && !deletedReplayIds.has(`arlar23:${video.id}`)).map((video, index) => ({ order: index + 1, day: Number(video.day.match(/\d+/)?.[0]) || 1, date: video.date, dateLabel: video.date, program: video.track, room: video.room, title: video.title, speakers: video.speaker.split(",").map((speaker) => speaker.trim()).filter(Boolean), youtubeId: video.youtubeId }));
  const visibleGalleryImages = managedCongress.gallery.filter((item): item is typeof item & { src: string } => Boolean(item.src)).map((item, index) => ({ src: item.src, thumbnailSrc: item.thumbnailSrc || getArlar23GalleryThumbnailSrc(item.src), alt: item.alt || item.label || `Congress gallery image ${index + 1}`, day: item.day || 1, order: item.order || index + 1, label: item.label || `Day ${item.day || 1}` }));
  const heroGalleryImage = visibleGalleryImages.find((image) => image.day === 2) || visibleGalleryImages[0];
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-[#071711] text-white">
        <Image
          src={heroGalleryImage?.thumbnailSrc || "/images/arlar23/congress-mark.png"}
          alt=""
          fill
          priority
          unoptimized={Boolean(heroGalleryImage?.thumbnailSrc?.startsWith("http://") || heroGalleryImage?.thumbnailSrc?.startsWith("https://"))}
          sizes="100vw"
          className="rtl-hero-mirror object-cover object-center opacity-30"
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[linear-gradient(90deg,rgba(5,17,13,0.98)_0%,rgba(5,17,13,0.91)_43%,rgba(5,17,13,0.58)_72%,rgba(75,4,25,0.52)_100%)]"
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(193,2,48,0.3),transparent_27%),radial-gradient(circle_at_82%_78%,rgba(0,149,59,0.2),transparent_34%)]"
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] opacity-20 [background-size:25px_25px] [mask-image:linear-gradient(90deg,black,transparent_78%)]"
        />

        <div className="relative mx-auto grid min-h-[31rem] max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.68fr] lg:items-center lg:py-16">
          <div>
            <nav
              aria-label={t("Breadcrumb")}
              className="flex flex-wrap items-center gap-2.5 font-display text-[13px] font-medium text-white/58"
            >
              <Link href={href("/")} className="transition-colors hover:text-white">
                {t("Home")}
              </Link>
              <span aria-hidden className="text-white/25">/</span>
              <span className="text-white/72">{t("Congresses")}</span>
              <span aria-hidden className="text-white/25">/</span>
              <span className="text-white/82">
                {lang === "ar" ? <>مؤتمر <bdi dir="ltr">ArLAR23</bdi> في الكويت</> : managedCongress.title}
              </span>
            </nav>

            <h1 className="mt-8 max-w-4xl font-display text-5xl font-semibold leading-[0.96] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              {lang === "ar" ? (
                <>مؤتمر <bdi dir="ltr">ArLAR23</bdi> في الكويت</>
              ) : (
                managedCongress.title
              )}
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-white/72 sm:text-[16px]">
              {t("Revisit the scientific programme, expert discussions, and specialist sessions from the ArLAR23 Kuwait Congress.")}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 font-display text-[12px] font-semibold text-white/90">
                <CalendarDays className="size-4 text-[#7de0aa]" />
                {t("2–4 March 2023")}
              </span>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 font-display text-[12px] font-semibold text-white/90">
                <MapPin className="size-4 text-[#7de0aa]" />
                {t(managedCongress.location)}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#replays"
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-crimson-600 px-5 font-display text-[13px] font-semibold text-white transition-colors hover:bg-crimson-700"
              >
                <Play className="size-4 fill-current" />
                {t("Browse all replays")}
                <ArrowRight className="rtl-flip size-4" />
              </Link>
              <Link
                href="#gallery"
                className="inline-flex min-h-12 items-center gap-3 rounded-full border border-white/25 bg-white/8 px-5 font-display text-[13px] font-semibold text-white transition-colors hover:bg-white/14"
              >
                {t("Congress gallery")}
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[30rem] lg:mr-0">
            <div className="rounded-[2rem] border border-white/15 bg-white/94 p-6 sm:p-8">
              <Image
                src={managedCongress.image || "/images/arlar23/congress-mark.png"}
                alt={managedCongress.title}
                width={798}
                height={144}
                className="h-auto w-full object-contain"
              />
              <div className="mt-7 grid grid-cols-3 border-t border-ink-100 pt-6 text-center">
                <div className="border-r border-ink-100 px-2">
                  <p className="font-display text-2xl font-semibold text-crimson-700">{visibleReplayVideos.length}</p>
                  <p className="mt-1 text-[9px] font-semibold tracking-[0.1em] text-ink-400 uppercase">{t("Replays")}</p>
                </div>
                <div className="border-r border-ink-100 px-2">
                  <p className="font-display text-2xl font-semibold text-jade-700">4</p>
                  <p className="mt-1 text-[9px] font-semibold tracking-[0.1em] text-ink-400 uppercase">{t("Days")}</p>
                </div>
                <div className="px-2">
                  <p className="font-display text-lg font-semibold text-ink-950">{t(managedCongress.location)}</p>
                  <p className="mt-1 text-[9px] font-semibold tracking-[0.1em] text-ink-400 uppercase">{t("Host")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-crimson-500 via-white/20 to-jade-400" />
      </section>

      <section className="bg-white py-12 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <div>
            <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-crimson-600 uppercase">
              {t("Congress overview")}
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
              {t("The ArLAR23 scientific programme, on demand.")}
            </h2>
          </div>
          <p className="text-[14px] leading-7 text-ink-600">
            {t("This archive brings together the playable sessions and workshops published from the four-day congress, making it easy to catch up on a missed session or return to a discussion at any time.")}
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6">
          {[
            { icon: Video, value: String(visibleReplayVideos.length), label: "Available replay entries" },
            { icon: Users, value: "Adult & pediatric", label: "Scientific programmes" },
            { icon: CalendarDays, value: "4 congress days", label: "Filterable archive" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 rounded-[1.35rem] border border-ink-100 bg-white p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-crimson-50 text-crimson-700">
                <item.icon className="size-5" />
              </span>
              <div>
                <p className="font-display text-[16px] font-semibold text-ink-950">{t(item.value)}</p>
                <p className="mt-1 text-[11px] text-ink-500">{t(item.label)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f5f8f6] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Arlar23ReplayLibrary videos={visibleReplayVideos} />
        </div>
      </section>

      <section id="gallery" className="scroll-mt-24 bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-crimson-600 uppercase">
                {t("Congress moments")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
                {t("Four days in Kuwait")}
              </h2>
            </div>
            <p className="max-w-md text-[13px] leading-6 text-ink-500">
              {t("The complete gallery from all four days. Select any image to open the full-screen viewer.")}
            </p>
          </div>
          <div className="mt-8">
            <Arlar23Gallery images={visibleGalleryImages} />
          </div>
        </div>
      </section>
    </main>
  );
}
