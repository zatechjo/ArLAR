"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  CalendarDays,
  ChevronDown,
  Search,
} from "@/components/icons";
import type { NewsCardArticle } from "@/data/news";
import { useTranslations } from "@/i18n/locale-context";

type SortOrder = "newest" | "oldest";
const PAGE_SIZE = 18;

export function NewsDirectory({ articles }: { articles: NewsCardArticle[] }) {
  const { t } = useTranslations();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [year, setYear] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () =>
      Array.from(new Set(articles.flatMap((article) => article.categories))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [articles],
  );
  const years = useMemo(
    () =>
      Array.from(
        new Set(articles.map((article) => article.publishedAt.slice(0, 4))),
      ).sort((left, right) => right.localeCompare(left)),
    [articles],
  );

  const visibleArticles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return articles
      .filter((article) => {
        const matchesSearch =
          !query ||
          article.title.toLocaleLowerCase().includes(query) ||
          article.excerpt.toLocaleLowerCase().includes(query) ||
          article.categories.some((item) =>
            item.toLocaleLowerCase().includes(query),
          );
        const matchesCategory =
          category === "all" || article.categories.includes(category);
        const matchesYear =
          year === "all" || article.publishedAt.startsWith(year);

        return matchesSearch && matchesCategory && matchesYear;
      })
      .toSorted((left, right) =>
        sortOrder === "newest"
          ? right.publishedAt.localeCompare(left.publishedAt)
          : left.publishedAt.localeCompare(right.publishedAt),
      );
  }, [articles, category, search, sortOrder, year]);
  const displayedArticles = visibleArticles.slice(0, visibleCount);
  const hasMoreArticles = displayedArticles.length < visibleArticles.length;

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMoreArticles) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + PAGE_SIZE, visibleArticles.length),
          );
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [hasMoreArticles, visibleArticles.length, visibleCount]);

  const hasFilters = search || category !== "all" || year !== "all";

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setYear("all");
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section className="bg-[#f4f7f6]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:py-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-crimson-600" />
              <p className="font-display text-[10.5px] font-semibold tracking-[0.18em] text-crimson-700 uppercase">
                {t("News archive")}
              </p>
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
              {t("Explore every update.")}
            </h2>
          </div>
          <p aria-live="polite" className="font-display text-[11px] text-ink-400">
            {t("Showing")} <strong className="font-semibold text-ink-700">{displayedArticles.length}</strong> {t("of")} {visibleArticles.length} {t("matching stories")}
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(18rem,1.6fr)_minmax(10rem,0.8fr)_minmax(8rem,0.55fr)_minmax(10rem,0.72fr)]">
          <label className="relative block sm:col-span-2 lg:col-span-1">
            <span className="sr-only">{t("Search news")}</span>
            <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder={t("Search by title, topic, or keyword")}
              className="h-12 w-full rounded-xl border border-ink-100 bg-white ps-11 pe-4 font-display text-[12.5px] text-ink-900 outline-none transition-[border-color,box-shadow] placeholder:text-ink-300 focus:border-jade-400 focus:shadow-[0_0_0_3px_rgba(0,149,59,0.08)]"
            />
          </label>

          <ArchiveSelect
            label="Filter by topic"
            value={category}
            onChange={(value) => {
              setCategory(value);
              setVisibleCount(PAGE_SIZE);
            }}
          >
            <option value="all">{t("All topics")}</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {t(item)}
              </option>
            ))}
          </ArchiveSelect>

          <ArchiveSelect label="Filter by year" value={year} onChange={(value) => {
            setYear(value);
            setVisibleCount(PAGE_SIZE);
          }}>
            <option value="all">{t("All years")}</option>
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </ArchiveSelect>

          <ArchiveSelect
            label="Sort news"
            value={sortOrder}
            onChange={(value) => {
              setSortOrder(value as SortOrder);
              setVisibleCount(PAGE_SIZE);
            }}
          >
            <option value="newest">{t("Newest first")}</option>
            <option value="oldest">{t("Oldest first")}</option>
          </ArchiveSelect>
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 cursor-pointer font-display text-[11px] font-semibold text-jade-700 underline decoration-jade-300 underline-offset-4 transition-colors hover:text-crimson-700"
          >
            {t("Clear search and filters")}
          </button>
        ) : null}

        {visibleArticles.length > 0 ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedArticles.map((article) => (
              <NewsCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-[1.6rem] border border-ink-100 bg-white px-6 py-16 text-center">
            <h3 className="font-display text-xl font-semibold text-ink-950">
              {t("No stories found")}
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-ink-500">
              {t("Try a different keyword or clear the selected filters.")}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 cursor-pointer font-display text-[12px] font-semibold text-jade-700 transition-colors hover:text-crimson-700"
            >
              {t("Clear filters")}
            </button>
          </div>
        )}

        {hasMoreArticles ? (
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
    </section>
  );
}

function ArchiveSelect({
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
      <span className="sr-only">{t(label)}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-ink-100 bg-white px-4 pe-10 font-display text-[12px] font-semibold text-ink-600 outline-none transition-[border-color,box-shadow] focus:border-jade-400 focus:shadow-[0_0_0_3px_rgba(0,149,59,0.08)]"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
    </label>
  );
}

export function NewsCard({
  article,
  eyebrow,
  className = "",
}: {
  article: NewsCardArticle;
  eyebrow?: ReactNode;
  className?: string;
}) {
  const { href } = useTranslations();
  return (
    <Link
      href={href(`/news/${article.slug}`)}
      className={`group flex min-h-full flex-col overflow-hidden rounded-[1.6rem] border border-ink-100 bg-white transition-[border-color,background-color] duration-300 hover:border-ink-200 hover:bg-[#fbfcfc] ${className}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f7f8f8]">
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        {eyebrow ? <div className="mb-3">{eyebrow}</div> : null}
        <p className="inline-flex items-center gap-2 font-display text-[10px] font-semibold tracking-[0.12em] text-ink-400 uppercase">
          <CalendarDays className="size-3.5 text-crimson-600" />
          <time dateTime={article.publishedAt}>{article.dateLabel}</time>
        </p>
        <h3 className="mt-3 font-display text-[19px] font-semibold leading-snug tracking-[-0.015em] text-ink-950 transition-colors group-hover:text-crimson-700">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-[13px] leading-6 text-ink-500">
          {article.excerpt}
        </p>
      </div>
    </Link>
  );
}
