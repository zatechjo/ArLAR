"use client";

import { useMemo, useState } from "react";

import { ChevronDown } from "@/components/icons";
import { NewsCard } from "@/components/news/news-directory";
import type { MemberNewsPost } from "@/data/member-news";
import { useTranslations } from "@/i18n/locale-context";

const PAGE_SIZE = 18;

export function MemberEventsDirectory({ posts }: { posts: MemberNewsPost[] }) {
  const { t } = useTranslations();
  const [country, setCountry] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const countries = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.countryTags))).sort(
      (left, right) => left.localeCompare(right),
    ),
    [posts],
  );
  const visiblePosts = useMemo(
    () => posts
      .filter((post) => country === "all" || post.countryTags.includes(country))
      .toSorted((left, right) => right.publishedAt.localeCompare(left.publishedAt)),
    [country, posts],
  );
  const displayedPosts = visiblePosts.slice(0, visibleCount);

  return (
    <section className="bg-[#f4f7f6]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:py-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-crimson-600" />
              <p className="font-display text-[10.5px] font-semibold tracking-[0.18em] text-crimson-700 uppercase">
                {t("Member news")}
              </p>
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
              {t("News from member countries.")}
            </h2>
          </div>
          <p aria-live="polite" className="font-display text-[11px] text-ink-400">
            {t("Showing")} <strong className="font-semibold text-ink-700">{displayedPosts.length}</strong> {t("of")} {visiblePosts.length} {t("matching stories")}
          </p>
        </div>

        <label className="relative mt-7 block max-w-xs">
          <span className="sr-only">{t("Filter by country")}</span>
          <select
            value={country}
            onChange={(event) => {
              setCountry(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-ink-100 bg-white px-4 pe-10 font-display text-[12px] font-semibold text-ink-600 outline-none transition-[border-color,box-shadow] focus:border-jade-400 focus:shadow-[0_0_0_3px_rgba(0,149,59,0.08)]"
          >
            <option value="all">{t("All member countries")}</option>
            {countries.map((name) => {
              const count = posts.filter((post) => post.countryTags.includes(name)).length;
              return (
                <option key={name} value={name}>
                  {t(name)} ({count})
                </option>
              );
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
        </label>

        {visiblePosts.length > 0 ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedPosts.map((post) => (
              <NewsCard
                key={post.slug}
                article={post}
                className="min-h-[31rem]"
                eyebrow={
                  <div className="flex flex-wrap gap-1.5">
                    {post.countryTags.map((countryTag) => (
                      <span
                        key={countryTag}
                        className="rounded-full border border-jade-100 bg-jade-50 px-2.5 py-1 font-display text-[9px] font-semibold tracking-[0.09em] text-jade-800 uppercase"
                      >
                        {t(countryTag)}
                      </span>
                    ))}
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-[1.6rem] border border-ink-100 bg-white px-6 py-16 text-center">
            <h3 className="font-display text-xl font-semibold text-ink-950">
              {t("No stories found")}
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-ink-500">
              {t("Try another country from the filter.")}
            </p>
          </div>
        )}

        {displayedPosts.length < visiblePosts.length ? (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="min-h-11 cursor-pointer rounded-full bg-ink-950 px-6 font-display text-[12px] font-semibold text-white transition-colors hover:bg-crimson-700"
            >
              {t("Load more news")}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
