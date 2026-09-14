"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  FileText,
  HeartPulse,
  Users,
} from "@/components/icons";
import { ScientificBackdrop } from "@/components/home/scientific-backdrop";
import { useTranslations } from "@/i18n/locale-context";

const links = [
  {
    label: "Member events",
    description: "See what is happening across the region.",
    href: "/events/members",
    icon: CalendarDays,
    tone: "crimson",
    eyebrow: "Plan your year",
  },
  {
    label: "ArLAR members",
    description: "Connect with the regional community.",
    href: "/members",
    icon: Users,
    tone: "blue",
    eyebrow: "Meet the network",
  },
  {
    label: "Publications",
    description: "Recommendations and scientific output.",
    href: "/professionals/publications",
    icon: FileText,
    tone: "crimson",
    eyebrow: "Go deeper",
  },
  {
    label: "For patients",
    description: "Trusted information for patients and families.",
    href: "/public-patients",
    icon: HeartPulse,
    tone: "jade",
    eyebrow: "Care starts here",
  },
  {
    label: "Special Interest Groups",
    description: "Find focused communities and research networks.",
    href: "/special-interest-groups",
    icon: Users,
    tone: "blue",
    eyebrow: "Find your people",
  },
] as const;

const featuredSlides = [
  {
    eyebrow: "Learn with ArLAR",
    label: "ArLAR College",
    description: "Structured education, expert faculty, and on-demand learning for the next generation of rheumatologists.",
    href: "/college/about",
    action: "Explore the college",
    icon: BookOpen,
    accent: "jade",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80",
  },
  {
    eyebrow: "Keep learning",
    label: "Educational library",
    description: "A growing collection of lectures, webinars, and resources designed for everyday practice.",
    href: "/education",
    action: "Browse the library",
    icon: FileText,
    accent: "blue",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1400&q=80",
  },
  {
    eyebrow: "Stay up to date",
    label: "Latest news",
    description: "The latest updates, announcements, and stories from the ArLAR community.",
    href: "/news",
    action: "Read latest news",
    icon: FileText,
    accent: "crimson",
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1400&q=80",
  },
] as const;

const toneStyles = {
  crimson: {
    icon: "bg-crimson-50 text-crimson-600",
    label: "text-crimson-600",
    hover: "group-hover:border-crimson-200",
  },
  jade: {
    icon: "bg-jade-50 text-jade-700",
    label: "text-jade-700",
    hover: "group-hover:border-jade-200",
  },
  blue: {
    icon: "bg-sky-50 text-sky-700",
    label: "text-sky-700",
    hover: "group-hover:border-sky-200",
  },
} as const;

