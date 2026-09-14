import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { ArticleShare } from "@/components/news/article-share";
import { RichContentRenderer } from "@/components/news/rich-content";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
} from "@/components/icons";
import {
  newsArticles,
  type NewsArticle,
} from "@/data/news";
import { getPublicNewsArticleAsync, listPublicNewsArticlesAsync } from "@/lib/admin-news-repository";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { absoluteLocalizedUrl, buildLocalizedMetadata, SITE_URL } from "@/lib/seo";

type NewsArticlePageProps = {
  params: Promise<{ lang: Locale; slug: string }>;
};

// Metadata and page rendering ask for the same article. Memoizing within the
// request prevents two complete Supabase news reads for one URL.
const getNewsArticle = cache(getPublicNewsArticleAsync);

export function generateStaticParams() {
  // Prebuild recent stories; older and newly published stories are generated
  // on first real visit and cached. This avoids ~1,000 article renders and
  // thousands of database reads on every deployment.
  return newsArticles.slice(0, 24).map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const article = await getNewsArticle(slug, lang);

  if (!article) return {};
  const path = `/news/${article.slug}`;
  const baseMetadata = buildLocalizedMetadata({
    locale: lang,
    path,
    title: article.title,
    description: article.excerpt,
    image: {
      url: article.image,
      width: article.imageWidth,
      height: article.imageHeight,
      alt: article.imageAlt,
    },
  });

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { lang, slug } = await params;
  const article = await getNewsArticle(slug, lang);

  if (!article) {
    // Do not turn arbitrary bot-generated slugs into permanent ISR cache
    // entries. Known articles stay prerendered; only a missing slug waits for
    // request time and returns an uncached 404.
    await connection();
    notFound();
  }

  const moreNews = (await listPublicNewsArticlesAsync(lang))
    .filter((candidate) => candidate.slug !== article.slug)
    .slice(0, 5);

  const t = (source: string) => translate(lang, source);
  const localizedBody = lang === "ar"
    ? article.translations?.arabic.body.trim()
    : lang === "fr"
      ? article.translations?.french.body.trim()
      : "";
  const localizedRichContent = lang === "ar"
    ? article.translations?.arabic.richContent
    : undefined;
  const articlePath = `/news/${article.slug}`;
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [new URL(article.image, SITE_URL).toString()],
    datePublished: article.publishedAt,
    mainEntityOfPage: absoluteLocalizedUrl(articlePath, lang),
    inLanguage: lang,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replaceAll("<", "\\u003c") }}
      />
      <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:py-16">
        <Link
          href={localizePath("/news", lang)}
          className="group inline-flex items-center gap-2 font-display text-[12px] font-semibold text-jade-700 transition-colors hover:text-crimson-700"
        >
          <ArrowRight className="rtl-flip size-4 rotate-180 transition-transform group-hover:-translate-x-1" />
          {t("Back to news")}
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14">
          <div className="min-w-0 max-w-[51.25rem]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-display text-[10px] font-semibold tracking-[0.12em] text-ink-400 uppercase">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-3.5 text-crimson-600" />
                  <time dateTime={article.publishedAt}>{article.dateLabel}</time>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-3.5 text-jade-700" />
                  {article.minutesToRead} {t("min read")}
                </span>
              </div>

              <ArticleShare
                path={localizePath(`/news/${article.slug}`, lang)}
                title={article.title}
              />
            </div>

            <h1 className="mt-4 break-words text-pretty font-display text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink-950 [overflow-wrap:anywhere] sm:text-4xl">
              {article.title}
            </h1>

            <div className="mt-5 h-px bg-ink-100" />

            <div className="mt-6">
              {localizedRichContent ? (
                <RichContentRenderer content={localizedRichContent} />
              ) : localizedBody ? (
                <div
                  className="news-translated-content min-w-0 space-y-4 break-words text-[16px] leading-8 text-ink-700 [overflow-wrap:anywhere] sm:text-[17px] [&_a]:text-jade-700 [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-s-2 [&_blockquote]:border-jade-300 [&_blockquote]:ps-5 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-7 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_li]:ms-5 [&_ol]:list-decimal [&_p]:my-4 [&_ul]:list-disc"
                  dangerouslySetInnerHTML={{ __html: localizedBody }}
                />
              ) : (
                <RichContentRenderer content={article.richContent} />
              )}
            </div>

            {article.categories.length ? (
              <div className="mt-10 border-t border-ink-100 pt-5">
                <div className="flex flex-wrap gap-2">
                  {article.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full border border-ink-100 bg-[#f7f9f8] px-3 py-1.5 font-display text-[9.5px] font-semibold tracking-[0.1em] text-ink-500 uppercase"
                    >
                      {t(category)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-56 lg:self-start">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-crimson-600" />
              <h2 className="font-display text-[10px] font-semibold tracking-[0.18em] text-crimson-700 uppercase">
                {t("More news")}
              </h2>
            </div>
            <div className="mt-5 divide-y divide-ink-100">
              {moreNews.map((item) => (
                <SidebarArticle key={item.slug} article={item} locale={lang} />
              ))}
            </div>
            <Link
              href={localizePath("/news", lang)}
              className="group mt-6 inline-flex items-center gap-2 font-display text-[12px] font-semibold text-jade-700 transition-colors hover:text-crimson-700"
            >
              {t("All news")}
              <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </aside>
        </div>
      </article>
    </main>
  );
}

function SidebarArticle({ article, locale }: { article: NewsArticle; locale: Locale }) {
  return (
    <Link
      href={localizePath(`/news/${article.slug}`, locale)}
      className="group flex gap-3.5 py-4 first:pt-0"
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-[#f7f8f8]">
        <Image
          src={article.image}
          alt=""
          fill
          sizes="80px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0">
        <time
          dateTime={article.publishedAt}
          className="font-display text-[9px] font-semibold tracking-[0.1em] text-ink-400 uppercase"
        >
          {article.dateLabel}
        </time>
        <h3 className="mt-1 line-clamp-3 font-display text-[13px] font-semibold leading-snug text-ink-900 transition-colors group-hover:text-crimson-700">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}
