"use client";

import { useMemo, useRef, useState } from "react";

import {
  CalendarDays,
  Close,
  ExternalLink,
  Play,
  Search,
  Users,
  Video,
} from "@/components/icons";
import {
  arabicAaaaEventDate,
  arabicAaaaEventHeading,
  arabicAaaaVideoTitle,
} from "@/data/aaaa-arabic";
import type archive from "@/data/aaaa-video-library.json";
import { useTranslations } from "@/i18n/locale-context";
import { formatDoctorNameList } from "@/lib/doctor-name";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

type ArchiveVideo = (typeof archive.videos)[number];
type ArchiveEvent = (typeof archive.events)[number];
type VideoType = "all" | "session" | "qa";

function youtubeId(videoUrl: string) {
  return videoUrl.match(/[?&]v=([^&]+)/)?.[1] ?? "";
}

function youtubeEmbedUrl(video: ArchiveVideo) {
  const id = youtubeId(video.videoUrl);
  const start = video.startSeconds > 0 ? "&start=" + video.startSeconds : "";
  return (
    "https://www.youtube-nocookie.com/embed/" +
    id +
    "?autoplay=1&rel=0" +
    start
  );
}

function youtubeWatchUrl(video: ArchiveVideo) {
  const start = video.startSeconds > 0 ? "&t=" + video.startSeconds + "s" : "";
  return video.videoUrl + start;
}

