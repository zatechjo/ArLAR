import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";

import { Arlar27PageHero } from "@/components/congresses/arlar27/page-hero";
import {
  Banknote,
  Languages,
  Passport,
  Plane,
  PlugIcon,
  Sun,
} from "@/components/congresses/arlar27/iraq-guide-icons";
import { Arlar27ExternalAwareLink } from "@/components/congresses/arlar27/external-aware-link";
import { IraqGallery } from "@/components/congresses/arlar27/iraq-gallery";
import { ArrowRight, Clock3, ExternalLink, Globe, MapPin, Phone } from "@/components/icons";
import { arlar27 } from "@/data/arlar27";
import { iraqGallery } from "@/data/iraq-gallery";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { getManagedArlar27AboutAsync } from "@/lib/arlar27-admin-repository";
import { getArlar27ExternalLinksAsync } from "@/lib/arlar27-external-links";

export const generateMetadata = createStaticPageMetadata("/congresses/arlar27/about-iraq");

/**
 * Icon keys an "Iraq at a glance" card can choose in the admin panel. An
 * unrecognised key falls back to the globe rather than rendering nothing.
 */
const ESSENTIAL_ICONS: Record<string, (props: { className?: string }) => React.ReactElement> = {
  currency: Banknote,
  languages: Languages,
  clock: Clock3,
  power: PlugIcon,
  phone: Phone,
  plane: Plane,
  globe: Globe,
  pin: MapPin,
};

