"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  MapPin,
  Users,
} from "@/components/icons";
import { useTranslations } from "@/i18n/locale-context";

const slides = [
  {
    id: "congress",
    tone: "light",
    tab: "Congress",
    image: "/performance/iraq-congress-hero.webp",
    imageAlt: "Baghdad at sunset, host city for the ArLAR Congress",
    imageClass: "object-cover object-center [transform:scaleX(-1)]",
    overlayClass:
      "bg-gradient-to-r from-white/[0.98] via-white/70 to-transparent",
    glowClass: "bg-crimson-600/30",
    dotClass: "bg-crimson-600",
    accentClass: "text-crimson-700",
    logo: "/performance/arlar27-congress-logo.webp",
    logoAlt: "ArLAR Iraq 2027 Congress",
    primaryClass:
      "bg-crimson-600 shadow-crimson-950/35 hover:bg-crimson-500",
    eyebrow: "ArLAR27 · Iraq",
    title: (
      <>
        <span className="text-crimson-700">Ar</span>
        <span className="text-ink-950">LAR</span>
        <span className="text-jade-700">27</span>
        <span className="text-ink-950"> Iraq:</span>{" "}
        Shaping the Future of Rheumatology
      </>
    ),
    titleText: "ArLAR27 Iraq: Shaping the Future of Rheumatology",
    titleShort: (
      <>
        <span className="text-crimson-700">Ar</span>
        <span className="text-ink-950">LAR</span>
        <span className="text-jade-700">27</span>
        <span className="text-ink-950"> Iraq:</span>{" "}
        Shaping the Future
      </>
    ),
    titleShortText: "ArLAR27 Iraq: Shaping the Future",
    description:
      "Four days bringing the Arab rheumatology community together for science, exchange, and regional collaboration.",
    primaryAction: {
      label: "Explore the congress",
      href: "/congresses/arlar27",
    },
    secondaryAction: {
      label: "Register now",
      href: "/congresses/arlar27#registration",
    },
    facts: [
      { value: "24–27", label: "March 2027" },
      { value: "Baghdad", label: "Iraq" },
      { value: "27th", label: "Annual ArLAR Congress" },
    ],
  },
  {
    id: "arlar",
    tone: "light",
    tab: "About ArLAR",
    image: "/performance/arlar-core-hero.webp",
    imageAlt:
      "Rheumatology textbooks, research materials, and a stethoscope",
    imageClass: "object-cover object-[72%_center] lg:object-center",
    overlayClass:
      "bg-gradient-to-r from-white/55 via-white/20 to-transparent",
    glowClass: "bg-jade-600/25",
    dotClass: "bg-jade-600",
    accentClass: "text-jade-700",
    logo: null,
    logoAlt: "",
    primaryClass:
      "bg-crimson-600 shadow-crimson-950/35 hover:bg-crimson-500",
    eyebrow: "Arab League of Associations for Rheumatology",
    title: (
      <>
        <span className="block lg:whitespace-nowrap">
          <span className="text-crimson-700">Ar</span>
          <span className="text-ink-950">LAR:</span> Leading the
        </span>
        <span className="block lg:whitespace-nowrap">
          Future of Rheumatology
        </span>
      </>
    ),
    titleText: "ArLAR: Leading the Future of Rheumatology",
    titleShort: (
      <>
        <span className="text-crimson-700">Ar</span>
        <span className="text-ink-950">LAR:</span> Leading the Future
      </>
    ),
    titleShortText: "ArLAR: Leading the Future",
    description:
      "ArLAR advances rheumatology care, research, and education while fostering professional collaboration across the region and beyond.",
    primaryAction: {
      label: "Learn about ArLAR",
      href: "/about",
    },
    secondaryAction: {
      label: "Explore ArLAR",
      href: "/members",
    },
    facts: [
      { value: "Care", label: "Better patient outcomes" },
      { value: "Research", label: "Shared regional evidence" },
      { value: "Education", label: "Lifelong learning" },
    ],
  },
  {
    id: "college",
    tone: "light",
    tab: "ArLAR College",
    image: "/performance/arlar-college-hero.webp",
    imageAlt:
      "Online rheumatology learning on a laptop beside medical textbooks",
    imageClass: "object-cover object-[75%_center] lg:object-center",
    overlayClass:
      "bg-gradient-to-r from-white/55 via-white/20 to-transparent",
    glowClass: "bg-jade-500/30",
    dotClass: "bg-jade-600",
    accentClass: "text-jade-700",
    logo: null,
    logoAlt: "",
    primaryClass:
      "bg-jade-600 shadow-jade-950/35 hover:bg-jade-500",
    eyebrow: "ArLAR College · Education for practice",
    title: (
      <>
        Learn, connect, and
        <br />
        advance <span className="text-jade-700">rheumatology.</span>
      </>
    ),
    titleText: "Learn, connect, and advance rheumatology.",
    titleShort: (
      <>
        Learn, connect,{" "}
        <span className="text-jade-700">advance.</span>
      </>
    ),
    titleShortText: "Learn, connect, advance.",
    description:
      "A growing program of courses, webinars, and workshops built around the needs of clinicians across the Arab region.",
    primaryAction: {
      label: "Explore college events",
      href: "/college/events",
    },
    secondaryAction: {
      label: "Browse the library",
      href: "/education",
    },
    facts: [
      { value: "Courses", label: "Structured learning" },
      { value: "Webinars", label: "Expert-led sessions" },
      { value: "Workshops", label: "Practical training" },
    ],
  },
] as const;

