"use client";

import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Close,
  ExternalLink,
  Mic,
  Play,
  Search,
  Users,
} from "@/components/icons";
import { formatDoctorName, formatDoctorNameList } from "@/lib/doctor-name";
import { useTranslations } from "@/i18n/locale-context";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

export type CollegeEvent = {
  id: string;
  title: string;
  date: string;
  year: number;
  groups: string[];
  speakers: string | null;
  moderators?: string | null;
  webinarUrl: string;
  image: string;
  registration?: boolean;
};

function eventImageSrc(image: string) {
  return image.startsWith("/") || /^https?:\/\//i.test(image)
    ? image
    : `/images/arlar-college-events/${image}`;
}

type SortKey = "newest" | "oldest" | "title";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A–Z" },
];

/**
 * Event records carry the SIG name as it was typed when the webinar was
 * published, which does not always match the name the SIG directory uses.
 * Normalising here keeps a chip pointing at the same group the SIG page shows,
 * without needing every historic record corrected.
 */
const SIG_CANONICAL_NAME: Record<string, string> = {
  "ArLAR Women’s Health Group": "Arab Women Health in Rheumatology Group",
  "ArLAR Women's Health Group": "Arab Women Health in Rheumatology Group",
};

/**
 * Chips show the group's full name in English and Arabic. The official French
 * names are far longer than either — "Groupe de l'ArLAR pour la sensibilisation
 * aux rhumatismes chez les adultes" is 76 characters against 36 in English — so
 * French alone falls back to a shortened form. The full French name stays on
 * the chip's tooltip. Keyed by the canonical English name.
 */
const SIG_FRENCH_SHORT_LABEL: Record<string, string> = {
  "Arab Adult Arthritis Awareness Group": "Sensibilisation aux rhumatismes",
  "ArLAR Musculoskeletal Sonography Group": "Échographie musculo-squelettique",
  "Arab Women Health in Rheumatology Group": "Santé des femmes",
  "Pediatric Rheumatologist Arab Group": "Rhumatologie pédiatrique",
  "ArLAR Francophone Group": "Groupe Francophone",
  "ArLAR Research Group": "Groupe de recherche",
  "Young Rheumatologist Group": "Jeunes rhumatologues",
};

export function sigCanonicalName(name: string) {
  return SIG_CANONICAL_NAME[name] ?? name;
}

/** The full, translated group name — used for the chip's tooltip. */
export function sigFullName(name: string, t: (source: string) => string) {
  return t(sigCanonicalName(name));
}

export function sigChipLabel(
  name: string,
  locale: string,
  t: (source: string) => string,
) {
  const canonical = sigCanonicalName(name);
  if (locale === "fr") return SIG_FRENCH_SHORT_LABEL[canonical] ?? t(canonical);
  return t(canonical);
}

