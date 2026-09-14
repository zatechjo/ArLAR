import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";
import { listPublicNewsArticlesAsync } from "@/lib/admin-news-repository";
import { absoluteLocalizedUrl, languageAlternates } from "@/lib/seo";
import { getManagedSigDirectoryAsync } from "@/lib/sig-directory-repository";

export const revalidate = false;

const staticPaths = [
  "/",
  "/about",
  "/about/board",
  "/about/bylaws",
  "/about/media-group",
  "/about/president-message",
  "/about/scientific-committee",
  "/about/secretariat",
  "/college/about",
  "/college/events",
  "/college/members",
  "/congresses/arlar21",
  "/congresses/arlar21-replay",
  "/congresses/arlar23-replay",
  "/congresses/arlar27",
  "/congresses/arlar27/about-iraq",
  "/congresses/arlar27/abstracts",
  "/congresses/arlar27/committee",
  "/congresses/arlar27/faculty",
  "/congresses/arlar27/programme",
  "/congresses/arlar27/registration",
  "/congresses/arlar27/welcome",
  "/contact",
  "/education",
  "/events/international",
  "/events/members",
  "/events/related-links",
  "/members",
  "/news",
  "/privacy",
  "/professionals/e-bulletin",
  "/professionals/partners",
  "/professionals/publications",
  "/public-patients",
  "/special-interest-groups",
  "/terms",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, groups] = await Promise.all([
    listPublicNewsArticlesAsync("en"),
    getManagedSigDirectoryAsync("public"),
  ]);
  const datedNewsPaths = new Map(news.map((article) => [`/news/${article.slug}`, article.publishedAt]));
  const paths = [
    ...staticPaths,
    ...news.map((article) => `/news/${article.slug}` as const),
    ...groups.filter((group) => group.visible).map((group) => `/special-interest-groups/${group.slug}` as const),
  ];

  return paths.flatMap((path) => locales.map((locale) => ({
    url: absoluteLocalizedUrl(path, locale),
    lastModified: datedNewsPaths.get(path),
    changeFrequency: path === "/" ? "weekly" as const : path.startsWith("/news/") ? "monthly" as const : "yearly" as const,
    priority: path === "/" ? 1 : path === "/news" || path === "/education" ? 0.8 : path.startsWith("/news/") ? 0.7 : 0.6,
    alternates: {
      languages: languageAlternates(path),
    },
  })));
}