export default async function Arlar27AboutIraqPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const [about, externalLinks] = await Promise.all([
    getManagedArlar27AboutAsync(arlar27.heroImage),
    getArlar27ExternalLinksAsync(),
  ]);

  return (
    <main>
      <Arlar27PageHero title={about.pageTitle} description={about.pageDescription} />

      {/* Admin-managed introduction */}
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-14">
          <div className="relative min-h-[29rem] overflow-hidden rounded-[2rem] bg-[#08253e]">
            <Image
              src={about.heroImage || arlar27.heroImage}
              alt={t("Baghdad skyline beside the Tigris at sunset")}
              fill
              sizes="(min-width: 1024px) 56vw, 100vw"
              className="object-cover object-left"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#041522] to-transparent p-7 pt-24 text-white sm:p-9">
              <div className="flex items-center gap-2 text-[#ffd45c]">
                <MapPin className="size-4" />
                <span className="font-display text-[10px] font-semibold tracking-[0.14em] uppercase">
                  {t(about.destinationLabel)}
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-semibold">{t(about.destination)}</p>
            </div>
          </div>
          <div>
            <Globe className="size-9 text-[#c4a45d]" />
            <h2 className="mt-6 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-ink-950 sm:text-4xl">
              {t(about.heading)}
            </h2>
            {about.paragraphs.map((paragraph, index) => (
              <p key={paragraph} className={`${index === 0 ? "mt-6" : "mt-5"} text-[14px] leading-7 text-ink-600`}>
                {t(paragraph)}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Country essentials — shares one tinted band with the gallery below,
          so there is no rule between the two blocks. */}
      <section className="border-t border-[#e3e9e9] bg-[#f7f9f9] pt-12 pb-0 lg:pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-[#0d4c7a] uppercase">
              {t(about.essentials.eyebrow)}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-ink-950 sm:text-4xl">
              {t(about.essentials.title)}
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-ink-600">
              {t(about.essentials.intro)}
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {about.essentials.cards.map(({ id, icon, label, value, note }) => {
              const Icon = ESSENTIAL_ICONS[icon] ?? Globe;
              return (
                <article
                  key={id}
                  className="group rounded-[1.4rem] border border-[#dfe6e6] bg-white p-6 transition-colors duration-300 hover:border-[#c4a45d]"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-[#f1f5f7] text-[#0d4c7a] transition-colors duration-300 group-hover:bg-[#0d4c7a] group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-4 font-display text-[10px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
                    {t(label)}
                  </p>
                  <p className="mt-1.5 font-display text-xl font-semibold text-ink-950">{t(value)}</p>
                  <p className="mt-2 text-[12px] leading-6 text-ink-500">{t(note)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Destination gallery */}
      <section className="border-b border-[#e3e9e9] bg-[#f7f9f9] pt-14 pb-12 lg:pt-16 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-[#0d4c7a] uppercase">
              {t(about.gallery.eyebrow)}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-ink-950 sm:text-4xl">
              {t(about.gallery.title)}
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-ink-600">
              {t(about.gallery.intro)}
            </p>
          </div>
        </div>
        <div className="mt-8">
          <IraqGallery images={iraqGallery} />
        </div>
      </section>

      {/* Entry and visas */}
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-[2rem] border border-[#dfe6e6]">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative bg-[#08253e] p-8 text-white sm:p-10">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(196,164,93,0.28),transparent_46%)]"
                />
                <div className="relative">
                  <Passport className="size-9 text-[#ffd45c]" />
                  <p className="mt-6 font-display text-[10px] font-semibold tracking-[0.17em] text-[#ffd45c] uppercase">
                    {t(about.visa.eyebrow)}
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.035em] sm:text-4xl">
                    {t(about.visa.title)}
                  </h2>
                  <p className="mt-4 text-[13.5px] leading-7 text-white/70">
                    {t(about.visa.lead)}
                  </p>
                  <a
                    href={about.visa.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#ffd45c] px-5 font-display text-[12.5px] font-semibold text-[#08253e] transition-colors hover:bg-white"
                  >
                    {t(about.visa.ctaLabel)}
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              </div>

              <div className="bg-white p-8 sm:p-10">
                <div className="grid gap-6 sm:grid-cols-2">
                  {about.visa.facts.map((fact, index) => (
                    <div key={fact.id}>
                      <span className="font-display text-[10px] font-semibold tracking-[0.14em] text-[#a9873e]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-2 font-display text-[15px] font-semibold text-ink-950">{t(fact.title)}</h3>
                      <p className="mt-2 text-[12.5px] leading-6 text-ink-500">{t(fact.text)}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-8 rounded-xl border border-[#efe3c8] bg-[#fdf9ef] px-4 py-3 text-[12px] leading-6 text-[#7a6327]">
                  {t(about.visa.note)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weather */}
      <section className="bg-[#f7f9f9] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 rounded-[2rem] border border-[#dfe6e6] bg-white p-8 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
            <div>
              <Sun className="size-9 text-[#c4a45d]" />
              <p className="mt-6 font-display text-[10px] font-semibold tracking-[0.17em] text-[#0d4c7a] uppercase">
                {t(about.weather.eyebrow)}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-ink-950 sm:text-4xl">
                {t(about.weather.title)}
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-ink-600">
                {t(about.weather.intro)}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {about.weather.stats.map((stat) => (
                <div key={stat.id} className="rounded-[1.3rem] border border-[#e6ecec] bg-[#f7f9f9] p-5">
                  <dt className="font-display text-[10px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
                    {t(stat.label)}
                  </dt>
                  <dd className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-ink-950">
                    {t(stat.value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Admin-managed planning cards */}
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-[#0d4c7a] uppercase">
              {t("Plan your visit")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-ink-950 sm:text-4xl">
              {t(about.planningTitle)}
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {about.planningCards.map((card, index) => (
              <article key={card.id} className="rounded-[1.55rem] border border-[#dce3e2] bg-white p-6">
                <span className="font-display text-[10px] font-semibold tracking-[0.14em] text-[#a9873e]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink-950">{t(card.title)}</h3>
                <p className="mt-3 text-[12px] leading-6 text-ink-500">{t(card.text)}</p>
              </article>
            ))}
          </div>
          <Arlar27ExternalAwareLink
            path="/congresses/arlar27/registration"
            href={localizePath("/congresses/arlar27/registration", lang)}
            externalLinks={externalLinks}
            className="mt-8 inline-flex items-center gap-2 font-display text-[12px] font-semibold text-[#0d4c7a]"
          >
            {t("Registration information")} <ArrowRight className="rtl-flip size-4" />
          </Arlar27ExternalAwareLink>
        </div>
      </section>
    </main>
  );
}
