import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { CountryFlag } from "@/components/about/country-flag";
import { ExternalLink, Globe } from "@/components/icons";
import {
  Facebook,
  Instagram,
  LinkedIn,
  X,
  YouTube,
} from "@/components/social-icons";
import societiesData from "@/data/national-societies.json";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import { getManagedMemberCountriesAsync } from "@/lib/member-societies-repository";
import { getPublishedSiteContent } from "@/lib/site-content-repository";
import type { Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export const generateMetadata = createStaticPageMetadata("/members");

type Social = { platform: string; url: string; verified: boolean };

type Society = {
  id: string;
  name: string;
  abbreviation: string;
  websiteUrl: string | null;
  websiteDisplay: string;
  socials: Social[];
};

type Country = {
  country: string;
  countryCode: string;
  slug: string;
  flag: string;
  background: string;
  backgroundCredit: string;
  societies: Society[];
};

const socialIcons: Record<
  string,
  (props: { className?: string }) => React.ReactElement
> = {
  Facebook,
  Instagram,
  X,
  LinkedIn,
  YouTube,
};

/** Brand colours on hover, so each icon is obvious at a glance. */
const socialHover: Record<string, string> = {
  Facebook: "hover:border-[#1877F2]/30 hover:bg-[#1877F2]/10 hover:text-[#1877F2]",
  Instagram: "hover:border-[#E1306C]/30 hover:bg-[#E1306C]/10 hover:text-[#E1306C]",
  X: "hover:border-ink-900/25 hover:bg-ink-900/8 hover:text-ink-950",
  LinkedIn: "hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
  YouTube: "hover:border-[#FF0000]/30 hover:bg-[#FF0000]/10 hover:text-[#FF0000]",
};

function SocietyRow({ society, locale }: { society: Society; locale: Locale }) {
  const t = (source: string) => translate(locale, source);
  return (
    <div className="border-t border-ink-100 pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h3 className="font-display text-[16.5px] font-semibold leading-snug tracking-[-0.015em] text-ink-950">
          {t(society.name)}
        </h3>
        {society.abbreviation ? (
          <span className="rounded-md bg-ink-50 px-2 py-0.5 font-display text-[10px] font-semibold tracking-[0.08em] text-ink-500 ring-1 ring-inset ring-ink-100">
            {society.abbreviation}
          </span>
        ) : null}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
        {society.websiteUrl ? (
          <a
            href={society.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="group/link inline-flex items-center gap-2 font-display text-[12.5px] font-semibold text-jade-700 transition-colors hover:text-jade-800"
          >
            <Globe className="size-3.5 shrink-0" />
            {society.websiteDisplay}
            <ExternalLink className="size-3 opacity-0 transition-opacity group-hover/link:opacity-100" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-300">
            <Globe className="size-3.5 shrink-0" />
            {t("Website not listed")}
          </span>
        )}

        {society.socials.length > 0 ? (
          <span className="flex items-center gap-1.5">
            {society.socials.map((social) => {
              const Icon = socialIcons[social.platform] ?? Globe;

              return (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${society.name} on ${social.platform}`}
                  className={`grid size-9 place-items-center rounded-lg border border-ink-100 bg-white text-ink-400 transition-colors ${
                    socialHover[social.platform] ?? "hover:text-ink-900"
                  }`}
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CountryCard({ entry, locale }: { entry: Country; locale: Locale }) {
  const t = (source: string) => translate(locale, source);
  const backgroundSrc = entry.background.startsWith("/") || /^https?:\/\//i.test(entry.background)
    ? entry.background
    : `/images/national-societies/backgrounds/${entry.background}`;

  return (
    <article
      id={entry.slug}
      className="country-card group flex min-h-full scroll-mt-56 flex-col overflow-hidden rounded-[1.6rem] border border-ink-100 bg-white transition-[border-color,box-shadow] duration-300 hover:border-ink-200 hover:shadow-xl hover:shadow-ink-950/6"
    >
      <div className="relative aspect-[2/1] overflow-hidden bg-ink-100">
        <Image
          src={backgroundSrc}
          alt={t(entry.country)}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/25 to-transparent"
        />

        <div className="absolute inset-x-5 bottom-4 flex items-center gap-3">
          <CountryFlag filename={entry.flag} />
          <h2 className="font-display text-[21px] font-semibold leading-tight tracking-[-0.02em] text-white">
            {t(entry.country)}
          </h2>
        </div>

      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        {entry.societies.map((society) => (
          <SocietyRow key={society.id} society={society} locale={locale} />
        ))}
      </div>
    </article>
  );
}

export default async function MembersPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const societyPage = await getPublishedSiteContent("members", "national-societies", societiesData, lang);
  const countries = (await filterDeletedAdminRecordsAsync(
    "member-countries",
    (await getManagedMemberCountriesAsync()).map((country) => ({ ...country, id: country.slug })),
  )).map(async (country) => ({
    ...country,
    societies: await filterDeletedAdminRecordsAsync("member-societies", country.societies),
  }));
  const resolvedCountries = await Promise.all(countries) as Country[];
  const societyCount = resolvedCountries.reduce(
    (total, entry) => total + entry.societies.length,
    0,
  );
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "ArLAR Members" }]}
        title="ArLAR Members"
        description="The national rheumatology societies that make up ArLAR, from the Gulf to North Africa."
        grainId="members-grain"
      />

      {/* Intro */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-20">
        <div
          aria-hidden
          className="absolute -left-44 top-16 size-80 rounded-full bg-crimson-50/60 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-crimson-600" />
              <p className="font-display text-[11px] font-semibold tracking-[0.17em] text-ink-500 uppercase">
                {t("Our member societies")}
              </p>
            </div>
            <h2 className="mt-5 max-w-xl font-display text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink-950 sm:text-4xl">
              {t("The premier rheumatology societies of the")}{" "}
              <span className="text-crimson-600">{t("Arab world.")}</span>
            </h2>
            <div className="mt-6 space-y-5 text-[15px] leading-7 text-ink-500">
              {societyPage.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{t(paragraph)}</p>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-ink-100 bg-[#fafbfc]">
            <Image
              src="/images/national-societies/page/arlar-members-intro.png"
              alt={t("The national societies that make up ArLAR")}
              width={900}
              height={871}
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* Country directory */}
      <section className="bg-[#fafbfc] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-jade-600" />
                <p className="font-display text-[11px] font-semibold tracking-[0.17em] text-ink-500 uppercase">
                  {t("The directory")}
                </p>
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink-950 sm:text-4xl">
                {societyCount} {t("societies")}{lang === "ar" ? "،" : ","} {resolvedCountries.length} {t("countries")}
              </h2>
            </div>
          </div>

          {/* Country jump links */}
          <nav
            aria-label={t("Jump to a country")}
            className="mt-8 flex flex-wrap gap-2"
          >
            {resolvedCountries.map((entry) => (
              <a
                key={entry.slug}
                href={`#${entry.slug}`}
                className="inline-flex items-center rounded-lg border border-ink-100 bg-white px-3 py-2 font-display text-[12px] font-semibold text-ink-600 transition-colors hover:border-jade-200 hover:bg-jade-50 hover:text-jade-800"
              >
                {t(entry.country)}
              </a>
            ))}
          </nav>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resolvedCountries.map((entry) => (
              <CountryCard key={entry.slug} entry={entry} locale={lang} />
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