/** Pinned to UTC so the server and client always agree. */
export function formatEventDate(iso: string, locale: string = "en") {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getYouTubeEmbed(webinarUrl: string) {
  try {
    const url = new URL(webinarUrl);
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtu.be") {
      return null;
    }

    const playlistId = url.searchParams.get("list");
    if (url.pathname === "/playlist" && playlistId) {
      return {
        src: `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&autoplay=1&rel=0`,
        type: "Webinar playlist",
      };
    }

    let videoId = url.searchParams.get("v");
    if (host === "youtu.be") videoId = url.pathname.split("/").filter(Boolean)[0];
    if (!videoId) {
      const segments = url.pathname.split("/").filter(Boolean);
      if (["embed", "live", "shorts"].includes(segments[0])) {
        videoId = segments[1];
      }
    }
    if (!videoId || !/^[\w-]+$/.test(videoId)) return null;

    const list = playlistId
      ? `&list=${encodeURIComponent(playlistId)}`
      : "";
    return {
      src: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0${list}`,
      type: playlistId ? "Webinar playlist" : "Webinar replay",
    };
  } catch {
    return null;
  }
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslations();
  return (
    <label className="relative block">
      <span className="mb-1.5 block font-display text-[10px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
        {t(label)}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-ink-200 bg-white ps-3.5 pe-9 font-display text-[13px] font-medium text-ink-900 outline-none transition-colors hover:border-ink-300 focus:border-jade-500"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3.5 bottom-3.5 size-4 text-ink-400" />
    </label>
  );
}

export function EventCard({
  event,
  hoverMode = "standard",
}: {
  event: CollegeEvent;
  hoverMode?: "standard" | "border-only";
}) {
  const { locale, t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const borderOnly = hoverMode === "border-only";
  const chips = groupChips(event.groups);

  const closeModal = () => {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <article
      className={`group relative flex min-h-full flex-col overflow-hidden rounded-[1.5rem] border border-ink-100 bg-white duration-300 focus-within:border-jade-300 ${
        borderOnly
          ? "transition-colors hover:border-jade-300"
          : "transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-jade-200 hover:bg-jade-50/20"
      }`}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`${t("Watch")} ${event.title}`}
        className="absolute inset-0 z-10 cursor-pointer rounded-[1.5rem] outline-none focus-visible:ring-2 focus-visible:ring-jade-600 focus-visible:ring-inset"
      >
        <span className="sr-only">{t("Watch")} {event.title}</span>
      </button>

      <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
        <Image
          src={eventImageSrc(event.image)}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover object-top ${
            borderOnly
              ? ""
              : "transition-transform duration-500 group-hover:scale-[1.03]"
          }`}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink-950/35 via-transparent to-transparent"
        />
        <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-ink-950/35 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
          <Play className="ml-0.5 size-5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip.name}
              title={sigFullName(chip.name, t)}
              className={`inline-flex max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-display text-[10px] font-semibold ring-1 ring-inset ${chip.isCollege ? "bg-jade-50 text-jade-700 ring-jade-100" : "bg-ink-50 text-ink-500 ring-ink-100"}`}
            >
              {chip.isCollege ? <Users className="size-3 shrink-0" /> : null}
              <span>{sigChipLabel(chip.name, locale, t)}</span>
            </span>
          ))}
        </div>

        <p className="mt-4 flex items-center gap-2 font-display text-[11.5px] font-semibold text-crimson-600">
          <CalendarDays className="size-3.5 shrink-0" />
          {formatEventDate(event.date, locale)}
        </p>

        <h3
          className={`mt-2.5 mb-5 font-display text-[17px] font-semibold leading-snug tracking-[-0.015em] text-ink-950 ${
            borderOnly
              ? ""
              : "transition-colors group-hover:text-jade-700"
          }`}
        >
          {event.title}
        </h3>

        {/* mt-auto pins the divider to the card bottom; the title's mb sets the minimum gap. */}
        <span className="replay-card-action mt-auto inline-flex items-center gap-2 border-t border-ink-100 pt-4 font-display text-[12.5px] font-semibold text-jade-700">
          <Play
            className={`size-3.5 ${
              borderOnly
                ? ""
                : "transition-transform group-hover:scale-110"
            }`}
          />
          {t(event.registration ? "Register for webinar" : "Watch webinar")}
        </span>
      </div>

      {isOpen
        ? createPortal(
            <CollegeVideoModal event={event} onClose={closeModal} />,
            document.body,
          )
        : null}
    </article>
  );
}

/**
 * The featured card for a webinar that has not happened yet.
 *
 * Deliberately unlike {@link EventCard}: the replay tiles are quiet, uniform,
 * and built to be scanned in a grid, whereas an upcoming webinar is the one
 * thing on the page a visitor can still act on. So it gets the poster shown
 * whole, larger type, faculty as individual chips, and real buttons.
 *
 * Crimson carries the accent throughout; jade is reserved for the ArLAR College
 * badge, which is what {@link groupChips} uses it to mark.
 */
