import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Globe,
  HeartPulse,
  Microscope,
  Users,
} from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export const generateMetadata = createStaticPageMetadata("/about");

const missions = [
  {
    number: "01",
    title: "Represent",
    description: "Represent Arab rheumatologists.",
    Icon: Users,
  },
  {
    number: "02",
    title: "Advance care",
    description:
      "Promote excellence in rheumatic and musculoskeletal disease care.",
    Icon: HeartPulse,
  },
  {
    number: "03",
    title: "Educate & research",
    description:
      "Enhance education and research among the Arab countries.",
    Icon: BookOpen,
  },
  {
    number: "04",
    title: "Collaborate",
    description:
      "Advance professional camaraderie between Arab rheumatologists and worldwide.",
    Icon: Globe,
  },
  {
    number: "05",
    title: "Research & train",
    description:
      "Boost research and training to improve the health of patients with rheumatic and musculoskeletal diseases.",
    Icon: Microscope,
  },
  {
    number: "06",
    title: "Develop leaders",
    description:
      "Enhance professional development and leadership in health policy.",
    Icon: Users,
  },
] as const;

const milestones = [
  {
    date: "1981",
    category: "Congress origins",
    title: "The first congress",
    text: "The first Pan Arab Rheumatology Congress was held in Rabat, Morocco, creating an early meeting point for the region.",
  },
  {
    date: "29 March 1995",
    category: "Foundation milestone",
    title: "A society is founded",
    text: "Representatives meeting during the second congress in Cairo, held from 28–31 March, formed the Pan Arab Society of Rheumatic Diseases.",
  },
  {
    date: "The following years",
    category: "Scientific growth",
    title: "Science shared across borders",
    text: "The Society issued journals and publications and held nine further congresses following its foundation.",
  },
  {
    date: "11th Congress",
    category: "Organizational milestone",
    title: "A new regional identity",
    text: "In Dubai, the Society became the Arab League Against Rheumatism at the initiative of the Emirates Society for Rheumatology.",
  },
  {
    date: "2014–2018",
    category: "Regional congress era",
    title: "Congress across the region",
    text: "Further congresses were held in Dubai in 2014, Marrakech in 2016, and Muscat in February 2018.",
  },
  {
    date: "November 2018",
    category: "A renewed identity",
    title: "ArLAR takes its current form",
    text: "The organization became the Arab League of Associations for Rheumatology, supported by a new identity and Articles of Association.",
  },
] as const;

