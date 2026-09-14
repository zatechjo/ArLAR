"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Close,
  ExternalLink,
  FileText,
  Play,
  Search,
  Users,
} from "@/components/icons";
import { specialInterestGroups } from "@/data/special-interest-groups";
import type {
  LibraryCollection,
  LibraryResource,
} from "@/lib/educational-library";
import { formatDoctorNameList } from "@/lib/doctor-name";
import { useTranslations } from "@/i18n/locale-context";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

type SortKey = "newest" | "oldest" | "title";

const PAGE_SIZE = 12;

const accentClasses = {
  jade: "border-jade-200 bg-jade-50 text-jade-800",
  crimson: "border-crimson-200 bg-crimson-50 text-crimson-800",
  purple: "border-[#dfc9ef] bg-[#f7f1fb] text-[#5a2678]",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
} as const;

export function EducationalLibrary({
  resources,
  collections,
}: {
  resources: LibraryResource[];
  collections: LibraryCollection[];
}) {
  const { locale, t } = useTranslations();
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState("all");
  const [year, setYear] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeVideo, setActiveVideo] = useState<LibraryResource | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const years = useMemo(
    () =>
      [...new Set(resources.flatMap((resource) => (resource.year ? [resource.year] : [])))].sort(
        (a, b) => b - a,
      ),
    [resources],
  );

  const collectionNames = useMemo(
    () => [...new Set(resources.map((resource) => resource.collection))].sort(),
    [resources],
  );

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return resources
      .filter((resource) => {
        if (collection !== "all" && resource.collection !== collection) return false;
        if (year !== "all" && resource.year !== Number(year)) return false;
        if (!normalizedQuery) return true;

        return [
          resource.title,
          resource.description || "",
          resource.collection,
          resource.speakers.join(" "),
          resource.topics.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        const aTime = a.date ? Date.parse(a.date) : 0;
        const bTime = b.date ? Date.parse(b.date) : 0;
        return sort === "oldest" ? aTime - bTime : bTime - aTime;
      });
  }, [collection, query, resources, sort, year]);

  const visibleResources = filteredResources.slice(0, visibleCount);
  const hasMoreResources = visibleResources.length < filteredResources.length;

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || !hasMoreResources) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + PAGE_SIZE, filteredResources.length),
          );
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [filteredResources.length, hasMoreResources, visibleCount]);

  const hasFilters =
    query !== "" || collection !== "all" || year !== "all" || sort !== "newest";

  const resetVisible = () => setVisibleCount(PAGE_SIZE);
  const clearFilters = () => {
    setQuery("");
    setCollection("all");
    setYear("all");
    setSort("newest");
    setVisibleCount(PAGE_SIZE);
  };

  const chooseCollection = (name: string) => {
    setCollection((current) => (current === name ? "all" : name));
    setYear("all");
    setVisibleCount(PAGE_SIZE);
    requestAnimationFrame(() => {
      document.getElementById("library-filters")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <section className="bg-[#f4f7f6] pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-12 lg:pb-24">
      <div className="mx-auto flex max-w-7xl flex-col px-4 sm:px-6">
        <div
          id="library-filters"
          className="order-2 relative z-10 mt-10 scroll-mt-24 rounded-[1.6rem] border border-ink-100 bg-white p-4 sm:p-5 lg:scroll-mt-48 lg:p-6"
        >
          <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-[#f3f6f5] px-4 transition-[background-color,box-shadow] focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(0,149,59,0.18)] sm:px-5">
            <Search className="size-5 shrink-0 text-jade-700" />
            <span className="sr-only">{t("Search the educational library")}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetVisible();
              }}
              placeholder={t("Search a topic, speaker, webinar, or publication…")}
              className="min-w-0 flex-1 bg-transparent font-display text-[14px] text-ink-950 outline-none placeholder:text-ink-400 sm:text-[15px]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  resetVisible();
                }}
                aria-label={t("Clear search")}
                className="grid size-8 cursor-pointer place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
              >
                <Close className="size-4" />
              </button>
            ) : (
              <span className="hidden font-display text-[9.5px] font-semibold tracking-[0.13em] text-ink-300 uppercase sm:block">
                {t("Search the archive")}
              </span>
            )}
          </label>

          <div className="mt-4 grid gap-3 border-t border-ink-100 pt-4 sm:grid-cols-2 lg:grid-cols-[1fr_0.65fr_0.65fr_auto] lg:items-end">
            <SelectField
              label="Collection"
              value={collection}
              onChange={(value) => {
                setCollection(value);
                resetVisible();
              }}
            >
              <option value="all">{t("Every collection")}</option>
              {collectionNames.map((name) => (
                <option key={name} value={name}>
                  {t(name)}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Year"
              value={year}
              onChange={(value) => {
                setYear(value);
                resetVisible();
              }}
            >
              <option value="all">{t("Any year")}</option>
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </SelectField>
            <SelectField label="Sort" value={sort} onChange={(value) => setSort(value as SortKey)}>
              <option value="newest">{t("Newest first")}</option>
              <option value="oldest">{t("Oldest first")}</option>
              <option value="title">{t("Title A–Z")}</option>
            </SelectField>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-11 cursor-pointer rounded-xl px-4 font-display text-[11px] font-semibold text-crimson-700 transition-colors hover:bg-crimson-50"
              >
                {t("Clear filters")}
              </button>
            ) : null}
          </div>
        </div>

        <div className="order-1 pt-8 sm:pt-10 lg:pt-12">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-crimson-600 uppercase">
                {t("Curated shelves")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
                {t("Start with a collection")}
              </h2>
            </div>
            <p className={`max-w-lg text-[12.5px] leading-6 text-ink-500 ${locale === "ar" ? "text-right" : ""}`}>
              {t("Enter through one of ArLAR's core archives, or use the catalogue below to search across all of them at once.")}
            </p>
          </div>

          <div className="mt-8 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
            {collections.map((item) => {
              const count = resources.filter(
                (resource) => resource.collection === item.id,
              ).length;
              return (
                <CollectionCard
                  key={item.id}
                  collection={item}
                  count={count}
                  active={collection === item.id}
                  onChoose={() => chooseCollection(item.id)}
                />
              );
            })}
          </div>
        </div>

        <div id="library-catalogue" className="order-3 scroll-mt-24 pt-8 sm:pt-10">
          {visibleResources.length > 0 ? (
            <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onPlay={() => setActiveVideo(resource)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-7 grid min-h-72 place-items-center rounded-[1.7rem] border border-dashed border-ink-200 bg-white px-6 text-center">
              <div>
                <BookOpen className="mx-auto size-8 text-ink-300" />
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-800">
                  {t("Nothing matches those filters")}
                </h3>
                <p className="mt-2 text-[13px] text-ink-400">
                  {t("Try a broader search or return to the full catalogue.")}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 min-h-10 cursor-pointer rounded-full bg-crimson-600 px-5 font-display text-[12px] font-semibold text-white transition-colors hover:bg-crimson-700"
                >
                  {t("View all resources")}
                </button>
              </div>
            </div>
          )}

          {hasMoreResources ? (
            <div
              ref={loadMoreRef}
              aria-hidden="true"
              className="mt-8 flex h-11 items-center justify-center gap-1.5"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-jade-600" />
              <span className="size-1.5 animate-pulse rounded-full bg-jade-600 [animation-delay:150ms]" />
              <span className="size-1.5 animate-pulse rounded-full bg-jade-600 [animation-delay:300ms]" />
            </div>
          ) : null}
        </div>
      </div>

      {activeVideo
        ? createPortal(
            <LibraryVideoModal
              resource={activeVideo}
              onClose={() => setActiveVideo(null)}
            />,
            document.body,
          )
        : null}
    </section>
  );
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
      <span className="mb-1.5 block font-display text-[9px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
        {t(label)}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-ink-150 bg-white ps-3.5 pe-9 font-display text-[12px] font-medium text-ink-900 outline-none transition-colors hover:border-ink-300 focus:border-jade-500"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3.5 bottom-3.5 size-4 text-ink-400" />
    </label>
  );
}