export function Hero() {
  const { locale, t, href } = useTranslations();
  const isRtl = locale === "ar";
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (isPaused) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused]);

  function moveSlide(direction: -1 | 1) {
    setActiveIndex(
      (current) => (current + direction + slides.length) % slides.length,
    );
  }

  return (
    <section
      aria-label={t("Featured ArLAR content")}
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
      className="relative isolate grid min-h-[27rem] overflow-hidden bg-ink-950 text-white sm:min-h-[31rem] xl:min-h-[calc(100svh-9rem)] min-[1700px]:min-h-[calc(100svh-13rem)]"
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        const isLight = slide.tone === "light";
        const Heading = index === 0 ? "h1" : "h2";

        return (
          <article
            key={slide.id}
            aria-hidden={!isActive}
            aria-label={`${index + 1} of ${slides.length}: ${t(slide.tab)}`}
            aria-roledescription="slide"
            className={`relative [grid-area:1/1] transition-opacity duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isActive ? "z-10 opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div
              className={`absolute inset-0 transform-gpu transition-transform duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive ? "scale-100" : "scale-[1.025]"
              }`}
            >
              <Image
                src={slide.image}
                alt={t(slide.imageAlt)}
                fill
                priority={index === 0}
                sizes="100vw"
                className={`${slide.imageClass} ${isRtl ? "[transform:scaleX(-1)]" : ""}`}
              />
            </div>

            <div
              aria-hidden
              // Phones put body copy across the full width, past the end of the
              // left-to-right scrim, so they get a flat wash underneath it too.
              className={`absolute inset-0 bg-white/60 sm:bg-transparent ${isRtl ? slide.overlayClass.replace("bg-gradient-to-r", "bg-gradient-to-l") : slide.overlayClass}`}
            />
            <div
              aria-hidden
              className={isLight
                ? "absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"
                : "absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/45"}
            />
            <div
              aria-hidden
              className={`absolute -top-40 right-[10%] size-[34rem] rounded-full blur-[160px] ${slide.glowClass}`}
            />

            {slide.id === "congress" ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[54%] overflow-hidden"
              >
                <div className="absolute -left-24 top-[12%] size-72 rounded-full border border-crimson-600/10 motion-safe:animate-[hero-spin_28s_linear_infinite]" />
                <div className="absolute left-[18%] top-[24%] size-44 rounded-full border border-jade-600/10 motion-safe:animate-[hero-drift_13s_ease-in-out_infinite]" />
                <div className="absolute left-[10%] top-[32%] size-3 rounded-full bg-crimson-600/20 blur-[1px] motion-safe:animate-[hero-float_7s_ease-in-out_infinite]" />
                <div className="absolute left-[39%] top-[17%] size-2 rounded-full bg-jade-600/25 motion-safe:animate-[hero-float_9s_ease-in-out_infinite_reverse]" />
                <div className="absolute left-[44%] top-[58%] size-2.5 rounded-full bg-crimson-600/20 motion-safe:animate-[hero-drift_11s_ease-in-out_infinite]" />
                <div className="absolute -left-10 bottom-[14%] h-40 w-[28rem] rotate-[-12deg] rounded-[50%] border-t border-crimson-600/10 motion-safe:animate-[hero-drift_16s_ease-in-out_infinite]" />
                <div className="absolute left-[28%] bottom-[20%] h-28 w-28 rounded-full bg-jade-500/10 blur-2xl motion-safe:animate-[hero-float_10s_ease-in-out_infinite]" />
              </div>
            ) : null}

            <div className="relative z-10 mx-auto flex w-full max-w-7xl items-start px-4 pb-10 pt-16 sm:items-center sm:px-6 sm:pb-28 sm:pt-9 lg:max-xl:min-h-[31rem] lg:max-xl:pb-20 lg:max-xl:pt-4 xl:min-h-[calc(100svh-9rem)] xl:pb-16 xl:pt-7 min-[1400px]:pl-[max(1.5rem,calc(50rem-50vw))]! min-[1700px]:min-h-[calc(100svh-13rem)]">
              <div
                className={`w-full transform-gpu transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  slide.id === "arlar" ? "max-w-[56rem]" : "max-w-[50rem]"
                } ${
                  isActive
                    ? "-translate-y-1 opacity-100 sm:max-[1023px]:-translate-y-8 xl:-translate-y-8"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <div className="flex min-h-16 items-center sm:block sm:min-h-0">
                {slide.logo ? (
                  <div className="relative flex h-[clamp(4rem,calc(1rem+5vw),5.5rem)] w-[clamp(8rem,calc(2rem+10vw),11rem)] items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white p-[clamp(0.6rem,0.85vw,0.75rem)] shadow-xl shadow-black/15">
                    <Image
                      src={slide.logo}
                      alt={t(slide.logoAlt)}
                      width={224}
                      height={126}
                      priority
                      className="h-auto w-full object-contain"
                    />
                  </div>
                ) : (
                  <p
                    className={`${isLight
                      ? "inline-flex items-center gap-[clamp(0.4rem,0.55vw,0.5rem)] rounded-full border border-ink-200 bg-white/60 px-[clamp(0.7rem,0.95vw,0.875rem)] py-[clamp(0.3rem,0.42vw,0.375rem)] text-[clamp(0.6875rem,0.72vw,0.6875rem)] font-semibold text-ink-700 backdrop-blur-md min-[1700px]:text-[12px]"
                      : "inline-flex items-center gap-[clamp(0.4rem,0.55vw,0.5rem)] rounded-full border border-white/15 bg-ink-950/30 px-[clamp(0.7rem,0.95vw,0.875rem)] py-[clamp(0.3rem,0.42vw,0.375rem)] text-[clamp(0.6875rem,0.72vw,0.6875rem)] font-semibold text-white/85 backdrop-blur-md min-[1700px]:text-[12px]"
                    } tracking-[0.025em]`}
                  >
                    <span className={`size-2 rounded-full ${slide.dotClass}`} />
                    {t(slide.eyebrow)}
                  </p>
                )}
                </div>

                <Heading
                  className={isLight
                    ? `mt-[clamp(0.625rem,calc(-0.125rem+1.25vw),1rem)] font-display text-[clamp(2rem,calc(0.875rem+2.35vw),3rem)] max-[359px]:text-[1.75rem] lg:max-xl:text-[2.25rem] min-[1700px]:text-[3.75rem] font-extrabold leading-[1.1] text-ink-950 [text-wrap:balance] ${
                        slide.id === "arlar" ? "max-w-[56rem]" : "max-w-[50rem]"
                      }`
                    : `mt-[clamp(0.625rem,calc(-0.125rem+1.25vw),1rem)] font-display text-[clamp(2rem,calc(0.875rem+2.35vw),3rem)] max-[359px]:text-[1.75rem] lg:max-xl:text-[2.25rem] min-[1700px]:text-[3.75rem] font-extrabold leading-[1.1] text-white [text-wrap:balance] ${
                        slide.id === "arlar" ? "max-w-[56rem]" : "max-w-[50rem]"
                      }`}
                >
                  <span className="sm:hidden">{locale === "en" ? slide.titleShort : t(slide.titleShortText)}</span>
                  <span className="hidden sm:block">{locale === "en" ? slide.title : t(slide.titleText)}</span>
                </Heading>

                <p
                  className={isLight
                    ? "mt-[clamp(0.625rem,calc(-0.125rem+1.25vw),1rem)] max-w-2xl text-[clamp(0.9375rem,calc(0.55rem+0.5vw),1rem)] leading-[1.65] text-ink-800 sm:text-ink-700 lg:max-xl:text-[14px] min-[1700px]:max-w-3xl min-[1700px]:text-lg"
                    : "mt-[clamp(0.625rem,calc(-0.125rem+1.25vw),1rem)] max-w-2xl text-[clamp(0.9375rem,calc(0.55rem+0.5vw),1rem)] leading-[1.65] text-white/75 lg:max-xl:text-[14px] min-[1700px]:max-w-3xl min-[1700px]:text-lg"}
                >
                  {t(slide.description)}
                </p>

                <div className="mt-[clamp(0.75rem,calc(-0.25rem+1.67vw),1.25rem)] flex flex-wrap gap-[clamp(0.5rem,0.7vw,0.625rem)]">
                  <Link
                    href={href(slide.primaryAction.href)}
                    tabIndex={isActive ? undefined : -1}
                    className={`group inline-flex min-h-11 items-center justify-center gap-[clamp(0.4rem,0.55vw,0.5rem)] rounded-full px-[clamp(1rem,1.67vw,1.5rem)] font-display text-[clamp(0.8125rem,calc(0.65625rem+0.208vw),0.84375rem)] font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 min-[1700px]:text-[15px] ${slide.primaryClass}`}
                  >
                    {t(slide.primaryAction.label)}
                    <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href={href(slide.secondaryAction.href)}
                    tabIndex={isActive ? undefined : -1}
                    className={isLight
                      ? "inline-flex min-h-11 items-center justify-center rounded-full border border-ink-300 bg-white/55 px-[clamp(1rem,1.67vw,1.5rem)] font-display text-[clamp(0.8125rem,calc(0.65625rem+0.208vw),0.84375rem)] font-semibold text-ink-900 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/80 min-[1700px]:text-[15px]"
                      : "inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-white/10 px-[clamp(1rem,1.67vw,1.5rem)] font-display text-[clamp(0.8125rem,calc(0.65625rem+0.208vw),0.84375rem)] font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/20 min-[1700px]:text-[15px]"}
                  >
                    {t(slide.secondaryAction.label)}
                  </Link>
                </div>

                {slide.id === "congress" ? (
                  <div className="mt-[clamp(0.75rem,calc(-0.25rem+1.67vw),1.25rem)] hidden flex-wrap gap-[clamp(0.5rem,0.7vw,0.625rem)] sm:flex">
                    <div className={isLight
                      ? "inline-flex min-w-[clamp(10rem,13vw,11.75rem)] items-center gap-[clamp(0.5rem,0.7vw,0.625rem)] rounded-xl border border-ink-200 bg-white/65 px-[clamp(0.65rem,0.98vw,0.875rem)] py-[clamp(0.5rem,0.7vw,0.625rem)] backdrop-blur-xl"
                      : "inline-flex min-w-[clamp(10rem,13vw,11.75rem)] items-center gap-[clamp(0.5rem,0.7vw,0.625rem)] rounded-xl border border-white/15 bg-ink-950/45 px-[clamp(0.65rem,0.98vw,0.875rem)] py-[clamp(0.5rem,0.7vw,0.625rem)] shadow-lg shadow-black/10 backdrop-blur-xl"}>
                      <span className={isLight
                        ? "grid size-[clamp(1.75rem,calc(1.25rem+0.83vw),2rem)] shrink-0 place-items-center rounded-lg bg-crimson-100 text-crimson-700"
                        : "grid size-[clamp(1.75rem,calc(1.25rem+0.83vw),2rem)] shrink-0 place-items-center rounded-lg bg-crimson-500/20 text-crimson-300"}>
                        <CalendarDays className="size-4" />
                      </span>
                      <span>
                        <span className={isLight
                          ? "block font-display text-[clamp(0.8125rem,calc(0.625rem+0.208vw),0.8125rem)] font-bold text-ink-950"
                          : "block font-display text-[clamp(0.8125rem,calc(0.625rem+0.208vw),0.8125rem)] font-bold text-white"}>
                          {t("March 24–27, 2027")}
                        </span>
                        <span className={isLight
                          ? "mt-0.5 block text-[clamp(0.6rem,calc(0.469rem+0.208vw),0.65625rem)] text-ink-600"
                          : "mt-0.5 block text-[clamp(0.6rem,calc(0.469rem+0.208vw),0.65625rem)] text-white/55"}>
                          {t("Save the date")}
                        </span>
                      </span>
                    </div>
                    <div className={isLight
                      ? "inline-flex min-w-[clamp(9rem,11.7vw,10.5rem)] items-center gap-[clamp(0.5rem,0.7vw,0.625rem)] rounded-xl border border-ink-200 bg-white/65 px-[clamp(0.65rem,0.98vw,0.875rem)] py-[clamp(0.5rem,0.7vw,0.625rem)] backdrop-blur-xl"
                      : "inline-flex min-w-[clamp(9rem,11.7vw,10.5rem)] items-center gap-[clamp(0.5rem,0.7vw,0.625rem)] rounded-xl border border-white/15 bg-ink-950/45 px-[clamp(0.65rem,0.98vw,0.875rem)] py-[clamp(0.5rem,0.7vw,0.625rem)] shadow-lg shadow-black/10 backdrop-blur-xl"}>
                      <span className={isLight
                        ? "grid size-[clamp(1.75rem,calc(1.25rem+0.83vw),2rem)] shrink-0 place-items-center rounded-lg bg-crimson-100 text-crimson-700"
                        : "grid size-[clamp(1.75rem,calc(1.25rem+0.83vw),2rem)] shrink-0 place-items-center rounded-lg bg-crimson-500/20 text-crimson-300"}>
                        <MapPin className="size-4" />
                      </span>
                      <span>
                        <span className={isLight
                          ? "block font-display text-[clamp(0.8125rem,calc(0.625rem+0.208vw),0.8125rem)] font-bold text-ink-950"
                          : "block font-display text-[clamp(0.8125rem,calc(0.625rem+0.208vw),0.8125rem)] font-bold text-white"}>
                          {t("Baghdad, Iraq")}
                        </span>
                        <span className={isLight
                          ? "mt-0.5 block text-[clamp(0.6rem,calc(0.469rem+0.208vw),0.65625rem)] text-ink-600"
                          : "mt-0.5 block text-[clamp(0.6rem,calc(0.469rem+0.208vw),0.65625rem)] text-white/55"}>
                          {t("Congress destination")}
                        </span>
                      </span>
                    </div>
                  </div>
                ) : slide.id === "arlar" ? (
                  <div className="mt-[clamp(0.75rem,calc(-0.25rem+1.67vw),1.25rem)] hidden max-w-2xl flex-wrap items-center gap-x-[clamp(0.75rem,1.1vw,1rem)] sm:flex gap-y-1.5 text-[clamp(0.65rem,0.83vw,0.75rem)] text-ink-600">
                    <span className="inline-flex items-center gap-2 font-display font-semibold text-jade-700">
                      <span className="size-1.5 rounded-full bg-jade-600" />
                      {t("Advancing rheumatology since 1995")}
                    </span>
                    <span
                      aria-hidden
                      className="hidden h-4 w-px bg-ink-300 sm:block"
                    />
                    <span>
                      {t("Connecting 16 national societies across the Arab world")}
                    </span>
                  </div>
                ) : (
                  <div className="mt-[clamp(0.75rem,calc(-0.25rem+1.67vw),1.25rem)] hidden max-w-2xl flex-wrap gap-[clamp(0.5rem,0.7vw,0.625rem)] sm:flex">
                    {slide.facts.map((fact) => (
                      <div
                        key={fact.label}
                        className={isLight
                          ? "flex min-w-[clamp(8.5rem,10.5vw,9.5rem)] flex-1 items-center gap-[clamp(0.5rem,0.7vw,0.625rem)] rounded-xl border border-ink-200 bg-white/65 px-[clamp(0.65rem,0.98vw,0.875rem)] py-[clamp(0.5rem,0.7vw,0.625rem)] backdrop-blur-xl"
                          : "flex min-w-[clamp(8.5rem,10.5vw,9.5rem)] flex-1 items-center gap-[clamp(0.5rem,0.7vw,0.625rem)] rounded-xl border border-white/15 bg-ink-950/40 px-[clamp(0.65rem,0.98vw,0.875rem)] py-[clamp(0.5rem,0.7vw,0.625rem)] backdrop-blur-xl"}
                      >
                        <span className={isLight
                            ? "grid size-[clamp(1.75rem,calc(1.25rem+0.83vw),2rem)] shrink-0 place-items-center rounded-lg bg-jade-100 text-jade-700"
                            : "grid size-[clamp(1.75rem,calc(1.25rem+0.83vw),2rem)] shrink-0 place-items-center rounded-lg bg-jade-500/20 text-jade-300"}>
                          {fact.value === "Courses" ? (
                            <BookOpen className="size-4" />
                          ) : fact.value === "Webinars" ? (
                            <Users className="size-4" />
                          ) : (
                            <GraduationCap className="size-4" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className={isLight
                            ? "block truncate font-display text-[clamp(0.8125rem,calc(0.625rem+0.208vw),0.8125rem)] font-bold text-ink-900"
                            : "block truncate font-display text-[clamp(0.8125rem,calc(0.625rem+0.208vw),0.8125rem)] font-bold text-white"}>
                            {t(fact.value)}
                          </span>
                          <span className={isLight
                            ? "mt-0.5 block truncate text-[10px] text-ink-600"
                            : "mt-0.5 block truncate text-[10px] text-white/55"}>
                            {t(fact.label)}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </article>
        );
      })}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 sm:h-20"
      >
        <svg
          className="absolute inset-x-0 bottom-0 h-16 w-full sm:h-20"
          viewBox="0 0 1440 112"
          preserveAspectRatio="none"
        >
          <path
            d="M0 47C180 87 332 86 492 52C654 18 790 17 950 51C1115 87 1259 86 1440 42V112H0Z"
            fill="#f7fafb"
          />
          <path
            d="M0 47C180 87 332 86 492 52C654 18 790 17 950 51C1115 87 1259 86 1440 42"
            fill="none"
            stroke="rgb(193 2 48 / 0.16)"
            strokeWidth="2"
          />
          <path
            d="M0 55C180 95 332 94 492 60C654 26 790 25 950 59C1115 95 1259 94 1440 50"
            fill="none"
            stroke="rgb(0 149 59 / 0.13)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <button
        type="button"
        aria-label={t("Show previous hero")}
        onClick={() => moveSlide(-1)}
        className={slides[activeIndex].tone === "light"
          ? "group absolute left-4 top-4 z-30 grid size-9 place-items-center rounded-full border border-ink-200 bg-white/65 text-ink-700 shadow-xl shadow-ink-900/10 backdrop-blur-xl transition-all hover:scale-105 hover:border-ink-300 hover:bg-white hover:text-ink-950 sm:max-[1400px]:bottom-16 sm:max-[1400px]:left-auto sm:max-[1400px]:right-[4.75rem] sm:max-[1400px]:top-auto sm:max-[1400px]:size-11 min-[1400px]:left-24 min-[1400px]:top-1/2 min-[1400px]:size-13 min-[1400px]:-translate-y-1/2"
          : "group absolute left-4 top-4 z-30 grid size-9 place-items-center rounded-full border border-white/20 bg-ink-950/55 text-white shadow-xl shadow-black/20 backdrop-blur-xl transition-all hover:scale-105 hover:border-white/40 hover:bg-white hover:text-ink-950 sm:max-[1400px]:bottom-16 sm:max-[1400px]:left-auto sm:max-[1400px]:right-[4.75rem] sm:max-[1400px]:top-auto sm:max-[1400px]:size-11 min-[1400px]:left-24 min-[1400px]:top-1/2 min-[1400px]:size-13 min-[1400px]:-translate-y-1/2"}
      >
        <ArrowRight className="size-4 rotate-180 transition-transform group-hover:-translate-x-0.5 lg:size-5" />
      </button>
      <button
        type="button"
        aria-label={t("Show next hero")}
        onClick={() => moveSlide(1)}
        className={slides[activeIndex].tone === "light"
          ? "group absolute right-4 top-4 z-30 grid size-9 place-items-center rounded-full border border-ink-200 bg-white/65 text-ink-700 shadow-xl shadow-ink-900/10 backdrop-blur-xl transition-all hover:scale-105 hover:border-ink-300 hover:bg-white hover:text-ink-950 sm:max-[1400px]:bottom-16 sm:max-[1400px]:right-6 sm:max-[1400px]:top-auto sm:max-[1400px]:size-11 min-[1400px]:right-24 min-[1400px]:top-1/2 min-[1400px]:size-13 min-[1400px]:-translate-y-1/2"
          : "group absolute right-4 top-4 z-30 grid size-9 place-items-center rounded-full border border-white/20 bg-ink-950/55 text-white shadow-xl shadow-black/20 backdrop-blur-xl transition-all hover:scale-105 hover:border-white/40 hover:bg-white hover:text-ink-950 sm:max-[1400px]:bottom-16 sm:max-[1400px]:right-6 sm:max-[1400px]:top-auto sm:max-[1400px]:size-11 min-[1400px]:right-24 min-[1400px]:top-1/2 min-[1400px]:size-13 min-[1400px]:-translate-y-1/2"}
      >
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 lg:size-5" />
      </button>

      <p
        aria-live="polite"
        className="sr-only"
      >{`${activeIndex + 1} of ${slides.length}: ${t(slides[activeIndex].tab)}`}</p>
    </section>
  );
}
