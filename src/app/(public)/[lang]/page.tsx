import { createStaticPageMetadata } from "@/lib/seo";

export const generateMetadata = createStaticPageMetadata("/");

import { Hero } from "@/components/home/hero";
import { QuickLinksSection } from "@/components/home/quick-links-section";
import { UpcomingEventsSection } from "@/components/home/upcoming-events-section";
import { CollegeSection } from "@/components/home/college-section";
import { SpecialInterestGroupsSection } from "@/components/home/special-interest-groups-section";
import { NewsSection } from "@/components/home/news-section";
import { isLocale, type Locale } from "@/i18n/config";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return (
    <main>
      <Hero />
      <QuickLinksSection />
      <UpcomingEventsSection />
      <CollegeSection locale={locale} />
      <SpecialInterestGroupsSection locale={locale} />
      <NewsSection locale={locale} />
    </main>
  );
}
