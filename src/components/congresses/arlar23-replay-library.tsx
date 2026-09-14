"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

import {
  CalendarDays,
  Close,
  MapPin,
  Play,
  Search,
  Users,
  Video,
} from "@/components/icons";
import {
  ExpandIcon,
  ImageLightbox,
  type LightboxImage,
} from "@/components/news/image-lightbox";
import { CustomSelect } from "@/components/ui/custom-select";
import { useTranslations } from "@/i18n/locale-context";
import type { Locale } from "@/i18n/config";
import { formatDoctorName } from "@/lib/doctor-name";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

export type Arlar23Replay = {
  order: number;
  day: number;
  date: string;
  dateLabel: string;
  program: string;
  room: string;
  title: string;
  speakers: string[];
  youtubeId: string;
};

export type Arlar23GalleryImage = LightboxImage & {
  day: number;
  /** Position within the day; the alt text is rebuilt from this per locale. */
  order: number;
  label: string;
  thumbnailSrc: string;
};

const PAGE_SIZE = 12;
const GALLERY_PAGE_SIZE = 24;

function formatCongressDate(date: string, locale: Locale) {
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00Z` : date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(
    locale === "ar" ? "ar-JO" : locale === "fr" ? "fr-FR" : "en-GB",
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
  ).format(parsed);
}

export function Arlar23ReplayLibrary({ videos }: { videos: Arlar23Replay[] }) {
  const { locale, t } = useTranslations();
  const [query, setQuery] = useState("");
  const [activeDate, setActiveDate] = useState("all");
  const [activeProgram, setActiveProgram] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<Arlar23Replay | null>(null);
  const libraryTopRef = useRef<HTMLDivElement>(null);

  const dateOptions = useMemo(
    () => [
      { value: "all", label: t("All congress dates"), meta: `${videos.length} ${t("replays")}` },
      ...Array.from(
        new Map(
          videos.map((video) => [
            video.date,
            {
              value: video.date,
              label: formatCongressDate(video.date, locale),
              meta: `${t("Day")} ${video.day} · ${videos.filter((item) => item.date === video.date).length} ${t("replays")}`,
            },
          ]),
        ).values(),
      ),
    ],
    [locale, t, videos],
  );

  const programOptions = useMemo(
    () => [
      { value: "all", label: t("Every programme") },
      ...Array.from(new Set(videos.map((video) => video.program))).map(
        (program) => ({
          value: program,
          label: t(program),
          meta: `${videos.filter((video) => video.program === program).length} ${t("replays")}`,
        }),
      ),
    ],
    [t, videos],
  );

  const filteredVideos = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return videos.filter((video) => {
      const matchesDate = activeDate === "all" || video.date === activeDate;
      const matchesProgram =
        activeProgram === "all" || video.program === activeProgram;
      const matchesQuery =
        !normalizedQuery ||
        [video.title, video.program, video.room, ...video.speakers].some(
          (value) => value.toLocaleLowerCase().includes(normalizedQuery),
        );

      return matchesDate && matchesProgram && matchesQuery;
    });
  }, [activeDate, activeProgram, query, videos]);

  const pageCount = Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE));
  const visibleVideos = filteredVideos.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const resetPage = () => setCurrentPage(1);
  const changePage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), pageCount));
    requestAnimationFrame(() =>
      libraryTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  return (
    <>
      <section id="replays" ref={libraryTopRef} className="scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-crimson-600 uppercase">
              {t("Complete replay archive")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
              {t("Every available session across four days")}
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-7 text-ink-500">
              {t("Browse the ArLAR23 scientific programme by congress day, programme, session, or speaker.")}
            </p>
          </div>
          <div className="flex items-end gap-3 border-l border-ink-200 pl-5">
            <span className="font-display text-4xl font-semibold leading-none tracking-[-0.05em] text-crimson-700">
              {videos.length}
            </span>
            <span className="pb-0.5 font-display text-[9px] font-semibold leading-4 tracking-[0.12em] text-ink-400 uppercase">
              {t("replay entries")}
            </span>
          </div>
        </div>

        <div className="mt-7 rounded-[1.75rem] border border-ink-200 bg-white p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.65fr_0.85fr]">
            <label className="relative block">
              <span className="mb-2 block font-display text-[10px] font-semibold tracking-[0.14em] text-ink-400 uppercase">{t("Search")}</span>
              <Search
                className={`pointer-events-none absolute bottom-4 size-4 text-crimson-600 ${
                  locale === "ar" ? "right-4" : "left-4"
                }`}
              />
              <input
                type="search"
                dir="ltr"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetPage();
                }}
                placeholder={locale === "ar" ? "Session, speaker, or programme…" : t("Session, speaker, or programme…")}
                className={`h-12 w-full rounded-2xl border border-ink-200 bg-white text-left text-[13px] text-ink-900 outline-2 outline-transparent transition-[border-color,outline-color] placeholder:text-ink-400 hover:border-ink-300 focus:border-crimson-500 focus:outline-crimson-200 ${
                  locale === "ar" ? "pl-4 pr-11" : "pl-11 pr-11"
                }`}
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    resetPage();
                  }}
                  aria-label={t("Clear search")}
                  className={`absolute bottom-2.5 grid size-7 cursor-pointer place-items-center rounded-full text-ink-400 transition-colors hover:bg-crimson-50 hover:text-crimson-700 ${
                    locale === "ar" ? "left-2.5" : "right-2.5"
                  }`}
                >
                  <Close className="size-3.5" />
                </button>
              ) : null}
            </label>

            <CustomSelect
              label={t("Congress date")}
              value={activeDate}
              options={dateOptions}
              onChange={(value) => {
                setActiveDate(value);
                resetPage();
              }}
              tone="crimson"
            />

            <CustomSelect
              label={t("Scientific programme")}
              value={activeProgram}
              options={programOptions}
              onChange={(value) => {
                setActiveProgram(value);
                resetPage();
              }}
              tone="crimson"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
            <p className="text-[12px] text-ink-500">
              {t("Showing")} <span className="font-semibold text-ink-900">{filteredVideos.length}</span>{" "}
              {t(filteredVideos.length === 1 ? "recording" : "recordings")}
            </p>
            {activeDate !== "all" || activeProgram !== "all" || query ? (
              <button
                type="button"
                onClick={() => {
                  setActiveDate("all");
                  setActiveProgram("all");
                  setQuery("");
                  resetPage();
                }}
                className="cursor-pointer font-display text-[11px] font-semibold text-crimson-700 transition-colors hover:text-crimson-900"
              >
                {t("Reset filters")}
              </button>
            ) : null}
          </div>
        </div>

        {visibleVideos.length ? (
          <div className="mt-7 grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleVideos.map((video) => (
              <ReplayCard
                key={video.order}
                video={video}
                onOpen={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-7 grid min-h-64 place-items-center rounded-[1.75rem] border border-dashed border-ink-200 bg-white px-6 text-center">
            <div>
              <Video className="mx-auto size-7 text-crimson-500" />
              <p className="mt-4 font-display text-lg font-semibold text-ink-900">
                {t("No recordings found")}
              </p>
              <p className="mt-2 text-[13px] text-ink-500">
                {t("Try another day, programme, session, or speaker.")}
              </p>
            </div>
          </div>
        )}

        {filteredVideos.length > PAGE_SIZE ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-ink-200 pt-6">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => changePage(currentPage - 1)}
              className="min-h-10 cursor-pointer rounded-full border border-crimson-200 bg-white px-5 font-display text-[12px] font-semibold text-crimson-700 transition-colors hover:bg-crimson-50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {t("Previous")}
            </button>
            <p className="font-display text-[12px] font-semibold text-ink-500">
              {t("Page")} <span className="text-ink-950">{currentPage}</span> {t("of")} {pageCount}
            </p>
            <button
              type="button"
              disabled={currentPage === pageCount}
              onClick={() => changePage(currentPage + 1)}
              className="min-h-10 cursor-pointer rounded-full border border-crimson-200 bg-white px-5 font-display text-[12px] font-semibold text-crimson-700 transition-colors hover:bg-crimson-50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {t("Next")}
            </button>
          </div>
        ) : null}
      </section>

      {selectedVideo ? (
        <ReplayModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      ) : null}
    </>
  );
}

function ReplayCard({ video, onOpen }: { video: Arlar23Replay; onOpen: () => void }) {
  const { locale, t } = useTranslations();
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-ink-100 bg-white transition-[transform,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-crimson-300">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${t("Play")} ${video.title}`}
        className="flex w-full cursor-pointer flex-col text-left"
      >
        <span className="relative block aspect-video overflow-hidden bg-[#061813]">
          <Image
            src={`/images/arlar23/videos/${video.youtubeId}.jpg`}
            alt=""
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 92vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
          <span className="absolute inset-0 bg-linear-to-t from-[#081612]/72 via-transparent to-transparent" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-14 place-items-center rounded-full border-2 border-white/85 bg-crimson-700/82 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
              <Play className="ml-0.5 size-5 fill-current" />
            </span>
          </span>
        </span>

        <span className="flex flex-col p-5">
          <time
            dateTime={video.date}
            className="flex items-center gap-1.5 font-display text-[10px] font-semibold tracking-[0.1em] text-crimson-700 uppercase"
          >
            <CalendarDays className="size-4" />
            {formatCongressDate(video.date, locale)}
          </time>
          <span className="mt-3 font-display text-[10px] font-semibold leading-4 tracking-[0.11em] text-ink-400 uppercase">
            {t(video.program)}{video.room ? ` · ${t(video.room)}` : ""}
          </span>
          <span className="mt-2 font-display text-[18px] font-semibold leading-6 text-ink-950">
            {video.title}
          </span>
          {video.speakers.length ? (
            <span className="mt-5 flex items-start gap-2 text-[14px] leading-6 text-ink-500">
              <Users className="mt-1 size-4 shrink-0 text-jade-700" />
              <span>{video.speakers.map(formatDoctorName).join(", ")}</span>
            </span>
          ) : null}
          <span className="replay-card-action mt-4 inline-flex items-center gap-2 border-t border-ink-100 pt-4 font-display text-[14px] font-semibold text-crimson-700">
            <Play className="size-4 fill-current" />
            {t("Play replay")}
          </span>
        </span>
      </button>
    </article>
  );
}