export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const href = (path: string) => localizePath(path, lang);
  return (
    <main>
      <section className="relative isolate min-h-[18rem] overflow-hidden bg-[#07131f] text-white sm:min-h-[19rem] lg:min-h-[20rem]">
        <Image
          src="/images/subpage-hero-medical.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="rtl-hero-mirror object-cover object-center opacity-[0.34]"
          style={{
            filter: "blur(2px) saturate(96%)",
            transform: "scale(1.02)",
          }}
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[linear-gradient(90deg,rgba(5,13,22,0.94)_0%,rgba(5,13,22,0.78)_43%,rgba(5,13,22,0.3)_74%,rgba(5,13,22,0.16)_100%)]"
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(193,2,48,0.22),transparent_27%),radial-gradient(circle_at_84%_70%,rgba(0,149,59,0.18),transparent_32%)]"
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_0)] opacity-15 [background-size:24px_24px] [mask-image:linear-gradient(90deg,black,transparent_72%)]"
        />
        <svg
          aria-hidden
          className="absolute inset-0 size-full opacity-[0.07] mix-blend-soft-light"
          preserveAspectRatio="none"
        >
          <filter id="about-hero-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.78"
              numOctaves="3"
              seed="8"
            />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#about-hero-grain)"
          />
        </svg>
        <svg
          aria-hidden
          className="absolute -right-20 -top-36 size-[36rem] text-white opacity-[0.07]"
          viewBox="0 0 520 520"
          fill="none"
        >
          <circle cx="260" cy="260" r="180" stroke="currentColor" />
          <circle cx="260" cy="260" r="118" stroke="currentColor" />
          <path
            d="M260 42 449 151v218L260 478 71 369V151L260 42Z"
            stroke="currentColor"
          />
          <circle cx="260" cy="260" r="9" fill="currentColor" />
        </svg>

        <div className="relative mx-auto flex min-h-[18rem] max-w-7xl flex-col justify-center px-4 py-9 sm:min-h-[19rem] sm:px-6 lg:min-h-[20rem]">
          <nav
            aria-label={t("Breadcrumb")}
            className="flex items-center gap-2.5 font-display text-[13px] font-medium text-white/60"
          >
            <Link href={href("/")} className="transition-colors hover:text-white">
              {t("Home")}
            </Link>
            <span aria-hidden className="text-white/25">
              /
            </span>
            <span className="text-white/85">{t("About Us")}</span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl">
              {lang === "ar" ? t("About ArLAR") : <>{t("About")} <span className="text-crimson-400">Ar</span>LAR</>}
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-sky-50/72 sm:text-[16px]">
              {t("The regional professional league connecting rheumatology societies, knowledge, and progress across the Arab world.")}
            </p>
          </div>
        </div>

        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-crimson-500 via-white/20 to-jade-400"
        />
      </section>

      <section className="relative overflow-hidden bg-white py-20 lg:py-28">
        <div
          aria-hidden
          className="absolute -left-32 top-32 size-72 rounded-full bg-crimson-50 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="relative isolate min-h-[28rem] overflow-hidden rounded-[2rem] bg-[#07131f] p-7 text-white sm:p-10">
            <Image
              src="/images/wix-blog/originals/bba2f0_4977c0bf3a214a72b3b640bc84cccafc_mv2.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-center"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,20,0.22)_0%,rgba(4,12,20,0.62)_42%,rgba(4,12,20,0.95)_100%),linear-gradient(90deg,rgba(4,12,20,0.78)_0%,rgba(4,12,20,0.28)_72%,rgba(0,94,48,0.3)_100%)]"
            />

            <div className="relative flex h-full flex-col">
              <div className="inline-flex w-fit rounded-2xl bg-white px-5 py-4">
                <Image
                  src="/arlar-logo.png"
                  alt="ArLAR"
                  width={210}
                  height={108}
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="mt-12 font-display text-[11px] font-semibold tracking-[0.16em] text-jade-300 uppercase">
                {t("Established in Cairo")}
              </p>
              <p className="mt-3 font-display text-6xl font-semibold tracking-[-0.05em] sm:text-7xl">
                1995
              </p>
              <p className="mt-4 max-w-md text-[13px] leading-6 text-sky-100/75">
                {t("Founded on 29 March as the Pan Arab Society of Rheumatic Diseases. ArLAR adopted its current name, logo, and Articles of Association in November 2018.")}
              </p>
              <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-6">
                <CalendarDays className="size-4 text-crimson-300" />
                <span className="font-display text-[11px] font-medium text-white/70">
                  {t("Three decades of regional scientific exchange")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:pl-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-jade-600" />
              <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-ink-500 uppercase">
                {t("Arab League of Associations for Rheumatology")}
              </p>
            </div>
            <h2 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink-950 sm:text-5xl">
              <span className="block">{t("One regional league.")}</span>
              <span className="block text-jade-700">
                {t("One shared direction.")}
              </span>
            </h2>
            <p className="mt-7 max-w-2xl text-[15px] leading-7 text-ink-600">
              {t("The Arab League of Associations for Rheumatology was founded on 29 March 1995 under the name of Pan Arab Society of Rheumatic Diseases. Since then, 14 biennial congresses have been held in different Arab countries, creating a lasting platform for education, research, and professional exchange.")}
            </p>

            <div className="mt-9 border-l-2 border-crimson-600 pl-6">
              <p className="font-display text-[10px] font-semibold tracking-[0.16em] text-crimson-600 uppercase">
                {t("Our vision")}
              </p>
              <p className="mt-3 max-w-xl font-display text-xl font-semibold leading-8 text-ink-900 sm:text-2xl">
                {t("To be the regional professional league for rheumatology, recognized internationally.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f5f8f7] py-20 lg:py-28">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_90%_8%,rgba(0,149,59,0.07),transparent_27%),radial-gradient(circle_at_8%_95%,rgba(193,2,48,0.06),transparent_25%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-crimson-600" />
              <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-ink-500 uppercase">
                {t("Our mission")}
              </p>
            </div>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink-950 sm:text-4xl lg:whitespace-nowrap">
              {t("Commitments that move the region forward.")}
            </h2>
            <p className="mt-5 max-w-3xl text-[14px] leading-7 text-ink-500">
              {t("Every part of ArLAR's work points toward stronger clinical practice, deeper scientific collaboration, and better health outcomes across the region.")}
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {missions.map(({ number, title, description, Icon }, index) => (
              <article
                key={title}
                className={`group relative min-h-52 overflow-hidden rounded-[1.5rem] border p-6 transition-transform duration-300 hover:-translate-y-1 ${
                  index === 0
                    ? "border-[#132a26] bg-[#09241d] text-white"
                    : "border-ink-100 bg-white text-ink-950"
                }`}
              >
                <div
                  aria-hidden
                  className={`absolute -right-12 -top-12 size-32 rounded-full border ${
                    index === 0
                      ? "border-jade-300/20"
                      : "border-jade-100 bg-jade-50/60"
                  }`}
                />
                <div className="relative flex items-center justify-between">
                  <span
                    className={`font-display text-[10px] font-semibold tracking-[0.15em] ${
                      index === 0 ? "text-jade-300" : "text-crimson-600"
                    }`}
                  >
                    {number}
                  </span>
                  <Icon
                    className={`size-7 ${
                      index === 0 ? "text-jade-300" : "text-ink-500"
                    }`}
                  />
                </div>
                <h3 className="relative mt-8 font-display text-2xl font-semibold tracking-[-0.025em]">
                  {t(title)}
                </h3>
                <p
                  className={`relative mt-3 text-[14px] leading-6 ${
                    index === 0 ? "text-sky-100/55" : "text-ink-500"
                  }`}
                >
                  {t(description)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="history"
        className="relative scroll-mt-40 overflow-hidden bg-white py-20 lg:py-28"
      >
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-jade-600" />
                <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-ink-500 uppercase">
                  {t("History of ArLAR")}
                </p>
              </div>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink-950 sm:text-5xl">
                {t("Built over decades.")}{" "}
                <span className="text-jade-700">{t("Still moving forward.")}</span>
              </h2>
            </div>
            <p className="max-w-xl text-[14px] leading-7 text-ink-500 lg:justify-self-end">
              {t("The league grew from a shared regional congress into a connected professional organization with a wider scientific and educational role.")}
            </p>
          </div>

          <ol className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {milestones.map((milestone, index) => (
              <li
                key={milestone.date}
                className={`group relative min-h-[16.5rem] overflow-hidden rounded-[1.65rem] border bg-linear-to-br from-white to-ink-50/45 p-7 transition-[border-color,transform] duration-300 hover:-translate-y-1 ${
                  index % 2 === 0
                    ? "border-crimson-100 hover:border-crimson-200"
                    : "border-jade-100 hover:border-jade-200"
                }`}
              >
                <div
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-1 ${
                    index % 2 === 0
                      ? "bg-linear-to-r from-crimson-600 to-crimson-300"
                      : "bg-linear-to-r from-jade-700 to-jade-300"
                  }`}
                />
                <span
                  aria-hidden
                  className={`absolute bottom-3 right-4 font-display text-8xl font-semibold leading-none opacity-[0.04] ${
                    index % 2 === 0 ? "text-crimson-950" : "text-jade-950"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="relative flex items-start gap-4">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-2xl font-display text-[13px] font-semibold text-white shadow-lg ${
                      index % 2 === 0 ? "bg-crimson-600" : "bg-jade-700"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span className="block font-display text-[11px] font-semibold tracking-[0.15em] text-ink-400 uppercase">
                      {t(milestone.category)}
                    </span>
                    <span
                      className={`mt-1.5 block font-display text-[15px] font-semibold tracking-[0.06em] uppercase ${
                        index % 2 === 0
                          ? "text-crimson-600"
                          : "text-jade-700"
                      }`}
                    >
                      {t(milestone.date)}
                    </span>
                  </span>
                </div>

                <h3 className="relative mt-6 max-w-sm font-display text-2xl font-semibold leading-8 tracking-[-0.025em] text-ink-950">
                  {t(milestone.title)}
                </h3>
                <p className="relative mt-3 max-w-sm text-[14px] leading-6 text-ink-500">
                  {t(milestone.text)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white pb-20 pt-0 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-7 overflow-hidden rounded-[2rem] bg-[#07131f] p-7 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-display text-[10px] font-semibold tracking-[0.16em] text-jade-300 uppercase">
                {t("Meet the people behind the work")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] sm:whitespace-nowrap sm:text-4xl">
                {t("Regional leadership, shared responsibility.")}
              </h2>
            </div>
            <Link
              href={href("/about/board")}
              className="group inline-flex min-h-14 min-w-44 shrink-0 items-center justify-center gap-2.5 rounded-xl bg-white px-8 font-display text-[14px] font-semibold text-ink-950 transition-colors hover:bg-jade-50"
            >
              {t("Meet the Board")}
              <ArrowRight className="rtl-flip size-[18px] text-jade-700 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
