import { createStaticPageMetadata } from "@/lib/seo";

export const generateMetadata = createStaticPageMetadata("/congresses/arlar27");

import Image from "next/image";
import Link from "next/link";

import { Arlar27Countdown } from "@/components/congresses/arlar27/countdown";
import { Arlar27LandingMotion } from "@/components/congresses/arlar27/landing-motion";
import { Arlar27ExternalAwareLink } from "@/components/congresses/arlar27/external-aware-link";
import { Arlar27MenuBar } from "@/components/congresses/arlar27/microsite-nav";
import { NewsSection } from "@/components/home/news-section";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Quote,
} from "@/components/icons";
import { arlar27, arlar27Days, arlar27GatewayCards, arlar27Navigation } from "@/data/arlar27";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { listPublicNewsArticlesAsync } from "@/lib/admin-news-repository";
import { getArlar27ExternalLinksAsync } from "@/lib/arlar27-external-links";
import { getPublishedSiteContent } from "@/lib/site-content-repository";

export default async function Arlar27Page({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const isRtl = lang === "ar";
  const t = (source: string) => translate(lang, source);
  const href = (path: string) => localizePath(path, lang);
  const [news, congress, navigation, days, gatewayCards, externalLinks] = await Promise.all([
    listPublicNewsArticlesAsync(lang),
    getPublishedSiteContent("arlar27", "overview", arlar27),
    getPublishedSiteContent("arlar27", "navigation", arlar27Navigation),
    getPublishedSiteContent("arlar27", "days", arlar27Days),
    getPublishedSiteContent("arlar27", "gateway-cards", arlar27GatewayCards),
    getArlar27ExternalLinksAsync(),
  ]);
  const latestArlar27News = news
    .filter((article) =>
      [article.title, article.excerpt, article.contentText, ...article.hashtags]
        .join(" ")
        .toLocaleLowerCase()
        .includes("arlar27"),
    )
    .slice(0, 3);
  return (
    <main data-arlar27-landing className="arlar27-landing overflow-hidden">
      <Arlar27LandingMotion />

      <section className="relative isolate min-h-[30rem] overflow-hidden bg-[#032b52] text-white lg:min-h-[33rem]">
        <Image
          src={congress.heroImage}
          alt={t("Baghdad beside the Tigris at sunset")}
          fill
          priority
          sizes="100vw"
          className="arlar27-hero-image rtl-hero-mirror -z-30 object-cover object-center"
        />
        <div className={`arlar27-hero-scrim absolute inset-0 -z-20 ${isRtl ? "bg-[linear-gradient(270deg,rgba(2,17,31,0.98)_0%,rgba(3,24,42,0.88)_45%,rgba(3,24,42,0.3)_100%)]" : "bg-[linear-gradient(90deg,rgba(2,17,31,0.98)_0%,rgba(3,24,42,0.88)_45%,rgba(3,24,42,0.3)_100%)]"}`} />
        <div className={`arlar27-hero-pattern absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] opacity-25 [background-size:26px_26px] ${isRtl ? "[mask-image:linear-gradient(270deg,black,transparent_76%)]" : "[mask-image:linear-gradient(90deg,black,transparent_76%)]"}`} />
        <div aria-hidden className={`arlar27-hero-glow absolute top-1/3 -z-10 size-80 rounded-full bg-[#0d4c7a]/22 blur-3xl ${isRtl ? "-right-24" : "-left-24"}`} />
        <div aria-hidden className={`arlar27-hero-glow absolute -top-28 -z-10 size-[32rem] rounded-full bg-[#ffc21c]/10 blur-3xl [animation-delay:-2.5s] ${isRtl ? "-left-20" : "-right-20"}`} />

        <div aria-hidden className={`arlar27-orbit absolute top-10 hidden size-[31rem] rounded-full border border-white/10 lg:block ${isRtl ? "-left-24" : "-right-24"}`}>
          <span className={`absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-[#ffc21c] shadow-[0_0_24px_rgba(255,194,28,0.72)] ${isRtl ? "right-7" : "left-7"}`} />
          <span className="absolute inset-16 rounded-full border border-white/8" />
          <span className="absolute inset-32 rounded-full border border-[#ffc21c]/14" />
        </div>

        <svg aria-hidden className={`absolute bottom-0 -z-10 hidden h-[74%] w-[58%] opacity-30 lg:block ${isRtl ? "left-0 -scale-x-100" : "right-0"}`} viewBox="0 0 900 520" fill="none" preserveAspectRatio="none">
          <path className="arlar27-line-draw" d="M12 426C178 264 307 482 472 294C596 152 670 220 888 42" stroke="rgba(255,194,28,.52)" strokeWidth="1.4" />
          <path className="arlar27-line-draw [animation-delay:.35s]" d="M42 486C210 330 352 510 530 325C650 200 740 241 900 132" stroke="rgba(255,255,255,.28)" strokeWidth="1" />
        </svg>

        <div className="mx-auto grid min-h-[30rem] max-w-7xl items-center px-4 py-10 sm:px-6 lg:min-h-[33rem] lg:py-12">
          <div className="arlar27-hero-copy max-w-3xl">
            <div className="arlar27-hero-logo inline-flex rounded-2xl bg-white p-3 ring-1 ring-white/40">
              <Image
                src={congress.logo}
                alt={t("ArLAR Iraq 2027 Congress")}
                width={260}
                height={168}
                className="h-16 w-auto object-contain sm:h-20"
              />
            </div>

            <h1 className="mt-7 font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-[4.8rem]">
              ArLAR<span className="text-[#ffc21c]">27</span> {t("Iraq")}
              <span className="mt-2 block max-w-3xl text-[0.57em] leading-[1.04] tracking-[-0.04em] text-white/88">
                {t("Shaping the Future of Rheumatology")}
              </span>
            </h1>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/16 bg-[#032b52]/42 px-4 font-display text-[12px] font-semibold backdrop-blur-sm">
                <CalendarDays className="size-4 text-[#ffc21c]" />
                {t(congress.dates)}
              </span>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/16 bg-[#032b52]/42 px-4 font-display text-[12px] font-semibold backdrop-blur-sm">
                <MapPin className="size-4 text-[#ffc21c]" />
                {t(congress.location)}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={href("/congresses/arlar27/programme")}
                className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-[#ffc21c] px-6 font-display text-[13px] font-semibold text-[#032b52] shadow-lg shadow-[#032b52]/25 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#ffd45c]"
              >
                {t("Explore the programme")}
                <ArrowRight className="rtl-flip size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Arlar27ExternalAwareLink
                path="/congresses/arlar27/registration"
                href={href("/congresses/arlar27/registration")}
                externalLinks={externalLinks}
                className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-white/25 bg-white/8 px-6 font-display text-[13px] font-semibold text-white backdrop-blur-sm transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-white/14"
              >
                {t("Registration")}
                <ArrowRight className="rtl-flip size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Arlar27ExternalAwareLink>
            </div>
          </div>

        </div>

        <div aria-hidden className={`absolute inset-x-0 bottom-0 h-px opacity-80 ${isRtl ? "bg-[linear-gradient(270deg,transparent,#ffc21c_38%,#0d4c7a_68%,transparent)]" : "bg-[linear-gradient(90deg,transparent,#ffc21c_38%,#0d4c7a_68%,transparent)]"}`} />
      </section>

      <Arlar27MenuBar navigation={navigation} externalLinks={externalLinks} />

      <section className="relative overflow-hidden bg-white pb-24 pt-12 lg:pb-28 lg:pt-16">
        <div aria-hidden className="absolute -right-12 top-2 font-display text-[19rem] font-semibold leading-none tracking-[-0.08em] text-[#032b52]/[0.025]">27</div>
        <div aria-hidden className="absolute -left-32 top-16 size-72 rounded-full border border-[#0d4c7a]/8" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div data-arlar27-reveal className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch lg:gap-12">
            <div className="order-2 flex flex-col justify-center lg:order-1 lg:py-5">
              <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-[#0d4c7a] uppercase">{t("ArLAR27 · Baghdad")}</p>
              <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-ink-950 sm:text-5xl">
                {t("A regional congress built for what comes next.")}
              </h2>
              <div className="mt-6 max-w-xl space-y-4 text-[14px] leading-7 text-ink-600">
                <p>
                  {t("ArLAR27 will bring the Arab rheumatology community together in Baghdad for four days of scientific exchange, practical learning, and meaningful regional collaboration.")}
                </p>
                <p>
                  {t("The congress is being shaped as a meeting place for established expertise and emerging voices—connecting clinicians, researchers, educators, and partners around the future of rheumatology care.")}
                </p>
              </div>
            </div>
            <aside className="arlar27-countdown-shell order-1 relative isolate overflow-hidden rounded-[2rem] border border-[#0d4c7a] bg-[#032b52] p-6 text-white shadow-[0_24px_70px_-38px_rgba(3,43,82,0.72)] sm:p-8 lg:order-2 lg:p-10">
              <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_92%_8%,rgba(255,194,28,.18),transparent_34%),radial-gradient(circle_at_8%_100%,rgba(13,76,122,.65),transparent_38%)]" />
              <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.1)_1px,transparent_0)] opacity-20 [background-size:24px_24px]" />
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-[#ffc21c]/65" />
                <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-[#ffd45c] uppercase">
                  {t("Countdown to Baghdad")}
                </p>
              </div>
              <h3 className="mt-5 max-w-lg font-display text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                {t("The region meets in Iraq.")}
              </h3>
              <div className="mt-8 rounded-[1.4rem] border border-white/12 bg-white/[0.055] px-3 py-6 backdrop-blur-sm sm:px-5">
                <Arlar27Countdown />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.055] p-3.5 backdrop-blur-sm">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#ffc21c]/12 text-[#ffd45c] ring-1 ring-inset ring-[#ffc21c]/22">
                    <CalendarDays className="size-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[8px] font-semibold tracking-[0.15em] text-white/40 uppercase">{t("Congress dates")}</span>
                    <span className="mt-1 block font-display text-[12px] font-semibold text-white">{t(congress.dates)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.055] p-3.5 backdrop-blur-sm">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#ffc21c]/12 text-[#ffd45c] ring-1 ring-inset ring-[#ffc21c]/22">
                    <MapPin className="size-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[8px] font-semibold tracking-[0.15em] text-white/40 uppercase">{t("Host city")}</span>
                    <span className="mt-1 block font-display text-[12px] font-semibold text-white">{t(congress.location)}</span>
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-14 bg-[#eef4f2] [clip-path:polygon(0_72%,24%_38%,52%_76%,78%_42%,100%_65%,100%_100%,0_100%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-5 h-px rotate-[-0.3deg] bg-[linear-gradient(90deg,transparent,#0d4c7a_28%,#ffc21c_62%,transparent)] opacity-45" />
      </section>

      <section className="relative bg-[#eef4f2] pb-24 pt-12 lg:pb-28 lg:pt-16">
        <div aria-hidden className="absolute -left-28 top-32 size-80 rounded-full border border-[#0d4c7a]/8" />
        <div aria-hidden className="absolute -left-12 top-48 size-44 rounded-full border border-[#ffc21c]/12" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div data-arlar27-reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-[#0d4c7a] uppercase">{t("Congress guide")}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-ink-950 sm:text-4xl">{t("Your route through ArLAR27.")}</h2>
            </div>
            <p className="max-w-md text-[13px] leading-6 text-ink-500">{t("Everything you need to prepare, participate, and experience Baghdad—organised in one congress hub.")}</p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {gatewayCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Arlar27ExternalAwareLink
                  key={card.href}
                  path={card.href}
                  href={href(card.href)}
                  externalLinks={externalLinks}
                  data-arlar27-reveal
                  data-reveal-delay={String((index % 4) + 1)}
                  className="arlar27-gateway-card group relative flex min-h-56 overflow-hidden rounded-[1.7rem] border border-[#d5dfdc] bg-white p-6"
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[linear-gradient(90deg,#0d4c7a,#ffc21c)] transition-transform duration-500 group-hover:scale-x-100" />
                  <span aria-hidden className="absolute -right-14 -top-14 size-36 rounded-full border border-[#0d4c7a]/8 transition-transform duration-700 group-hover:scale-125" />
                  <div className="relative flex w-full flex-col">
                    <div className="flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-xl bg-[#eef5fa] text-[#0d4c7a] transition-[background-color,color,transform] duration-300 group-hover:-rotate-3 group-hover:bg-[#032b52] group-hover:text-[#ffd45c]"><Icon className="size-5" /></span>
                      <span className="font-display text-[10px] font-semibold tracking-[0.14em] text-ink-300">{card.index}</span>
                    </div>
                    <h3 className="mt-6 font-display text-xl font-semibold tracking-[-0.025em] text-ink-950">{t(card.title)}</h3>
                    <p className="mt-2 text-[12px] leading-5 text-ink-500">{t(card.description)}</p>
                    <span className="mt-auto flex items-center gap-2 pt-5 font-display text-[11px] font-semibold text-[#0d4c7a]">
                      {t("Explore")} <ArrowRight className="rtl-flip size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Arlar27ExternalAwareLink>
              );
            })}
          </div>
        </div>
        <svg aria-hidden className="absolute inset-x-0 bottom-0 h-14 w-full text-white" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path fill="currentColor" d="M0 38C195 74 376 6 590 37C816 69 1004 12 1205 34C1306 45 1382 51 1440 42V80H0Z" />
          <path d="M0 34C195 70 376 2 590 33C816 65 1004 8 1205 30C1306 41 1382 47 1440 38" fill="none" stroke="rgba(13,76,122,.2)" />
        </svg>
      </section>

      <section className="relative bg-white py-16 lg:py-24">
        <div data-arlar27-reveal className="group mx-auto grid max-w-7xl overflow-hidden rounded-[2.2rem] border border-[#d9e1e0] bg-[#08253e] sm:mx-auto lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[28rem] overflow-hidden bg-[#064a7a]">
            <Image
              src={congress.saveTheDateImage}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="scale-110 object-cover object-center opacity-45 blur-xl"
            />
            <div className="absolute inset-0 bg-[#032f51]/35" />
            <Image
              src={congress.saveTheDateImage}
              alt={t("ArLAR27 save the date artwork")}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-contain object-center p-3 transition-transform duration-[1400ms] ease-out group-hover:scale-[1.018] sm:p-5"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#08253e]/12" />
          </div>
          <div className="relative flex flex-col justify-center overflow-hidden p-7 text-white sm:p-10 lg:p-14">
            <span aria-hidden className="absolute -right-28 -top-28 size-80 rounded-full border border-[#ffc21c]/16" />
            <span aria-hidden className="absolute -bottom-24 right-16 size-52 rounded-full border border-white/8" />
            <Quote className="relative size-10 text-[#ffc21c]" />
            <h2 className="relative mt-6 max-w-xl font-display text-3xl font-semibold leading-[1.06] tracking-[-0.04em] sm:text-4xl">{t("A landmark congress begins with a shared ambition.")}</h2>
            <p className="relative mt-5 max-w-xl text-[14px] leading-7 text-white/64">{t("Preparations are underway in Baghdad for an ArLAR congress built around scientific exchange, regional connection, and the future of rheumatology practice.")}</p>
            <Link href={href("/congresses/arlar27/welcome")} className="group/link relative mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-[#ffc21c]/35 bg-[#ffc21c]/10 px-5 py-3 font-display text-[12px] font-semibold text-[#ffd45c] transition-colors hover:bg-[#ffc21c]/16">
              {t("Read the welcome")} <ArrowRight className="rtl-flip size-4 transition-transform duration-300 group-hover/link:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#032b52] pb-20 pt-20 text-white lg:pb-24 lg:pt-24">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_84%_25%,rgba(255,194,28,.11),transparent_28%),radial-gradient(circle_at_12%_90%,rgba(13,76,122,.2),transparent_30%)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.1)_1px,transparent_0)] opacity-20 [background-size:25px_25px]" />
        <div aria-hidden className="absolute right-4 top-4 font-display text-[18rem] font-semibold leading-none text-white/[0.025]">27</div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div data-arlar27-reveal className="grid gap-8 lg:grid-cols-[0.66fr_1.34fr] lg:items-start lg:gap-14">
            <div>
              <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-[#ffd45c] uppercase">{t("24–27 March 2027")}</p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl">{t("Four days in Baghdad.")}</h2>
              <p className="mt-5 max-w-md text-[13px] leading-6 text-white/56">{t("The scientific schedule will appear as soon as it is approved. For now, save every congress date.")}</p>
              <Link href={href("/congresses/arlar27/programme")} className="group mt-7 inline-flex items-center gap-2 font-display text-[12px] font-semibold text-[#ffd45c]">{t("Explore the programme")} <ArrowRight className="rtl-flip size-4 transition-transform duration-300 group-hover:translate-x-1" /></Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {days.map((day, index) => (
                <div key={day.day} data-arlar27-reveal data-reveal-delay={String(index + 1)} className="group rounded-[1.5rem] border border-white/12 bg-white/[0.055] p-5 backdrop-blur-sm transition-[background-color,border-color,transform] duration-300 hover:-translate-y-1 hover:border-[#ffc21c]/35 hover:bg-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-[9px] font-semibold tracking-[0.16em] text-[#ffd45c] uppercase">{t(day.day)}</p>
                    <span className="font-display text-[10px] font-semibold text-white/25">0{index + 1}</span>
                  </div>
                  <p className="mt-5 font-display text-lg font-semibold text-white">{t(day.date)}</p>
                  <p className="mt-2 text-[11px] text-white/40">{t(day.state)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,#ffc21c_30%,#0d4c7a_72%,transparent)]" />
      </section>

      <NewsSection
        locale={lang}
        posts={latestArlar27News}
        id="latest-arlar27-news"
        eyebrow="Latest ArLAR27 news"
        title="The latest from"
        highlightedTitle="ArLAR27."
        description="Congress announcements, preparations, and important updates from the road to Baghdad."
        linkLabel="View all ArLAR news"
      />
    </main>
  );
}
