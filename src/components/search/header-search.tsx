"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { DoctorBiographyModal } from "@/components/about/doctor-biography-modal";
import {
  ArrowRight,
  BookOpen,
  Close,
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
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

const quickLinks = [
  {
    href: "/education",
    title: "Educational Library",
    description: "Webinars, congress replays, publications, and clinical resources",
    icon: BookOpen,
  },
  {
    href: "/college/events",
    title: "ArLAR College",
    description: "Upcoming learning and the complete webinar archive",
    icon: Video,
  },
  {
    href: "/special-interest-groups",
    title: "Special Interest Groups",
    description: "Clinical, research, and professional communities",
    icon: Microscope,
  },
  {
    href: "/news",
    title: "Latest News",
    description: "Announcements and updates from across ArLAR",
    icon: FileText,
  },
] as const;

const kindDetails: Record<
  SearchResultKind,
  { label: string; icon: typeof FileText; className: string }
> = {
  page: { label: "Page", icon: Globe, className: "bg-sky-50 text-sky-700" },
  news: { label: "News", icon: FileText, className: "bg-crimson-50 text-crimson-700" },
  group: { label: "Group", icon: Microscope, className: "bg-jade-50 text-jade-700" },
  webinar: { label: "Webinar", icon: Video, className: "bg-violet-50 text-violet-700" },
  resource: { label: "Resource", icon: BookOpen, className: "bg-amber-50 text-amber-700" },
  question: { label: "Question", icon: Search, className: "bg-teal-50 text-teal-700" },
  person: { label: "Person", icon: Users, className: "bg-slate-100 text-slate-700" },
};

type SearchResponse = {
  results: SearchResult[];
};

export function HeaderSearch({ onClose }: { onClose: () => void }) {
  const { locale, t, href } = useTranslations();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedDoctor, setSelectedDoctor] =
    useState<DoctorBiographyProfile | null>(null);
  const trimmedQuery = query.trim();
  const showSuggestions = trimmedQuery.length >= 2;
  const modalRef = useModalAccessibility<HTMLDivElement>({ onClose, initialFocusRef: inputRef });

  useEffect(() => {
    if (!showSuggestions) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}&limit=8&locale=${locale}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Search request failed");
        const data = (await response.json()) as SearchResponse;
        setResults(data.results);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 140);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [locale, showSuggestions, trimmedQuery]);

  function openResult(href: string) {
    router.push(href.startsWith("/") ? localizeResultPath(href) : href);
    onClose();
  }

  function localizeResultPath(path: string) {
    return href(path);
  }

  function selectResult(result: SearchResult) {
    if (result.kind === "person" && result.doctor) {
      setSelectedDoctor(result.doctor);
      return;
    }
    openResult(result.href);
  }

  const closeDoctor = useCallback(() => {
    setSelectedDoctor(null);
  }, []);

  function submitSearch() {
    if (!trimmedQuery) return;
    openResult(href(`/search?q=${encodeURIComponent(trimmedQuery)}`));
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || !results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const result = results[activeIndex];
      if (result) selectResult(result);
    }
  }

  return (
    <>
    <div
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 z-[120] overflow-y-auto px-3 py-4 sm:px-6 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-label={t("Search ArLAR")}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 cursor-pointer bg-ink-950/78 backdrop-blur-md"
        aria-label={t("Close search")}
      />

      <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/15 bg-white shadow-2xl shadow-ink-950/35">
        <div className="relative overflow-hidden bg-[#081522] px-5 pb-6 pt-5 text-white sm:px-8 sm:pb-8 sm:pt-7">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(193,2,48,0.24),transparent_32%),radial-gradient(circle_at_88%_75%,rgba(0,149,59,0.2),transparent_30%)]" />
          <div aria-hidden className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.45)_1px,transparent_0)] [background-size:22px_22px]" />

          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-jade-300 uppercase">
                {t("Find anything across ArLAR")}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                {t("Search ArLAR")}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/8 text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label={t("Close search")}
            >
              <Close className="size-5" />
            </button>
          </div>

          <form
            className="relative mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
          >
            <Search className="pointer-events-none absolute start-5 top-1/2 size-5 -translate-y-1/2 text-ink-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                setActiveIndex(-1);
                if (value.trim().length < 2) {
                  setResults([]);
                  setLoading(false);
                }
              }}
              onKeyDown={handleInputKeyDown}
              type="search"
              name="q"
              autoComplete="off"
              placeholder={t("Search news, doctors, webinars, groups, resources…")}
              className="h-16 w-full rounded-2xl border border-white/10 bg-white ps-13 pe-28 font-display text-[16px] text-ink-950 outline-none transition focus:border-jade-400 focus:ring-4 focus:ring-jade-400/15 sm:h-[4.5rem] sm:pe-32 sm:text-lg"
              aria-label={t("Search the ArLAR website")}
              aria-controls="header-search-suggestions"
              aria-activedescendant={activeIndex >= 0 ? `header-search-result-${activeIndex}` : undefined}
            />
            <button
              type="submit"
              disabled={!trimmedQuery}
              className="absolute end-2 top-1/2 inline-flex h-12 -translate-y-1/2 cursor-pointer items-center gap-2 rounded-xl bg-crimson-600 px-4 font-display text-[12px] font-semibold text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:opacity-45 sm:px-5"
            >
              {t("Search")}
              <ArrowRight className="rtl-flip hidden size-4 sm:block" />
            </button>
          </form>
        </div>

        <div id="header-search-suggestions" className="max-h-[min(34rem,58dvh)] overflow-y-auto bg-[#f7f9f8] p-3 sm:p-5">
          {!showSuggestions ? (
            <div>
              <div className="flex items-center justify-between px-2 pb-3 pt-1">
                <p className="font-display text-[10px] font-semibold tracking-[0.15em] text-ink-500 uppercase">
                  {t("Popular places")}
                </p>
                <span className="hidden font-display text-[10px] text-ink-400 sm:block">
                  {t("Start typing for suggestions")}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={href(item.href)}
                      onClick={(event) => {
                        event.preventDefault();
                        openResult(item.href);
                      }}
                      className="group flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-4 transition-colors hover:border-jade-200 hover:bg-jade-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade-600"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-jade-50 text-jade-700 transition-colors group-hover:bg-jade-100">
                        <Icon className="size-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-[13px] font-semibold text-ink-950">
                          {t(item.title)}
                        </span>
                        <span className="mt-1 block text-[11px] leading-5 text-ink-500">
                          {t(item.description)}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : loading ? (
            <div className="grid min-h-44 place-items-center text-center">
              <div>
                <span className="mx-auto block size-7 animate-spin rounded-full border-2 border-ink-200 border-t-crimson-600" />
                <p className="mt-3 font-display text-[12px] text-ink-500">{t("Searching ArLAR…")}</p>
              </div>
            </div>
          ) : results.length ? (
            <div role="listbox" aria-label={t("Search suggestions")}>
              <div className="flex items-center justify-between px-2 pb-3 pt-1">
                <p className="font-display text-[10px] font-semibold tracking-[0.15em] text-ink-500 uppercase">
                  {t("Best matches")}
                </p>
                <span className="font-display text-[10px] text-ink-400">
                  {results.length} {t("suggestions")}
                </span>
              </div>
              <div className="space-y-1.5">
                {results.map((result, index) => {
                  const details = kindDetails[result.kind];
                  const Icon = details.icon;
                  const active = activeIndex === index;
                  return (
                    <Link
                      id={`header-search-result-${index}`}
                      role="option"
                      aria-selected={active}
                      key={result.id}
                      href={result.href}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={(event) => {
                        event.preventDefault();
                        selectResult(result);
                      }}
                      className={`group flex items-center gap-3 rounded-2xl border p-3 transition-colors sm:gap-4 sm:p-4 ${
                        active
                          ? "border-jade-200 bg-jade-50/70"
                          : "border-transparent bg-white hover:border-ink-100 hover:bg-white"
                      }`}
                    >
                      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${details.className}`}>
                        <Icon className="size-[19px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-display text-[9px] font-semibold tracking-[0.13em] text-crimson-700 uppercase">
                            {t(details.label)}
                          </span>
                          {result.meta ? (
                            <span className="font-display text-[9px] text-ink-400">{result.meta}</span>
                          ) : null}
                        </span>
                        <span className="mt-1 block truncate font-display text-[13px] font-semibold text-ink-950 sm:text-[14px]">
                          {result.title}
                        </span>
                        <span className="mt-1 line-clamp-1 block text-[11px] text-ink-500">
                          {t(result.description)}
                        </span>
                      </span>
                      <ArrowRight className="rtl-flip size-4 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-crimson-600" />
                    </Link>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={submitSearch}
                className="mt-3 flex w-full cursor-pointer items-center justify-between rounded-2xl border border-ink-100 bg-white px-4 py-3.5 text-left transition-colors hover:border-crimson-200 hover:bg-crimson-50/35"
              >
                <span className="font-display text-[12px] font-semibold text-ink-700">
                  {t("View all results for")} “{trimmedQuery}”
                </span>
                <ArrowRight className="rtl-flip size-4 text-crimson-600" />
              </button>
            </div>
          ) : (
            <div className="grid min-h-44 place-items-center px-4 text-center">
              <div>
                <span className="mx-auto grid size-11 place-items-center rounded-full bg-ink-100 text-ink-500">
                  <Search className="size-5" />
                </span>
                <p className="mt-3 font-display text-[14px] font-semibold text-ink-900">
                  {t("No quick matches yet")}
                </p>
                <p className="mt-1 text-[12px] text-ink-500">
                  {t("Press Search to check the complete website for")} “{trimmedQuery}”.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
      {selectedDoctor ? (
        <DoctorBiographyModal doctor={selectedDoctor} onClose={closeDoctor} />
      ) : null}
    </>
  );
}
