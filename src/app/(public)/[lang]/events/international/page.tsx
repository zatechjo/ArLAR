import { createStaticPageMetadata } from "@/lib/seo";
import Link from "next/link";

import { ArrowRight, CalendarDays, Globe } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export const generateMetadata = createStaticPageMetadata("/events/international");

export default async function InternationalEventsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "Events & Congresses" },
          { label: "International Events" },
        ]}
        title="International Events & Congresses"
        description="A curated calendar of international rheumatology meetings and congresses."
        grainId="international-events-hero-grain"
      />

      <section className="bg-[#f5f8f7] py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[1.8rem] border border-ink-100 bg-white px-6 py-11 sm:px-10 lg:px-14 lg:py-14">
            <div
              aria-hidden
              className="absolute -right-24 -top-28 size-80 rounded-full border border-jade-100"
            />
            <div
              aria-hidden
              className="absolute -right-10 -top-10 size-44 rounded-full border border-crimson-100"
            />
            <div className="relative grid items-center gap-9 lg:grid-cols-[auto_1fr_auto]">
              <div className="grid size-16 place-items-center rounded-2xl bg-[#07131f] text-jade-300">
                <Globe className="size-7" />
              </div>
              <div className="max-w-2xl">
                <p className="flex items-center gap-2 font-display text-[10px] font-semibold tracking-[0.17em] text-crimson-600 uppercase">
                  <CalendarDays className="size-3.5" />
                  {t("Calendar in preparation")}
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950">
                  {t("Coming soon")}
                </h2>
                <p className="mt-3 text-[14px] leading-7 text-ink-500">
                  {t("International event dates and congress details will be published here as they become available.")}
                </p>
              </div>
              <Link
                href={localizePath("/events/related-links", lang)}
                className="group inline-flex min-h-12 w-fit cursor-pointer items-center gap-3 rounded-full border border-ink-200 px-5 font-display text-[13px] font-semibold text-ink-800 transition-colors hover:border-jade-300 hover:text-jade-800"
              >
                {t("Browse related links")}
                <ArrowRight className="rtl-flip size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
