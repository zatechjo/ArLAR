"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

import {
  CalendarDays,
  Close,
  Play,
  Search,
  Users,
  Video,
} from "@/components/icons";
import { CustomSelect } from "@/components/ui/custom-select";
import type { Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/locale-context";
import { formatDoctorName } from "@/lib/doctor-name";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

export type Arlar21Replay = {
  order: number;
  speaker: string;
  title: string;
  track: string;
  date: string;
  dateLabel: string;
  youtubeId: string;
  duration: string;
};

type ReplayLibraryProps = {
  videos: Arlar21Replay[];
};

const PAGE_SIZE = 12;

function formatCongressDate(date: string, locale: Locale) {
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00Z` : date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(
    locale === "ar" ? "ar-JO" : locale === "fr" ? "fr-FR" : "en-GB",
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
  ).format(parsed);
}

export function Arlar21ReplayLibrary({ videos }: ReplayLibraryProps) {
  const { locale, t } = useTranslations();
  const [query, setQuery] = useState("");
  const [activeDate, setActiveDate] = useState("all");
  const [activeTrack, setActiveTrack] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<Arlar21Replay | null>(
    null,
  );
  const libraryTopRef = useRef<HTMLDivElement>(null);

  const dateOptions = useMemo(
    () => [
      { value: "all", label: t("All congress dates") },
      ...Array.from(
        new Map(
          videos.map((video) => [
            video.date,
            { value: video.date, label: formatCongressDate(video.date, locale) },
          ]),
        ).values(),
      ),
    ],
    [locale, t, videos],
  );

  const trackOptions = useMemo(
    () => [
      { value: "all", label: t("All scientific tracks") },
      ...Array.from(new Set(videos.map((video) => video.track))).map(
        (track) => ({
          value: track,
          label: track,
          meta: `${videos.filter((video) => video.track === track).length} ${t("recordings")}`,
        }),
      ),
    ],
    [t, videos],
  );

  const filteredVideos = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return videos.filter((video) => {
      const matchesDate = activeDate === "all" || video.date === activeDate;
      const matchesTrack =
        activeTrack === "all" || video.track === activeTrack;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [video.title, video.speaker, video.track].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        );

      return matchesDate && matchesTrack && matchesQuery;
    });
  }, [activeDate, activeTrack, query, videos]);

  const pageCount = Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE));
  const visibleVideos = filteredVideos.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const changePage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), pageCount));
    requestAnimationFrame(() => {
      libraryTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <>
      <section id="replays" ref={libraryTopRef} className="scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-[#7a2aad] uppercase">
              {t("Congress replay archive")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
              {t("Watch ArLAR21 on demand")}
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-7 text-ink-500">
              {t("Search all 80 congress recordings by lecture, speaker, or scientific track.")}
            </p>
          </div>
          <div className="flex items-end gap-3 border-l border-[#d9cae5] pl-5">
            <span className="font-display text-4xl font-semibold leading-none tracking-[-0.05em] text-[#5a197e]">
              26h
            </span>
            <span className="pb-0.5 font-display text-[9px] font-semibold leading-4 tracking-[0.12em] text-ink-400 uppercase">
              {t("57m of education")}
            </span>
          </div>
        </div>

        <div className="mt-7 rounded-[1.75rem] border border-[#ded3e8] bg-white p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.65fr_0.85fr]">
            <label className="relative block">
              <span className="mb-2 block font-display text-[10px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
                {t("Search")}
              </span>
              <Search
                className={`pointer-events-none absolute bottom-4 size-4 text-[#7a2aad] ${
                  locale === "ar" ? "right-4" : "left-4"
                }`}
              />
              <input
                type="search"
                dir="ltr"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder={locale === "ar" ? "Lecture, speaker, or track…" : t("Lecture, speaker, or track…")}
                className={`h-12 w-full rounded-2xl border border-ink-200 bg-white text-left text-[13px] text-ink-900 outline-2 outline-transparent transition-[border-color,outline-color] placeholder:text-ink-400 hover:border-ink-300 focus:border-[#9c69b8] focus:outline-[#c9a9dc] ${
                  locale === "ar" ? "pl-4 pr-11" : "pl-11 pr-11"
                }`}
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCurrentPage(1);
                  }}
                  aria-label={t("Clear search")}
                  className={`absolute bottom-2.5 grid size-7 cursor-pointer place-items-center rounded-full text-ink-400 transition-colors hover:bg-[#eee5f3] hover:text-[#5a197e] ${
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
                setCurrentPage(1);
              }}
              tone="purple"
            />

            <CustomSelect
              label={t("Scientific track")}
              value={activeTrack}
              options={trackOptions}
              onChange={(value) => {
                setActiveTrack(value);
                setCurrentPage(1);
              }}
              tone="purple"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
            <p className="text-[12px] text-ink-500">
              <span className="font-semibold text-ink-900">
                {filteredVideos.length}
              </span>{" "}
              {t(filteredVideos.length === 1 ? "recording" : "recordings")}
            </p>
            {activeDate !== "all" || activeTrack !== "all" || query ? (
              <button
                type="button"
                onClick={() => {
                  setActiveTrack("all");
                  setActiveDate("all");
                  setQuery("");
                  setCurrentPage(1);
                }}
                className="cursor-pointer font-display text-[11px] font-semibold text-[#7a2aad] transition-colors hover:text-[#4b1468]"
              >
                {t("Reset filters")}
              </button>
            ) : null}
          </div>
        </div>

        {visibleVideos.length > 0 ? (
          <div className="mt-7 grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleVideos.map((video) => (
              <ReplayCard
                key={video.youtubeId}
                video={video}
                onOpen={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-7 grid min-h-64 place-items-center rounded-[1.75rem] border border-dashed border-[#d9cae5] bg-white px-6 text-center">
            <div>
              <Video className="mx-auto size-7 text-[#8f61aa]" />
              <p className="mt-4 font-display text-lg font-semibold text-ink-900">
                {t("No recordings found")}
              </p>
              <p className="mt-2 text-[13px] text-ink-500">
                {t("Try a different speaker, topic, or scientific track.")}
              </p>
            </div>
          </div>
        )}

        {filteredVideos.length > PAGE_SIZE ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-[#ded3e8] pt-6">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => changePage(currentPage - 1)}
              className="min-h-10 cursor-pointer rounded-full border border-[#d4c1e0] bg-white px-5 font-display text-[12px] font-semibold text-[#5a197e] transition-colors hover:bg-[#f2eaf6] disabled:cursor-not-allowed disabled:opacity-35"
            >
              {t("Previous")}
            </button>
            <p className="font-display text-[12px] font-semibold text-ink-500">
              {t("Page")} <span className="text-ink-950">{currentPage}</span> {t("of")}{" "}
              {pageCount}
            </p>
            <button
              type="button"
              disabled={currentPage === pageCount}
              onClick={() => changePage(currentPage + 1)}
              className="min-h-10 cursor-pointer rounded-full border border-[#d4c1e0] bg-white px-5 font-display text-[12px] font-semibold text-[#5a197e] transition-colors hover:bg-[#f2eaf6] disabled:cursor-not-allowed disabled:opacity-35"
            >
              {t("Next")}
            </button>
          </div>
        ) : null}
      </section>

      {selectedVideo ? (
        <ReplayModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      ) : null}
    </>
  );
}

function ReplayCard({
  video,
  onOpen,
}: {
  video: Arlar21Replay;
  onOpen: () => void;
}) {
  const { locale, t } = useTranslations();
  const thumbnail = `/images/arlar21/videos/${String(video.order).padStart(3, "0")}-${video.youtubeId}.jpg`;

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-ink-100 bg-white transition-[transform,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-[#b990ce]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${t("Play")} ${video.title}`}
        className="flex w-full cursor-pointer flex-col text-left"
      >
        <span className="relative block aspect-video overflow-hidden bg-[#160726]">
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 92vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
          <span className="absolute inset-0 bg-linear-to-t from-[#170624]/70 via-transparent to-transparent" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-14 place-items-center rounded-full border-2 border-white/85 bg-[#2b0a49]/72 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 size-5 fill-current" />
            </span>
          </span>
          <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 font-display text-[10px] font-semibold text-white">
            {video.duration}
          </span>
        </span>

        <span className="flex flex-col p-5">
          <time
            dateTime={video.date}
            className="flex items-center gap-1.5 font-display text-[10px] font-semibold tracking-[0.1em] text-[#7a2aad] uppercase"
          >
            <CalendarDays className="size-3.5" />
            {formatCongressDate(video.date, locale)}
          </time>
          <span className="mt-2 font-display text-[10px] font-semibold leading-5 tracking-[0.11em] text-ink-400 uppercase">
            {video.track}
          </span>
          <span className="mt-2 font-display text-[17px] font-semibold leading-6 text-ink-950">
            {video.title}
          </span>
          {video.speaker ? (
            <span className="mt-5 flex items-start gap-2 text-[14px] leading-5 text-ink-500">
              <Users className="mt-0.5 size-4 shrink-0 text-[#7a2aad]" />
              {formatDoctorName(video.speaker)}
            </span>
          ) : null}
          <span className="replay-card-action mt-4 inline-flex items-center gap-2 border-t border-ink-100 pt-4 font-display text-[14px] font-semibold text-[#5a197e]">
            <Play className="size-4 fill-current" />
            {t("Play recording")}
          </span>
        </span>
      </button>
    </article>
  );
}

function ReplayModal({
  video,
  onClose,
}: {
  video: Arlar21Replay;
  onClose: () => void;
}) {
  const { locale, t } = useTranslations();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useModalAccessibility<HTMLDivElement>({ onClose, initialFocusRef: closeButtonRef });

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-[#0b0312]/88 p-3 backdrop-blur-[4px] sm:p-7"
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
        aria-labelledby="arlar21-replay-title"
        className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white sm:max-h-[calc(100dvh-3.5rem)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t("Close video")}
          className="absolute right-4 top-4 z-20 grid size-11 cursor-pointer place-items-center rounded-full bg-black/65 text-white transition-colors hover:bg-[#6c238f]"
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
          <div className="flex flex-wrap items-center gap-3 font-display text-[10px] font-semibold tracking-[0.1em] text-[#7a2aad] uppercase">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {formatCongressDate(video.date, locale)}
            </span>
            <span aria-hidden className="text-ink-200">
              /
            </span>
            <span>{video.duration}</span>
          </div>
          <h3
            id="arlar21-replay-title"
            className="mt-3 max-w-4xl font-display text-2xl font-semibold leading-8 tracking-[-0.025em] text-ink-950"
          >
            {video.title}
          </h3>
          {video.speaker ? (
            <p className="mt-4 flex items-center gap-2 text-[14px] text-ink-500">
              <Users className="size-4 text-[#7a2aad]" />
              {formatDoctorName(video.speaker)}
            </p>
          ) : null}
          <p className="mt-3 text-[12px] leading-5 text-ink-400">
            {video.track}
          </p>
        </div>
      </div>
    </div>
  );
}
