import { createStaticPageMetadata } from "@/lib/seo";

import { ArrowUpRight, ExternalLink, Globe } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import type { Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export const generateMetadata = createStaticPageMetadata("/events/related-links");

const rheumatologyLinks = [
  { name: "ILAR", detail: "International League of Associations for Rheumatology", href: "https://www.ilar.org/" },
  { name: "EULAR", detail: "European Alliance of Associations for Rheumatology", href: "https://www.eular.org/" },
  { name: "ACR", detail: "American College of Rheumatology", href: "https://www.rheumatology.org/" },
  { name: "APLAR", detail: "Asia Pacific League of Associations for Rheumatology", href: "https://www.aplar.org/" },
  { name: "AFLAR", detail: "African League of Associations for Rheumatology", href: "https://aflar.net/" },
  { name: "PANLAR", detail: "Pan American League of Associations for Rheumatology", href: "https://www.panlar.org/" },
  { name: "BSR", detail: "British Society for Rheumatology", href: "https://www.rheumatology.org.uk/" },
  { name: "SFR", detail: "French Society for Rheumatology", href: "https://sfr.larhumatologie.fr/" },
] as const;

const otherLinks = [
  { name: "WCO–IOF–ESCEO", detail: "World Congress on Osteoporosis, Osteoarthritis and Musculoskeletal Diseases", href: "https://www.wco-iof-esceo.org/" },
  { name: "IOF", detail: "International Osteoporosis Foundation", href: "https://www.iofbonehealth.org/" },
  { name: "Arthritis Foundation", detail: "Information, support, and advocacy for people living with arthritis", href: "https://www.arthritis.org/" },
] as const;

function ResourceCard({ link, locale }: { link: (typeof rheumatologyLinks)[number] | (typeof otherLinks)[number]; locale: Locale }) {
  const t = (source: string) => translate(locale, source);
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      className="group flex min-h-44 cursor-pointer flex-col rounded-[1.6rem] border border-ink-100 bg-white p-6 transition-[transform,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-jade-200"
    >
      <div className="flex items-start justify-between gap-5">
        <span className="grid size-10 place-items-center rounded-xl bg-jade-50 text-jade-700">
          <Globe className="size-4.5" />
        </span>
        <ExternalLink className="size-4 text-ink-300 transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-crimson-600" />
      </div>
      <h3 className="mt-6 font-display text-xl font-semibold tracking-[-0.025em] text-ink-950">
        {link.name}
      </h3>
      <p className="mt-2 text-[12.5px] leading-5 text-ink-500">{t(link.detail)}</p>
      <span className="mt-auto flex items-center gap-2 pt-5 font-display text-[12px] font-semibold text-jade-700">
        {t("Visit website")}
        <ArrowUpRight className="size-3.5" />
      </span>
    </a>
  );
}

export default async function RelatedLinksPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "Events & Congresses" },
          { label: "Related Links" },
        ]}
        title="Related Links"
        description="Trusted rheumatology associations and musculoskeletal health organizations from around the world."
        grainId="related-links-hero-grain"
      />

      <section className="bg-[#f5f8f7] py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-crimson-600" />
              <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-crimson-600 uppercase">
                {t("Rheumatology organizations")}
              </p>
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
              {t("Regional and international associations")}
            </h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {rheumatologyLinks.map((link) => <ResourceCard key={link.name} link={link} locale={lang} />)}
          </div>

          <div className="mt-14 border-t border-ink-150 pt-10">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink-950">
              {t("Other useful resources")}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {otherLinks.map((link) => <ResourceCard key={link.name} link={link} locale={lang} />)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
