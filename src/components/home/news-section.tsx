import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import type { NewsArticle } from "@/data/news";
import { listPublicNewsArticlesAsync } from "@/lib/admin-news-repository";
import { localizePath, type Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";

type NewsSectionProps = {
  locale?: Locale;
  posts?: NewsArticle[];
  id?: string;
  eyebrow?: string;
  title?: string;
  highlightedTitle?: string;
  description?: string;
  linkHref?: string;
  linkLabel?: string;
};

export async function NewsSection({
  locale = "en",
  posts,
  id = "latest-news",
  eyebrow = "Latest news",
  title = "What's happening across",
  highlightedTitle = "ArLAR.",
  description =
    "Featured stories, clinical updates, and community announcements from across the Arab rheumatology network.",
  linkHref = "/news",
  linkLabel = "View all news",
}: NewsSectionProps = {}) {
  const t = (source: string) => translate(locale, source);
  const href = (path: string) => localizePath(path, locale);
  const visiblePosts = posts || (await listPublicNewsArticlesAsync(locale)).slice(0, 3);
  return (
    <section
      id={id}
      className="relative overflow-hidden bg-white py-20 lg:py-28"
    >
      <div
        aria-hidden
        className="absolute -left-40 top-32 size-80 rounded-full bg-crimson-50/70 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-48 bottom-10 size-96 rounded-full bg-jade-50/70 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-7">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-crimson-600" />
              <p className="font-display text-[11px] font-semibold tracking-[0.17em] text-ink-500 uppercase">
                {t(eyebrow)}
              </p>
            </div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-5xl">
              {t(title)}{" "}
              <span className="text-crimson-600">{highlightedTitle}</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-ink-500">
              {t(description)}
            </p>
          </div>
          <Link
            href={href(linkHref)}
            className="group inline-flex items-center gap-2 font-display text-[13px] font-semibold text-ink-800 transition-colors hover:text-crimson-600"
          >
            {t(linkLabel)}
            <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {visiblePosts.map((post) => (
            <Link
              key={post.slug}
              href={href(`/news/${post.slug}`)}
              className="group flex min-h-full flex-col overflow-hidden rounded-[1.6rem] border border-ink-100 bg-white transition-[border-color,background-color] duration-300 hover:border-ink-200 hover:bg-[#fbfcfc]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink-950/30 via-transparent to-ink-950/5"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3">
                  <span className="h-px w-7 bg-crimson-600" />
                  <p className="font-display text-[9px] font-semibold tracking-[0.13em] text-ink-400 uppercase">
                    {post.dateLabel}
                  </p>
                </div>
                <h3 className="mt-4 font-display text-[19px] font-semibold leading-snug tracking-[-0.015em] text-ink-950 transition-colors group-hover:text-crimson-600">
                  {post.title}
                </h3>
                <p className="mt-3 text-[13px] leading-6 text-ink-500">
                  {post.excerpt}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[12px] font-semibold text-jade-700">
                  {t("Read more")}
                  <ArrowRight className="rtl-flip size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