export function AaaaWebinarLibrary({ archiveData }: { archiveData: typeof archive }) {
  const { locale, t } = useTranslations();
  const years = useMemo(() => [...new Set(archiveData.events.map((event) => event.year))].sort((a, b) => b - a), [archiveData.events]);
  const eventsByDate = useMemo(() => new Map(archiveData.events.map((event) => [event.date, event])), [archiveData.events]);
  const [activeYear, setActiveYear] = useState<number>(years[0] || new Date().getFullYear());
  const [activeEvent, setActiveEvent] = useState("all");
  const [activeType, setActiveType] = useState<VideoType>("all");
  const [query, setQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<ArchiveVideo | null>(null);

  const yearEvents = useMemo(
    () => archiveData.events.filter((event) => event.year === activeYear),
    [activeYear, archiveData.events],
  );

  const filteredVideos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return archiveData.videos.filter((video) => {
      if (video.year !== activeYear) return false;
      if (activeEvent !== "all" && video.eventDate !== activeEvent) return false;
      if (activeType !== "all" && video.type !== activeType) return false;
      if (!normalizedQuery) return true;

      const event = eventsByDate.get(video.eventDate);
      const searchableText = [
        video.title,
        locale === "ar" ? arabicAaaaVideoTitle(video) : "",
        video.speakers.join(" "),
        event?.heading ?? "",
        event && locale === "ar" ? arabicAaaaEventHeading(event) : "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [activeEvent, activeType, activeYear, archiveData.videos, eventsByDate, locale, query]);

  const visibleGroups = yearEvents
    .map((event) => ({
      event,
      videos: filteredVideos.filter(
        (video) => video.eventDate === event.date,
      ),
    }))
    .filter((group) => group.videos.length > 0);

  const changeYear = (year: number) => {
    setActiveYear(year);
    setActiveEvent("all");
  };

  return (
    <div className="mt-7">
      <div className="rounded-[1.75rem] border border-ink-100 bg-white p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="flex min-h-12 items-center gap-3 rounded-2xl bg-[#f4f7f6] px-4 transition-[background-color,box-shadow] focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(0,149,59,0.18)]">
            <Search className="size-4 shrink-0 text-ink-400" />
            <span className="sr-only">{t("Search webinar videos")}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("Search a topic or speaker…")}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-ink-900 outline-none placeholder:text-ink-400"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t("Clear search")}
                className="grid size-7 cursor-pointer place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-800"
              >
                <Close className="size-3.5" />
              </button>
            ) : null}
          </label>

          <div className="flex min-h-12 items-center gap-1 rounded-2xl bg-[#f4f7f6] p-1">
            {(["all", "session", "qa"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                aria-pressed={activeType === type}
                className={
                  "min-h-10 cursor-pointer rounded-xl px-3.5 font-display text-[11px] font-semibold transition-colors " +
                  (activeType === type
                    ? "bg-white text-ink-950"
                    : "text-ink-500 hover:text-ink-900")
                }
              >
                {type === "all"
                  ? t("All videos")
                  : type === "session"
                    ? t("Sessions")
                    : t("Q&A")}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-ink-100 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 font-display text-[9px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
              {t("Year")}
            </span>
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => changeYear(year)}
                aria-pressed={activeYear === year}
                className={
                  "min-h-9 cursor-pointer rounded-full px-4 font-display text-[12px] font-semibold transition-[background-color,color,transform] " +
                  (activeYear === year
                    ? "bg-ink-950 text-white"
                    : "border border-ink-100 bg-white text-ink-500 hover:border-crimson-200 hover:text-crimson-700")
                }
              >
                {year}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <EventPill
              active={activeEvent === "all"}
              onClick={() => setActiveEvent("all")}
            >
              {t("All")} {activeYear} {t("webinars")}
            </EventPill>
            {yearEvents.map((event) => (
              <EventPill
                key={event.date}
                active={activeEvent === event.date}
                onClick={() => setActiveEvent(event.date)}
              >
                {locale === "ar" ? arabicAaaaEventDate(event) : event.dateDisplay}
                <span
                  className={
                    activeEvent === event.date
                      ? "text-white/55"
                      : "text-ink-300"
                  }
                >
                  {event.videoCount}
                </span>
              </EventPill>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-[10px] font-semibold tracking-[0.16em] text-crimson-600 uppercase">
            {t("Video archive")}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.025em] text-ink-950">
            {filteredVideos.length}{" "}
            {t(filteredVideos.length === 1 ? "recording" : "recordings")} {t("from")} {" "}
            {activeYear}
          </h3>
        </div>
        <p className="max-w-md text-[12px] leading-6 text-ink-400">
          {t("Choose a webinar date or search the complete year by lecture topic and speaker.")}
        </p>
      </div>

      {visibleGroups.length > 0 ? (
        <div className="mt-8 grid gap-11">
          {visibleGroups.map(({ event, videos }) => (
            <WebinarGroup
              key={event.date}
              event={event}
              videos={videos}
              onOpen={setActiveVideo}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid min-h-64 place-items-center rounded-[1.75rem] border border-dashed border-ink-200 bg-white px-6 text-center">
          <div>
            <Video className="mx-auto size-7 text-ink-300" />
            <p className="mt-4 font-display text-[15px] font-semibold text-ink-700">
              {t("No matching recordings")}
            </p>
            <p className="mt-1 text-[13px] text-ink-400">
              {t("Try another search, date, or video type.")}
            </p>
          </div>
        </div>
      )}

      {activeVideo ? (
        <VideoModal
          video={activeVideo}
          event={eventsByDate.get(activeVideo.eventDate)}
          onClose={() => setActiveVideo(null)}
        />
      ) : null}
    </div>
  );
}

function EventPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full px-3.5 font-display text-[11px] font-semibold transition-colors " +
        (active
          ? "bg-jade-700 text-white"
          : "bg-jade-50/75 text-jade-800 hover:bg-jade-100")
      }
    >
      {children}
    </button>
  );
}

function WebinarGroup({
  event,
  videos,
  onOpen,
}: {
  event: ArchiveEvent;
  videos: ArchiveVideo[];
  onOpen: (video: ArchiveVideo) => void;
}) {
  const { locale, t } = useTranslations();
  return (
    <section>
      <div className="mb-6 border-b border-ink-100 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-crimson-50 px-4 py-3 text-crimson-700">
            <CalendarDays className="size-5 shrink-0" />
          <time
            dateTime={event.date}
            className="block font-display text-[21px] font-semibold leading-7 text-crimson-700 sm:text-[23px]"
          >
            {locale === "ar" ? arabicAaaaEventDate(event) : event.dateDisplay}
          </time>
          </div>
          <span className="w-fit rounded-full bg-white px-3 py-1.5 font-display text-[10px] font-semibold text-ink-400 ring-1 ring-ink-100">
            {videos.length} {t(videos.length === 1 ? "video" : "videos")}
          </span>
        </div>
        <h4 className="mt-5 max-w-5xl font-display text-[18px] font-semibold leading-7 text-ink-950 sm:text-[20px]">
          {locale === "ar" ? arabicAaaaEventHeading(event) : event.heading}
        </h4>
      </div>

      <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onOpen={() => onOpen(video)} />
        ))}
      </div>
    </section>
  );
}

function VideoCard({
  video,
  onOpen,
}: {
  video: ArchiveVideo;
  onOpen: () => void;
}) {
  const { locale, t } = useTranslations();
  const title = locale === "ar" ? arabicAaaaVideoTitle(video) : video.title;
  const id = youtubeId(video.videoUrl);

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-ink-100 bg-white text-ink-950 transition-[transform,translate,scale,border-color,box-shadow] duration-[650ms] ease-in-out hover:-translate-y-2 hover:scale-[1.01] hover:border-crimson-200 hover:shadow-xl hover:shadow-ink-950/7">
      <button
        type="button"
        onClick={onOpen}
        aria-label={t("Play") + ": " + title}
        className="flex w-full cursor-pointer flex-col text-start"
      >
        <span className="relative block aspect-video overflow-hidden bg-ink-950">
          <span
            aria-hidden
            style={{
              backgroundImage:
                "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)",
            }}
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-black/65 via-black/5 to-black/10"
          />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-14 place-items-center rounded-full bg-white/12 text-white ring-2 ring-white/85 backdrop-blur-sm transition-[transform,background-color] duration-300 group-hover:scale-110 group-hover:bg-white/22">
              <Play className="ml-0.5 size-5 fill-current" />
            </span>
          </span>
          <span
            className={
              "absolute bottom-3 left-3 rounded-full px-2.5 py-1 font-display text-[9px] font-semibold tracking-[0.11em] uppercase backdrop-blur " +
              (video.type === "qa"
                ? "bg-jade-600/92 text-white"
                : "bg-crimson-600/92 text-white")
            }
          >
            {t(video.type === "qa" ? "Questions & answers" : "Session")}
          </span>
          <span className="absolute bottom-3 right-3 font-display text-[10px] font-semibold text-white/72">
            {String(video.orderInEvent).padStart(2, "0")}
          </span>
        </span>

        <span className="flex flex-col p-5">
          <span className="overflow-hidden font-display text-[16px] font-semibold leading-6 text-ink-950 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {title}
          </span>
          {video.speakers.length > 0 ? (
            <span className="mt-5 flex items-start gap-2 text-[14px] leading-5 text-ink-500">
              <Users className="mt-0.5 size-4 shrink-0 text-jade-700" />
              <span className="overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {video.speakers.map((speaker) => formatDoctorNameList(speaker)).join(", ")}
              </span>
            </span>
          ) : null}
          <span className="replay-card-action mt-4 inline-flex items-center gap-2 border-t border-ink-100 pt-4 font-display text-[14px] font-semibold text-jade-700">
            <Play className="size-4 fill-current" />
            {t("Play video")}
          </span>
        </span>
      </button>
    </article>
  );
}

function VideoModal({
  video,
  event,
  onClose,
}: {
  video: ArchiveVideo;
  event?: ArchiveEvent;
  onClose: () => void;
}) {
  const { locale, t } = useTranslations();
  const title = locale === "ar" ? arabicAaaaVideoTitle(video) : video.title;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useModalAccessibility<HTMLElement>({ onClose, initialFocusRef: closeButtonRef });

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-[#030a12]/82 p-3 backdrop-blur-[4px] sm:p-7"
      role="presentation"
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) onClose();
      }}
    >
      <section
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={"aaaa-video-" + video.id}
        className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl shadow-black/40 sm:max-h-[calc(100dvh-3.5rem)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t("Close video")}
          className="absolute right-4 top-4 z-20 grid size-11 cursor-pointer place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-crimson-700"
        >
          <Close className="size-5" />
        </button>

        <div className="aspect-video w-full overflow-hidden rounded-t-[2rem] bg-black">
          <iframe
            src={youtubeEmbedUrl(video)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="size-full border-0"
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                "rounded-full px-2.5 py-1 font-display text-[9px] font-semibold tracking-[0.12em] uppercase " +
                (video.type === "qa"
                  ? "bg-jade-50 text-jade-700"
                  : "bg-crimson-50 text-crimson-700")
              }
            >
              {t(video.type === "qa" ? "Questions & answers" : "Session")}
            </span>
            {event ? (
              <time
                dateTime={event.date}
                className="font-display text-[10px] font-semibold text-ink-400"
              >
                {event.dateDisplay}
              </time>
            ) : null}
          </div>

          <h2
            id={"aaaa-video-" + video.id}
            className="mt-4 max-w-4xl font-display text-2xl font-semibold leading-8 tracking-[-0.025em] text-ink-950 sm:text-3xl sm:leading-10"
          >
            {title}
          </h2>

          {video.speakers.length > 0 ? (
            <p className="mt-3 flex items-start gap-2 text-[13px] leading-6 text-ink-500">
              <Users className="mt-1 size-4 shrink-0 text-jade-700" />
                {video.speakers.map((speaker) => formatDoctorNameList(speaker)).join(", ")}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-5">
            <p className="max-w-2xl text-[12px] leading-5 text-ink-400">
              {event ? (locale === "ar" ? arabicAaaaEventHeading(event) : event.heading) : null}
            </p>
            <a
              href={youtubeWatchUrl(video)}
              target="_blank"
              rel="noreferrer"
              className="group/link inline-flex cursor-pointer items-center gap-2 font-display text-[11px] font-semibold text-jade-700 transition-colors hover:text-jade-900"
            >
              {t("Open on YouTube")}
              <ExternalLink className="size-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