function CollectionCard({
  collection,
  count,
  active,
  onChoose,
}: {
  collection: LibraryCollection;
  count: number;
  active: boolean;
  onChoose: () => void;
}) {
  const { locale, t } = useTranslations();
  const isLogo = collection.image.includes("special-interest-groups");

  return (
    <button
      type="button"
      onClick={onChoose}
      aria-pressed={active}
      className={`group flex min-h-52 w-[78vw] shrink-0 snap-start cursor-pointer flex-col overflow-hidden rounded-[1.35rem] border transition-[border-color,background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 sm:w-auto ${
        locale === "ar" ? "text-right" : "text-left"
      } ${
        active
          ? "border-jade-500 bg-jade-50/35 shadow-[0_0_0_3px_rgba(0,149,59,0.13)]"
          : "border-ink-100 bg-white hover:border-jade-200"
      }`}
    >
      <span className="relative block h-24 w-full overflow-hidden border-b border-ink-100 bg-[#f6f8f7]">
        <Image
          src={collection.image}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, 20vw"
          className={isLogo ? "object-contain p-4" : "object-cover object-top"}
        />
        {!isLogo ? (
          <span aria-hidden className="absolute inset-0 bg-linear-to-t from-ink-950/25 to-transparent" />
        ) : null}
      </span>
      <span className="flex flex-1 flex-col p-4">
        <span className={`w-fit rounded-full border px-2.5 py-1 font-display text-[8.5px] font-semibold tracking-[0.12em] uppercase ${accentClasses[collection.accent]}`}>
          {t(collection.shortName)}
        </span>
        <strong className="mt-3 font-display text-[14px] font-semibold leading-5 text-ink-950">
          {t(collection.name)}
        </strong>
        <span className={`mt-auto flex items-center justify-between gap-3 pt-4 font-display text-[10.5px] font-semibold ${active ? "text-jade-800" : "text-ink-400"}`}>
          {count} {t("resources")}
          <ArrowRight className={`rtl-flip size-3.5 text-jade-700 transition-transform group-hover:translate-x-1 ${active ? "translate-x-1" : ""}`} />
        </span>
      </span>
    </button>
  );
}