function ReplayModal({ video, onClose }: { video: Arlar23Replay; onClose: () => void }) {
  const { locale, t } = useTranslations();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useModalAccessibility<HTMLDivElement>({ onClose, initialFocusRef: closeButtonRef });

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-ink-950/90 p-3 backdrop-blur-[4px] sm:p-7"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="arlar23-replay-title"
        className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white sm:max-h-[calc(100dvh-3.5rem)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t("Close video")}
          className="absolute right-4 top-4 z-20 grid size-11 cursor-pointer place-items-center rounded-full bg-black/70 text-white transition-colors hover:bg-crimson-700"
        >
          <Close className="size-4" />
        </button>

        <div className="aspect-video w-full overflow-hidden rounded-t-[2rem] bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            className="size-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-3 font-display text-[11px] font-semibold text-crimson-700">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {formatCongressDate(video.date, locale)}
            </span>
            {video.room ? (
              <span className="inline-flex items-center gap-1.5 text-ink-500">
                <MapPin className="size-3.5" />
                {t(video.room)}
              </span>
            ) : null}
          </div>
          <p className="mt-3 font-display text-[10px] font-semibold tracking-[0.11em] text-ink-400 uppercase">
            {t(video.program)}
          </p>
          <h3
            id="arlar23-replay-title"
            className="mt-2 max-w-4xl font-display text-2xl font-semibold leading-8 tracking-[-0.025em] text-ink-950"
          >
            {video.title}
          </h3>
          {video.speakers.length ? (
            <p className="mt-4 flex items-start gap-2 text-[14px] leading-6 text-ink-500">
              <Users className="mt-1 size-4 shrink-0 text-jade-700" />
              {video.speakers.map(formatDoctorName).join(", ")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function Arlar23Gallery({ images }: { images: Arlar23GalleryImage[] }) {
  const { t } = useTranslations();
  const [activeDay, setActiveDay] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(GALLERY_PAGE_SIZE);
  const dayOptions = useMemo(
    () => [
      { day: 0, label: t("All days"), count: images.length },
      ...[1, 2, 3, 4].map((day) => ({
        day,
        label: `${t("Day")} ${day}`,
        count: images.filter((photo) => photo.day === day).length,
      })),
    ],
    [images, t],
  );
  const filteredImages = useMemo(
    () => images.filter((photo) => activeDay === 0 || photo.day === activeDay),
    [activeDay, images],
  );
  // Built from parts rather than translating the whole generated sentence:
  // there is one alt per photograph, so the phrase table would otherwise need
  // hundreds of near-identical entries.
  const localizedImages = useMemo(
    () =>
      filteredImages.map((photo) => ({
        ...photo,
        alt: `${t("ArLAR23 Kuwait Congress gallery")}, ${t("Day")} ${photo.day}, ${t("photo")} ${photo.order}`,
        label: `${t("Day")} ${photo.day}`,
      })),
    [filteredImages, t],
  );
  const visibleImages = localizedImages.slice(0, visibleCount);

  return (
    <>
      <div className="flex flex-wrap gap-2 border-b border-ink-100 pb-5" aria-label={t("Filter photos by congress day")}>
        {dayOptions.map((option) => (
          <button
            key={option.day}
            type="button"
            aria-pressed={activeDay === option.day}
            onClick={() => {
              setActiveDay(option.day);
              setActiveIndex(null);
              setVisibleCount(GALLERY_PAGE_SIZE);
            }}
            className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 font-display text-[11px] font-semibold transition-[border-color,background-color,color] duration-300 ${
              activeDay === option.day
                ? "border-crimson-700 bg-crimson-700 text-white"
                : "border-ink-200 bg-white text-ink-600 hover:border-crimson-300 hover:text-crimson-700"
            }`}
          >
            {option.label}
            <span className={activeDay === option.day ? "text-white/65" : "text-ink-400"}>
              {option.count}
            </span>
          </button>
        ))}
      </div>

      <p aria-live="polite" className="mt-4 font-display text-[11px] text-ink-400">
        {t("Showing")} <strong className="font-semibold text-ink-700">{visibleImages.length}</strong> {t("of")} {filteredImages.length} {t("photos")}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleImages.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`${t("Expand")} ${photo.alt}`}
            className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-[1.5rem] border border-ink-100 bg-ink-100 text-left transition-colors duration-300 hover:border-crimson-300"
          >
            <Image
              src={photo.thumbnailSrc || photo.src}
              alt={photo.alt || ""}
              fill
              unoptimized={(photo.thumbnailSrc || photo.src).startsWith("http://") || (photo.thumbnailSrc || photo.src).startsWith("https://")}
              sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 94vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            />
            <span className="absolute inset-0 bg-linear-to-t from-black/56 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1.5 font-display text-[10px] font-semibold text-ink-900">
              {photo.label}
            </span>
            <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/92 text-ink-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ExpandIcon />
            </span>
          </button>
        ))}
      </div>

      {visibleImages.length < filteredImages.length ? (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + GALLERY_PAGE_SIZE)}
            className="min-h-11 cursor-pointer rounded-full bg-ink-950 px-6 font-display text-[12px] font-semibold text-white transition-colors hover:bg-crimson-700"
          >
            {t("Load more photos")}
          </button>
        </div>
      ) : null}

      {activeIndex !== null ? (
        <ImageLightbox
          images={localizedImages}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onIndex={setActiveIndex}
        />
      ) : null}
    </>
  );
}
