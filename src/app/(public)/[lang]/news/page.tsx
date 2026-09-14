import { createStaticPageMetadata } from "@/lib/seo";

import { NewsDirectory } from "@/components/news/news-directory";
import { PageHero } from "@/components/page-hero";
import { listPublicNewsArticleCardsAsync } from "@/lib/admin-news-repository";
import type { Locale } from "@/i18n/config";

export const generateMetadata = createStaticPageMetadata("/news");

export default async function NewsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const articles = await listPublicNewsArticleCardsAsync(lang);
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "ArLAR News" }]}
        title="ArLAR News"
        description="Announcements, recent events, professional updates, and stories from across the Arab rheumatology community."
        grainId="news-hero-grain"
      />

      <NewsDirectory articles={articles} />
    </main>
  );
}