function ResourceCard({
  resource,
  onPlay,
}: {
  resource: LibraryResource;
  onPlay: () => void;
}) {
  const { locale, t, href } = useTranslations();
  const isVideo = resource.kind === "webinar" || resource.kind === "congress";
  const isCollege = resource.collection === "ArLAR College";
  const isAaaa = resource.collection === "AAAA Group";
  const content = (
    <>
      <ResourceVisual resource={resource} isVideo={isVideo} />
      <span className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <CollectionLabels resource={resource} />
          {resource.date && !isAaaa && !isCollege ? (
            <time className="font-display text-[10px] font-medium text-ink-400" dateTime={resource.date}>
              {formatDate(resource.date, locale)}
            </time>
          ) : null}
        </span>

        {isCollege && resource.date ? (
          <p className="mt-4 flex items-center gap-2 font-display text-[11.5px] font-semibold text-crimson-600">
            <CalendarDays className="size-3.5 shrink-0" />
            {formatDate(resource.date, locale)}
          </p>
        ) : null}

        <strong className="mt-4 overflow-hidden font-display text-[17px] font-semibold leading-6 tracking-[-0.015em] text-ink-950 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
          {t(resource.title)}
        </strong>

        {resource.speakers.length > 0 && !isCollege ? (
          <span className="mt-4 flex items-start gap-2 text-[12px] leading-5 text-ink-500">
            <Users className="mt-0.5 size-3.5 shrink-0 text-jade-700" />
            <span className="overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
              {resource.speakers.map((speaker) => formatDoctorNameList(speaker)).join(", ")}
            </span>
          </span>
        ) : resource.description ? (
          <span className="mt-4 overflow-hidden text-[12px] leading-5 text-ink-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {t(resource.description)}
          </span>
        ) : null}

        <span className="mt-auto pt-6">
          <span className="block border-t border-ink-100 pt-4">
            <span className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate font-display text-[10px] font-semibold text-ink-400">
                {t(resource.collection)}
              </span>
              <span className={`inline-flex shrink-0 items-center gap-1.5 font-display text-[12.5px] font-semibold text-jade-700 ${isVideo ? "replay-card-action" : ""}`}>
                {isVideo ? <Play className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                {t(resource.action)}
              </span>
            </span>
          </span>
        </span>
      </span>
    </>
  );

  const className =
    `group relative flex min-h-full cursor-pointer flex-col overflow-hidden rounded-[1.55rem] border border-ink-100 bg-white transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500 ${
      locale === "ar" ? "text-right" : "text-left"
    } ` +
    (isAaaa ? "hover:border-crimson-200 hover:bg-crimson-50/10" : "hover:border-jade-200");

  if (isVideo) {
    return (
      <button type="button" onClick={onPlay} className={className}>
        {content}
      </button>
    );
  }

  if (!resource.href) return <article className={className}>{content}</article>;
  const external = resource.href.startsWith("http");

  return external || resource.href.endsWith(".pdf") ? (
    <a href={resource.href} target="_blank" rel="noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={href(resource.href)} className={className}>
      {content}
    </Link>
  );
}

function ResourceVisual({ resource, isVideo }: { resource: LibraryResource; isVideo: boolean }) {
  const { t } = useTranslations();
  const logo = resource.image?.includes("special-interest-groups");
  const isCollege = resource.collection === "ArLAR College";
  const isAaaa = resource.collection === "AAAA Group";
  const aaaaVideoType = resource.topics.includes("Questions and answers") ? "Questions & answers" : "Session";

  return (
    <span className={`relative block overflow-hidden border-b border-ink-100 ${logo ? "aspect-[16/9] bg-[#f8faf9]" : isCollege ? "aspect-[16/10] bg-ink-100" : "aspect-[16/9] bg-ink-100"}`}>
      {resource.image ? (
        resource.image.startsWith("http") ? (
          <span
            aria-hidden
            style={{ backgroundImage: `url(${resource.image})` }}
            className={`absolute inset-0 bg-center bg-no-repeat ${logo ? "bg-contain p-8" : "bg-cover"}`}
          />
        ) : (
          <Image
            src={resource.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={logo ? "object-contain p-8" : "object-cover object-top"}
          />
        )
      ) : (
        <span className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_20%_20%,rgba(0,149,59,0.12),transparent_38%),linear-gradient(135deg,#f7faf9,#edf2f0)] text-jade-700">
          <BookOpen className="size-9" />
        </span>
      )}
      {!logo ? <span aria-hidden className="absolute inset-0 bg-linear-to-t from-ink-950/35 via-transparent to-transparent" /> : null}
      {isVideo ? (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-13 place-items-center rounded-full border border-white/55 bg-ink-950/38 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-0.5 size-5 fill-current" />
          </span>
        </span>
      ) : (
        <span className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink-900 backdrop-blur">
          <FileText className="size-4" />
        </span>
      )}
      {isAaaa ? (
        <span className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 font-display text-[9px] font-semibold tracking-[0.11em] text-white uppercase backdrop-blur ${aaaaVideoType === "Questions & answers" ? "bg-jade-600/92" : "bg-crimson-600/92"}`}>
          {t(aaaaVideoType)}
        </span>
      ) : null}
    </span>
  );
}

function CollectionLabels({ resource }: { resource: LibraryResource }) {
  const { t } = useTranslations();
  const ownerLabel = collectionShortLabel(resource);
  const linkedGroups = resource.topics.flatMap((topic) => {
    const normalizedTopic = topic.trim().toLowerCase();
    const group = specialInterestGroups.find(
      ({ name, abbreviation }) =>
        name.toLowerCase() === normalizedTopic || abbreviation.toLowerCase() === normalizedTopic,
    );

    return group ? [{ label: group.abbreviation, title: group.name }] : [];
  });
  const pills = [
    { label: ownerLabel, title: resource.collection },
    ...linkedGroups,
  ].filter(
    (pill, index, items) =>
      items.findIndex(({ label }) => label.toLowerCase() === pill.label.toLowerCase()) === index,
  );

  return (
    <span className="flex flex-wrap items-center gap-2">
      {pills.map((pill) => (
        <span
          key={pill.label}
          title={t(pill.title)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-display text-[10px] font-semibold ${collectionPillClasses(pill.label)}`}
        >
          <Users className="size-3 shrink-0" />
          {t(pill.label)}
        </span>
      ))}
    </span>
  );
}