export function UpcomingEventCard({ event }: { event: CollegeEvent }) {
  const { locale, t } = useTranslations();
  const chips = groupChips(event.groups);
  const speakers = splitNameList(event.speakers);
  const moderators = splitNameList(event.moderators);
  const { date, time } = formatEventDateTime(event.date, locale);
  const calendarUrl = googleCalendarUrl(event);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-ink-100 bg-white">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[35%_minmax(0,1fr)] lg:gap-9 lg:p-7">
        {/*
          Sized from the image rather than a fixed frame. College banners are
          not one shape — the archive is landscape, current posters are portrait
          4:5 — so any fixed aspect box letterboxes half of them. `h-auto w-full`
          lets the intrinsic ratio drive the height: the whole poster shows, at
          full column width, with no padding around it. The width/height below
          are only the pre-load placeholder ratio.
        */}
        <Image
          src={eventImageSrc(event.image)}
          alt={event.title}
          width={952}
          height={1200}
          sizes="(max-width: 1024px) 100vw, 35vw"
          className="h-auto w-full self-start rounded-[1.4rem] border border-ink-100"
        />

        {/*
          Centred rather than top-aligned: a portrait poster makes the left
          column much taller than this one, and centring absorbs the difference
          instead of stranding the buttons at the bottom of a gap. With a short
          poster this column sets the height and centring is a no-op.
        */}
        <div className="flex min-w-0 flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <span
                key={chip.name}
                title={sigFullName(chip.name, t)}
                className={`inline-flex max-w-full items-center gap-2 rounded-full px-3.5 py-2 font-display text-[11.5px] font-semibold ${
                  chip.isCollege
                    ? "bg-jade-600 text-white"
                    : "bg-white text-ink-600 ring-1 ring-ink-200 ring-inset"
                }`}
              >
                {chip.isCollege ? <Users className="size-3.5 shrink-0" /> : null}
                <span className="truncate">{sigChipLabel(chip.name, locale, t)}</span>
              </span>
            ))}
          </div>

          <h3 className="mt-4 font-display text-[26px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink-950 sm:text-[32px]">
            {event.title}
          </h3>

          {/* When and where it starts, given the weight of the one detail a
              visitor checks before anything else. */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <ScheduleTile icon={CalendarDays} label="Date" value={date} />
            {time ? <ScheduleTile icon={Clock3} label="Time" value={time} /> : null}
          </div>

          {/*
            One faculty band, chaired-by on the left and the panel on the right
            — the order the webinar posters use. The moderator column is sized
            to its own content so the (usually longer) speaker list takes the
            remaining width instead of both splitting it evenly. Both are always
            present: every College webinar has both, so an empty column means
            "not published yet".
          */}
          <div className="mt-6 grid gap-x-8 gap-y-5 border-t border-ink-100 pt-5 sm:grid-cols-[minmax(0,auto)_minmax(0,1fr)]">
            <FacultyList label="Moderators" names={moderators} tone="moderator" />
            <FacultyList label="Speakers" names={speakers} tone="speaker" />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-7">
            {/*
              A plain link to the organiser's registration page, opened in a new
              tab so the visitor keeps the College site behind them. Upcoming
              webinars have nothing to embed, so there is no player to open.
            */}
            <a
              href={event.webinarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-crimson-600 px-7 font-display text-[14px] font-semibold text-white transition-colors hover:bg-crimson-700 focus-visible:ring-2 focus-visible:ring-crimson-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {t(event.registration ? "Register for webinar" : "Watch webinar")}
              <ExternalLink className="size-4" />
            </a>
            {calendarUrl ? (
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-white px-6 font-display text-[13.5px] font-semibold text-ink-700 ring-1 ring-ink-200 transition-colors ring-inset hover:text-ink-950 hover:ring-ink-400"
              >
                <CalendarDays className="size-4" />
                {t("Add to calendar")}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Orders an event's groups for display and marks the College badge.
 *
 * ArLAR College always leads and is the only chip that gets the jade treatment;
 * any special interest group credited alongside it stays neutral so the two
 * never compete.
 */
function groupChips(groups: string[]) {
  const isCollege = (name: string) => sigCanonicalName(name) === "ArLAR College";
  const college = groups.filter(isCollege);
  const others = groups.filter((name) => !isCollege(name));

  return [...college, ...others].map((name) => ({ name, isCollege: isCollege(name) }));
}

/**
 * A single schedule fact — the date, or the start time — as its own tile.
 *
 * These were a plain crimson text line, which read as a caption under the
 * chips. Boxing each one gives the two details the visitor actually acts on
 * their own weight without competing with the title.
 */
function ScheduleTile({
  icon: Icon,
  label,
  value,
}: {
  icon: (props: { className?: string }) => React.ReactElement;
  label: string;
  value: string;
}) {
  const { t } = useTranslations();

  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-crimson-600 text-white">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-[9.5px] font-semibold tracking-[0.17em] text-ink-400 uppercase">
          {t(label)}
        </p>
        <p className="mt-1 font-display text-[15px] font-semibold tracking-[-0.015em] text-ink-950">
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * One faculty row, rendered as a chip per person.
 *
 * Each name is its own element on purpose: the plan is to give speakers real
 * profiles later, at which point a chip becomes a link to one without the
 * layout changing.
 */
function FacultyList({
  label,
  names,
  tone,
}: {
  label: string;
  names: string[];
  tone: "speaker" | "moderator";
}) {
  const { t } = useTranslations();
  const isSpeaker = tone === "speaker";

  return (
    <div className="min-w-0">
      <p className="font-display text-[10.5px] font-semibold tracking-[0.16em] text-ink-400 uppercase">
        {t(label)}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {names.length > 0 ? (
          names.map((name) => (
            // Both roles share one pill size; only the mic tint separates them,
            // since the column labels already say which list is which.
            <li
              key={name}
              className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2.5 font-display text-[14px] font-semibold text-ink-900"
            >
              <Mic className={`size-4 shrink-0 ${isSpeaker ? "text-crimson-600" : "text-ink-400"}`} />
              {name}
            </li>
          ))
        ) : (
          // The row is part of the layout whether or not the names are in yet —
          // every College webinar has both a panel and a chair, so an empty
          // slot means "not published", not "not applicable".
          <li className="inline-flex items-center rounded-full border border-dashed border-ink-200 px-4 py-2.5 font-display text-[14px] font-semibold text-ink-400">
            {t("To be announced")}
          </li>
        )}
      </ul>
    </div>
  );
}

/**
 * Splits a speakers/moderators value into one entry per person.
 *
 * The admin field is documented as one name per line, but names also arrive
 * comma-separated ("Dr. A, Dr. B"). `formatDoctorNameList` already knows how to
 * find the boundaries in that second form, so the split mirrors its rule: break
 * before an honorific, never on the comma in a credential suffix like
 * "Nizar Abdulateef, MD".
 */
function splitNameList(value: string | null | undefined) {
  if (!value) return [];

  return value
    .split(/\r?\n/)
    .flatMap((line) =>
      line.split(/(?:,\s*|\s+)(?=(?:dr|doctor|prof|professor|mr|mrs|ms|capt)\s*\.?\s)/i),
    )
    .map((name) => formatDoctorName(name.trim()))
    .filter(Boolean);
}

/**
 * A Google Calendar "add event" link for the webinar.
 *
 * The scheduling form captures a start but no duration, so the entry is given
 * the one hour a College webinar normally runs; the attendee can adjust it
 * before saving. Times are sent as UTC, which Google converts to the viewer's
 * own zone.
 */
function googleCalendarUrl(event: CollegeEvent) {
  const start = new Date(event.date);
  if (Number.isNaN(start.valueOf())) return null;

  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const stamp = (value: Date) => value.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: event.webinarUrl,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Date and start time for an upcoming webinar.
 *
 * Both parts are read in Asia/Baghdad — the +03:00 the scheduling form writes —
 * so the two never disagree about which day an evening session falls on.
 */
function formatEventDateTime(iso: string, locale: string) {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.valueOf())) return { date: iso, time: "" };

  const tag = locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-GB";
  const zone = "Asia/Baghdad";

  return {
    date: parsed.toLocaleDateString(tag, {
      timeZone: zone,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: `${parsed.toLocaleTimeString(tag, {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
    })} (GMT+3)`,
  };
}

function CollegeVideoModal({
  event,
  onClose,
}: {
  event: CollegeEvent;
  onClose: () => void;
}) {
  const { locale, t } = useTranslations();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useModalAccessibility<HTMLElement>({ onClose, initialFocusRef: closeButtonRef });
  const embed = getYouTubeEmbed(event.webinarUrl);

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
        aria-labelledby={`college-video-${event.id}`}
        className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl shadow-black/40 sm:max-h-[calc(100dvh-3.5rem)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t("Close video")}
          className="absolute end-4 top-4 z-20 grid size-11 cursor-pointer place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-crimson-700"
        >
          <Close className="size-5" />
        </button>

        <div className="aspect-video w-full overflow-hidden rounded-t-[2rem] bg-black">
          {embed ? (
            <iframe
              src={embed.src}
              title={event.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="size-full border-0"
            />
          ) : (
            <div className="grid size-full place-items-center px-6 text-center text-white">
              <div>
                <Play className="mx-auto size-8 text-white/60" />
                <p className="mt-4 font-display text-lg font-semibold">
                  {t(event.registration ? "Registration opens on the organiser’s website." : "This replay cannot be embedded.")}
                </p>
                <a
                  href={event.webinarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-sky-200 hover:text-white"
                >
                  {t(event.registration ? "Open registration" : "Open the webinar")}
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 font-display text-[10px] font-semibold tracking-[0.1em] text-crimson-600 uppercase">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {formatEventDate(event.date, locale)}
            </span>
            {embed ? (
              <>
                <span aria-hidden className="text-ink-200">
                  /
                </span>
                <span>{embed.type}</span>
              </>
            ) : null}
          </div>

          <h2
            id={`college-video-${event.id}`}
            className="mt-4 max-w-4xl font-display text-2xl font-semibold leading-8 tracking-[-0.025em] text-ink-950 sm:text-3xl sm:leading-10"
          >
            {event.title}
          </h2>

          {event.speakers ? (
            <p className="mt-4 flex items-start gap-2 whitespace-pre-line text-[13px] leading-6 text-ink-500">
              <Users className="mt-1 size-4 shrink-0 text-jade-700" />
              <span>{formatDoctorNameList(event.speakers.trim())}</span>
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-5">
            <div className="flex flex-wrap gap-2">
              {groupChips(event.groups).map((chip) => (
                <span
                  key={chip.name}
                  title={sigFullName(chip.name, t)}
                  className={`rounded-full px-2.5 py-1 font-display text-[9px] font-semibold tracking-[0.08em] uppercase ring-1 ring-inset ${chip.isCollege ? "bg-jade-50 text-jade-700 ring-jade-100" : "bg-ink-50 text-ink-500 ring-ink-100"}`}
                >
                  {sigChipLabel(chip.name, locale, t)}
                </span>
              ))}
            </div>
            <a
              href={event.webinarUrl}
              target="_blank"
              rel="noreferrer"
              className="group/link relative z-20 inline-flex cursor-pointer items-center gap-2 font-display text-[11px] font-semibold text-jade-700 transition-colors hover:text-jade-900"
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

export function EventsDirectory({ events }: { events: CollegeEvent[] }) {
  const { t } = useTranslations();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const years = useMemo(
    () => [...new Set(events.map((event) => event.year))].sort((a, b) => b - a),
    [events],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = events.filter((event) => {
      const matchesYear = year === "all" || String(event.year) === year;
      const matchesQuery =
        needle === "" || event.title.toLowerCase().includes(needle);
      return matchesYear && matchesQuery;
    });

    return filtered.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      const diff = Date.parse(a.date) - Date.parse(b.date);
      return sort === "oldest" ? diff : -diff;
    });
  }, [events, query, year, sort]);

  return (
    <section id="replays" className="scroll-mt-32 bg-[#fafbfc] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Controls */}
        <div className="grid gap-3 rounded-2xl border border-ink-100 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <label className="relative block">
            <span className="mb-1.5 block font-display text-[10px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
              {t("Search")}
            </span>
            <Search className="pointer-events-none absolute start-3.5 bottom-3.5 size-4 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("Search by webinar title")}
              className="h-11 w-full rounded-xl border border-ink-200 bg-white ps-10 pe-3.5 text-[13px] text-ink-900 outline-none transition-colors placeholder:text-ink-300 hover:border-ink-300 focus:border-jade-500"
            />
          </label>

          <SelectField label="Year" value={year} onChange={setYear}>
            <option value="all">{t("All years")}</option>
            {years.map((value) => (
              <option key={value} value={String(value)}>
                {value}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Sort"
            value={sort}
            onChange={(value) => setSort(value as SortKey)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </SelectField>
        </div>

        <p className="mt-5 font-display text-[12px] font-semibold tracking-[0.1em] text-ink-400 uppercase">
          {visible.length} {t(visible.length === 1 ? "webinar" : "webinars")}
          {year === "all" ? "" : ` ${t("in")} ${year}`}
        </p>

        {visible.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-ink-200 bg-white p-12 text-center">
            <p className="font-display text-[17px] font-semibold text-ink-950">
              {t("No webinars match your search.")}
            </p>
            <p className="mt-2 text-[13px] text-ink-500">
              {t("Try a different title or clear the year filter.")}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setYear("all");
              }}
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-crimson-600 px-5 font-display text-[13px] font-semibold text-white transition-colors hover:bg-crimson-700"
            >
              {t("Reset filters")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