export function QuickLinksSection() {
  const { locale, t, href } = useTranslations();
  const isRtl = locale === "ar";
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [, ...secondary] = links;
  const featured = featuredSlides[activeSlide];
  const nextSlide = () => setActiveSlide((current) => (current + 1) % featuredSlides.length);
  const previousSlide = () => setActiveSlide((current) => (current - 1 + featuredSlides.length) % featuredSlides.length);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % featuredSlides.length);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [activeSlide, isPaused]);

  return (
    <section className="relative isolate overflow-hidden bg-[#f7fafb] px-4 py-16 sm:px-6 lg:py-24">
      <ScientificBackdrop variant="shortcuts" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-4 lg:grid-cols-4 lg:grid-rows-2">
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsPaused(false);
              }
            }}
            className="group relative flex h-[370px] min-h-0 flex-col overflow-hidden rounded-[1.75rem] bg-ink-950 p-7 text-white shadow-xl shadow-ink-950/10 transition-transform duration-300 hover:-translate-y-1 sm:h-[388px] sm:p-9 lg:h-full lg:col-span-2 lg:row-span-2"
          >
            <div
              key={featured.image}
              aria-hidden="true"
              className="animate-shortcut-image absolute inset-0 bg-cover bg-center opacity-[0.34] mix-blend-screen"
              style={{ backgroundImage: `url("${featured.image}")` }}
            />
            <span aria-hidden className={`absolute inset-0 ${isRtl ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-ink-950 via-ink-950/85 to-transparent`} />
            <span aria-hidden className="absolute -right-20 -top-20 size-72 rounded-full border-[32px] border-crimson-600/20" />
            <span aria-hidden className="absolute -bottom-28 -right-12 size-64 rounded-full border-[22px] border-jade-400/15" />
            {!isRtl ? <span aria-hidden className={`absolute bottom-8 left-8 h-px w-28 bg-gradient-to-r ${featured.accent === "jade" ? "from-jade-300" : featured.accent === "blue" ? "from-sky-300" : "from-crimson-400"} to-transparent`} /> : null}
            <Link key={featured.label} href={href(featured.href)} className="animate-shortcut-slide relative flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-white/75">
                  <span className={`size-1.5 animate-pulse rounded-full ${featured.accent === "jade" ? "bg-jade-300" : featured.accent === "blue" ? "bg-sky-300" : "bg-crimson-300"}`} />
                  {t(featured.eyebrow)}
                </span>
                <span className={`flex size-11 items-center justify-center rounded-2xl bg-white/10 transition-colors group-hover:bg-white group-hover:text-ink-950 ${featured.accent === "jade" ? "text-jade-300" : featured.accent === "blue" ? "text-sky-300" : "text-crimson-300"}`}>
                  <featured.icon className="size-5" />
                </span>
              </div>
              <div className={`mt-auto ${isRtl ? "pt-8" : "pt-16"}`}>
                <h3 className={`line-clamp-2 max-w-md font-display text-2xl font-semibold leading-tight sm:text-3xl ${isRtl ? "truncate whitespace-nowrap" : ""}`}>
                  {t(featured.label)}
                </h3>
                <p className={`mt-3 max-w-sm text-[14px] leading-relaxed text-white/60 ${isRtl ? "line-clamp-2" : "line-clamp-3"}`}>
                  {t(featured.description)}
                </p>
                <span className={`${isRtl ? "mt-5" : "mt-7"} inline-flex shrink-0 items-center gap-2 font-display text-[13px] font-semibold text-white`}>
                  {t(featured.action)}
                  <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
            <div className="relative mt-7 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-1.5" aria-label={t("Featured shortcuts")}>
                  {featuredSlides.map((slide, index) => (
                    <button
                      key={slide.label}
                      type="button"
                      aria-label={`${t("Show")} ${t(slide.label)}`}
                      aria-current={index === activeSlide}
                      onClick={(event) => {
                        event.preventDefault();
                        setActiveSlide(index);
                      }}
                      className={`h-1.5 rounded-full transition-all ${index === activeSlide ? "w-7 bg-white" : "w-1.5 bg-white/35 hover:bg-white/70"}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" aria-label={t("Previous featured shortcut")} onClick={(event) => { event.preventDefault(); previousSlide(); }} className="flex size-8 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                    <ArrowRight className={`size-3.5 ${isRtl ? "" : "rotate-180"}`} />
                  </button>
                  <button type="button" aria-label={t("Next featured shortcut")} onClick={(event) => { event.preventDefault(); nextSlide(); }} className="flex size-8 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                    <ArrowRight className={`size-3.5 ${isRtl ? "rtl-flip" : ""}`} />
                  </button>
                </div>
            </div>
          </div>

          {secondary.map((link, index) => {
            const Icon = link.icon;
            const tone = toneStyles[link.tone];
            return (
              <Link
                key={link.label}
                href={href(link.href)}
                className={`group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-[1.5rem] border border-ink-100 bg-white p-5 transition-all duration-300 hover:-translate-y-1 ${tone.hover}`}
              >
                <span aria-hidden className={`absolute -right-8 -top-8 size-24 rounded-full ${index % 2 === 0 ? "bg-jade-50" : "bg-crimson-50"} opacity-70 transition-transform duration-500 group-hover:scale-150`} />
                <div className="relative flex items-start justify-between gap-3">
                  <span className={`flex size-10 items-center justify-center rounded-xl ${tone.icon}`}>
                    <Icon className="size-5" />
                  </span>
                  <ArrowUpRight className="size-4 text-ink-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-800" />
                </div>
                <div className="relative mt-7">
                  <span className={`font-display text-[10px] font-semibold uppercase tracking-[0.16em] ${tone.label}`}>
                    {t(link.eyebrow)}
                  </span>
                  <h3 className="mt-1.5 font-display text-[15px] font-semibold leading-snug text-ink-950">
                    {t(link.label)}
                  </h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">{t(link.description)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