function collectionPillClasses(label: string) {
  if (label === "ArLAR College") return "border-jade-200 bg-jade-50 text-jade-700";
  return "border-ink-200 bg-ink-50 text-ink-500";
}

function collectionShortLabel(resource: LibraryResource) {
  const labels: Record<string, string> = {
    "ArLAR College": "ArLAR College",
    "AAAA Group": "AAAA",
    "ArLAR21 Jordan": "ArLAR21",
    "ArLAR23 Kuwait": "ArLAR23",
    "ArLAR Research Group": "ARCH",
    "ArLAR Research Group (ARCH)": "ARCH",
    "ArLAR E-Bulletin": "ArLAR",
    "ArLAR Publications": "ArLAR",
  };
  if (labels[resource.collection]) return labels[resource.collection];
  return resource.topics[0] || resource.collection;
}

function LibraryVideoModal({
  resource,
  onClose,
}: {
  resource: LibraryResource;
  onClose: () => void;
}) {
  const { locale, t, href } = useTranslations();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useModalAccessibility<HTMLElement>({ onClose, initialFocusRef: closeButtonRef });
  const embed = resource.mediaUrl
    ? getYouTubeEmbed(resource.mediaUrl, resource.startSeconds)
    : null;

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-[#030a12]/84 p-3 backdrop-blur-[4px] sm:p-7"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`library-video-${resource.id}`}
        className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white sm:max-h-[calc(100dvh-3.5rem)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t("Close video")}
          className="absolute end-4 top-4 z-20 grid size-11 cursor-pointer place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-crimson-700"
        >
          <Close className="size-5" />
        </button>

        <div className="aspect-video w-full overflow-hidden rounded-t-[2rem] bg-black">
          {embed ? (
            <iframe
              src={embed}
              title={resource.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="size-full border-0"
            />
          ) : (
            <div className="grid size-full place-items-center px-6 text-center text-white/75">
              {t("This recording cannot be embedded in the browser.")}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <CollectionLabels resource={resource} />
            {resource.date ? (
              <time dateTime={resource.date} className="font-display text-[10px] font-semibold text-ink-400">
                {formatDate(resource.date, locale)}
              </time>
            ) : null}
          </div>
          <h2 id={`library-video-${resource.id}`} className="mt-4 max-w-4xl font-display text-2xl font-semibold leading-8 tracking-[-0.025em] text-ink-950 sm:text-3xl sm:leading-10">
            {t(resource.title)}
          </h2>
          {resource.speakers.length > 0 ? (
            <p className="mt-3 flex items-start gap-2 text-[13px] leading-6 text-ink-500">
              <Users className="mt-1 size-4 shrink-0 text-jade-700" />
              {resource.speakers.map((speaker) => formatDoctorNameList(speaker)).join(", ")}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-5">
            <Link href={href(resource.collectionHref)} onClick={onClose} className="group inline-flex items-center gap-2 font-display text-[11px] font-semibold text-ink-500 transition-colors hover:text-jade-800">
              {t("Browse")} {t(resource.collection)}
              <ArrowRight className="rtl-flip size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            {resource.mediaUrl ? (
              <a href={youtubeWatchUrl(resource.mediaUrl, resource.startSeconds)} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 font-display text-[11px] font-semibold text-jade-700 transition-colors hover:text-jade-900">
                {t("Open on YouTube")}
                <ExternalLink className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function formatDate(date: string, locale: string = "en") {
  if (/^\d{4}-\d{2}$/.test(date)) {
    return new Date(`${date}-01T00:00:00Z`).toLocaleDateString(locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-GB", {
      timeZone: "UTC",
      month: "long",
      year: "numeric",
    });
  }
  return new Date(date).toLocaleDateString(locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getYouTubeEmbed(mediaUrl: string, startSeconds = 0) {
  try {
    const url = new URL(mediaUrl);
    const host = url.hostname.replace(/^www\./, "");
    if (!["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) return null;
    const playlistId = url.searchParams.get("list");
    const start = startSeconds > 0 ? `&start=${startSeconds}` : "";
    if (url.pathname === "/playlist" && playlistId) {
      return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&autoplay=1&rel=0`;
    }
    let videoId = url.searchParams.get("v");
    if (host === "youtu.be") videoId = url.pathname.split("/").filter(Boolean)[0];
    if (!videoId) {
      const segments = url.pathname.split("/").filter(Boolean);
      if (["embed", "live", "shorts"].includes(segments[0])) videoId = segments[1];
    }
    if (!videoId || !/^[\w-]+$/.test(videoId)) return null;
    const list = playlistId ? `&list=${encodeURIComponent(playlistId)}` : "";
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0${list}${start}`;
  } catch {
    return null;
  }
}

function youtubeWatchUrl(mediaUrl: string, startSeconds = 0) {
  if (startSeconds <= 0) return mediaUrl;
  return `${mediaUrl}${mediaUrl.includes("?") ? "&" : "?"}t=${startSeconds}s`;
}
