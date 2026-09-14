"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { DoctorBiographyModal } from "@/components/about/doctor-biography-modal";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Globe,
  Microscope,
  Search,
  Users,
  Video,
} from "@/components/icons";
import type { DoctorBiographyProfile } from "@/data/doctor-types";
import type { SearchResult, SearchResultKind } from "@/lib/search-types";
import { useTranslations } from "@/i18n/locale-context";
import { migratedWixMediaUrl } from "@/lib/wix-media-url";

type FilterKind = "all" | SearchResultKind;

const kindDetails: Record<
  SearchResultKind,
  { label: string; plural: string; icon: typeof FileText; accent: string; iconStyle: string }
> = {
  page: {
    label: "Page",
    plural: "Pages",
    icon: Globe,
    accent: "text-sky-700",
    iconStyle: "bg-sky-50 text-sky-700",
  },
  news: {
    label: "News",
    plural: "News",
    icon: FileText,
    accent: "text-crimson-700",
    iconStyle: "bg-crimson-50 text-crimson-700",
  },
  group: {
    label: "Group",
    plural: "Groups",
    icon: Microscope,
    accent: "text-jade-700",
    iconStyle: "bg-jade-50 text-jade-700",
  },
  webinar: {
    label: "Webinar",
    plural: "Webinars",
    icon: Video,
    accent: "text-violet-700",
    iconStyle: "bg-violet-50 text-violet-700",
  },
  resource: {
    label: "Resource",
    plural: "Resources",
    icon: BookOpen,
    accent: "text-amber-700",
    iconStyle: "bg-amber-50 text-amber-700",
  },
  question: {
    label: "Question",
    plural: "Questions",
    icon: Search,
    accent: "text-teal-700",
    iconStyle: "bg-teal-50 text-teal-700",
  },
  person: {
    label: "Person",
    plural: "People",
    icon: Users,
    accent: "text-slate-700",
    iconStyle: "bg-slate-100 text-slate-700",
  },
};

const filterOrder: SearchResultKind[] = [
  "page",
  "news",
  "group",
  "webinar",
  "resource",
  "question",
  "person",
];

export function SearchResults({
  query,
  results,
}: {
  query: string;
  results: SearchResult[];
}) {
  const { t, href } = useTranslations();
  const [activeKind, setActiveKind] = useState<FilterKind>("all");
  const [selectedDoctor, setSelectedDoctor] =
    useState<DoctorBiographyProfile | null>(null);
  const closeDoctor = useCallback(() => setSelectedDoctor(null), []);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        filterOrder.map((kind) => [
          kind,
          results.filter((result) => result.kind === kind).length,
        ]),
      ) as Record<SearchResultKind, number>,
    [results],
  );
  const filtered =
    activeKind === "all"
      ? results
      : results.filter((result) => result.kind === activeKind);

  return (
    <>
    <section className="bg-[#f5f8f7] pt-7 pb-12 sm:pt-9 sm:pb-16 lg:pt-10 lg:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <form action={href("/search")} method="get" className="rounded-[1.5rem] border border-ink-100 bg-white p-3 sm:p-4">
          <div className="relative flex items-center gap-2">
            <Search className="pointer-events-none absolute start-4 size-5 text-ink-400 sm:start-5" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              autoComplete="off"
              placeholder={t("Search the complete ArLAR website")}
              className="h-14 min-w-0 flex-1 rounded-xl border border-ink-100 bg-[#f8faf9] ps-12 pe-4 font-display text-[15px] text-ink-950 outline-none transition focus:border-jade-400 focus:ring-4 focus:ring-jade-400/10 sm:h-16 sm:ps-14 sm:text-[17px]"
              aria-label={t("Search ArLAR")}
            />
            <button
              type="submit"
              className="inline-flex h-14 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-crimson-600 px-5 font-display text-[12px] font-semibold text-white transition-colors hover:bg-crimson-700 sm:h-16 sm:px-7 sm:text-[13px]"
            >
              {t("Search")}
              <ArrowRight className="rtl-flip hidden size-4 sm:block" />
            </button>
          </div>
        </form>

        {query ? (
          <div className="mt-10 grid min-w-0 gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
            <aside className="min-w-0 lg:sticky lg:top-56 lg:self-start">
              <p className="px-1 font-display text-[10px] font-semibold tracking-[0.16em] text-crimson-700 uppercase">
                {t("Filter results")}
              </p>
              <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
                <FilterButton
                  active={activeKind === "all"}
                  label={t("All results")}
                  count={results.length}
                  onClick={() => setActiveKind("all")}
                />
                {filterOrder.map((kind) =>
                  counts[kind] ? (
                    <FilterButton
                      key={kind}
                      active={activeKind === kind}
                      label={t(kindDetails[kind].plural)}
                      count={counts[kind]}
                      onClick={() => setActiveKind(kind)}
                    />
                  ) : null,
                )}
              </div>
            </aside>

            <div className="min-w-0">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink-100 pb-5">
                <div>
                  <p className="font-display text-[10px] font-semibold tracking-[0.14em] text-jade-700 uppercase">
                    {results.length} {t(results.length === 1 ? "match" : "matches")}
                  </p>
                  <h2 className="mt-2 text-pretty font-display text-2xl font-semibold tracking-[-0.03em] text-ink-950 sm:text-3xl">
                    {t("Results for")} “{query}”
                  </h2>
                </div>
                {filtered.length !== results.length ? (
                  <p className="font-display text-[11px] text-ink-500">
                    {t("Showing")} {filtered.length} {t("of")} {results.length}
                  </p>
                ) : null}
              </div>

              {filtered.length ? (
                <div className="divide-y divide-ink-100">
                  {filtered.map((result) => (
                    <ResultRow
                      key={result.id}
                      result={result}
                      onDoctorSelect={setSelectedDoctor}
                    />
                  ))}
                </div>
              ) : (
                <EmptyResults query={query} />
              )}
            </div>
          </div>
        ) : (
          <div className="mt-12 rounded-[1.75rem] border border-ink-100 bg-white px-6 py-14 text-center sm:px-10">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-jade-50 text-jade-700">
              <Search className="size-6" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em] text-ink-950">
              {t("What are you looking for?")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-7 text-ink-500">
              {t("Search across ArLAR news, doctors, groups, webinars, publications, patient questions, and website pages.")}
            </p>
          </div>
        )}
      </div>
    </section>
      {selectedDoctor ? (
        <DoctorBiographyModal doctor={selectedDoctor} onClose={closeDoctor} />
      ) : null}
    </>
  );
}

function FilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-max snap-start cursor-pointer items-center justify-between gap-5 rounded-xl border px-4 py-3 font-display text-[12px] font-semibold transition-colors lg:w-full ${
        active
          ? "border-crimson-600 bg-crimson-600 text-white"
          : "border-ink-100 bg-white text-ink-600 hover:border-crimson-200 hover:text-crimson-700"
      }`}
    >
      <span>{label}</span>
      <span className={active ? "text-white/60" : "text-ink-400"}>{count}</span>
    </button>
  );
}

function ResultRow({
  result,
  onDoctorSelect,
}: {
  result: SearchResult;
  onDoctorSelect: (doctor: DoctorBiographyProfile) => void;
}) {
  const { t, href } = useTranslations();
  const details = kindDetails[result.kind];
  const Icon = details.icon;
  const image = migratedWixMediaUrl(result.image);

  const content = (
    <>
      {image ? (
        <div className="relative h-24 w-full overflow-hidden rounded-2xl border border-ink-100 bg-white sm:h-20 sm:w-24">
          <Image
            src={image}
            alt=""
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
      ) : (
        <span className={`grid size-12 place-items-center rounded-2xl sm:size-14 ${details.iconStyle}`}>
          <Icon className="size-5" />
        </span>
      )}

      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={`font-display text-[9.5px] font-semibold tracking-[0.14em] uppercase ${details.accent}`}>
            {t(details.label)}
          </span>
          {result.meta ? (
            <span className="font-display text-[10px] text-ink-400">{result.meta}</span>
          ) : null}
        </span>
        <span className="mt-2 block text-pretty font-display text-[17px] font-semibold leading-6 text-ink-950 transition-colors group-hover:text-crimson-700 sm:text-[19px]">
          {t(result.title)}
        </span>
        <span className="mt-2 line-clamp-2 block text-[13px] leading-6 text-ink-500">
          {t(result.description)}
        </span>
      </span>

      <span className="hidden size-10 place-items-center rounded-full border border-ink-100 bg-white text-ink-400 transition group-hover:border-crimson-200 group-hover:text-crimson-700 sm:grid">
        <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </>
  );

  const className =
    "group grid w-full gap-4 py-6 text-left sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:py-7";

  if (result.kind === "person" && result.doctor) {
    return (
      <button
        type="button"
        onClick={() => onDoctorSelect(result.doctor!)}
        className={`${className} cursor-pointer`}
        aria-label={`${t("View biography for")} ${result.title}`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href(result.href)} className={className}>
      {content}
    </Link>
  );
}

function EmptyResults({ query }: { query: string }) {
  const { t } = useTranslations();
  return (
    <div className="rounded-[1.5rem] border border-ink-100 bg-white px-6 py-14 text-center sm:px-10">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-ink-100 text-ink-500">
        <Search className="size-5" />
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold text-ink-950">
        {t("No results for")} “{query}”
      </h3>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-ink-500">
        {t("Try a shorter phrase, a doctor’s name, a disease topic, or a group abbreviation such as ARCH or AAAA.")}
      </p>
    </div>
  );
}
