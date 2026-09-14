"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/i18n/locale-context";
import { localeFromPathname } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export type Crumb = {
  label: string;
  href?: string;
};

type PageHeroProps = {
  breadcrumbs: Crumb[];
  title: string;
  description: string;
  grainId: string;
  eyebrow?: string;
  clearBackground?: boolean;
  heroLogo?: {
    src: string;
    alt: string;
    frame?: "square" | "landscape" | "wide" | "ultrawide";
  };
  compactTitle?: boolean;
  children?: React.ReactNode;
};

export function PageHero({
  breadcrumbs,
  title,
  description,
  grainId,
  eyebrow,
  clearBackground = true,
  heroLogo,
  compactTitle = false,
  children,
}: PageHeroProps) {
  const { href: localizedHref } = useTranslations();
  // PageHero is a client component rendered across the server/client
  // boundary. Derive the locale from the URL as well as context so the first
  // server-rendered HTML is translated (the context provider itself lives in
  // the client SiteShell).
  const pathname = usePathname();
  const locale = localeFromPathname(pathname || "/");
  const t = (source: string) => translate(locale, source);
  const href = (path: string) => {
    if (locale === "en") return localizedHref(path);
    return `/${locale}${path === "/" ? "" : path}`;
  };
  return (
    <section className="relative isolate min-h-[18rem] overflow-hidden bg-[#07131f] text-white sm:min-h-[19rem] lg:min-h-[20rem]">
      <Image
        src="/images/subpage-hero-medical.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className={`rtl-hero-mirror object-cover object-center ${
          clearBackground ? "opacity-[0.34]" : "opacity-[0.18]"
        }`}
        style={{
          filter: clearBackground
            ? "blur(2px) saturate(96%)"
            : "blur(6px) saturate(92%)",
          transform: clearBackground ? "scale(1.02)" : "scale(1.04)",
        }}
      />
      <div
        aria-hidden
        className={`rtl-hero-mirror absolute inset-0 ${
          clearBackground
            ? "bg-[linear-gradient(90deg,rgba(5,13,22,0.94)_0%,rgba(5,13,22,0.78)_43%,rgba(5,13,22,0.3)_74%,rgba(5,13,22,0.16)_100%)]"
            : "bg-[linear-gradient(90deg,rgba(5,13,22,0.97)_0%,rgba(5,13,22,0.86)_43%,rgba(5,13,22,0.45)_74%,rgba(5,13,22,0.28)_100%)]"
        }`}
      />
      <div
        aria-hidden
        className="rtl-hero-mirror absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(193,2,48,0.22),transparent_27%),radial-gradient(circle_at_84%_70%,rgba(0,149,59,0.14),transparent_32%)]"
      />
      <div
        aria-hidden
        className={`rtl-hero-mirror absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_0)] [background-size:24px_24px] [mask-image:linear-gradient(90deg,black,transparent_72%)] ${
          clearBackground ? "opacity-15" : "opacity-25"
        }`}
      />
      <svg
        aria-hidden
        className={`absolute inset-0 size-full mix-blend-soft-light ${
          clearBackground ? "opacity-[0.07]" : "opacity-[0.11]"
        }`}
        preserveAspectRatio="none"
      >
        <filter id={grainId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.78"
            numOctaves="3"
            seed="8"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>

      <div className="relative mx-auto flex min-h-[18rem] max-w-7xl flex-col justify-center px-4 py-9 sm:min-h-[19rem] sm:px-6 lg:min-h-[20rem]">
        <nav
          aria-label={t("Breadcrumb")}
          className="flex flex-wrap items-center gap-2.5 font-display text-[13px] font-medium text-white/60"
        >
          <Link href={href("/")} className="transition-colors hover:text-white">
            {t("Home")}
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-2.5">
              <span aria-hidden className="text-white/25">
                /
              </span>
              {crumb.href ? (
                <Link
                  href={href(crumb.href)}
                  className="transition-colors hover:text-white"
                >
                  {t(crumb.label)}
                </Link>
              ) : (
                <span className="text-white/85">{t(crumb.label)}</span>
              )}
            </span>
          ))}
        </nav>

        <div
          className={`mt-6 ${
            heroLogo
              ? "flex max-w-6xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6 lg:gap-8"
              : "max-w-3xl"
          }`}
        >
          <div className={heroLogo ? "w-full min-w-0 max-w-3xl flex-1 sm:w-auto" : "min-w-0"}>
            {eyebrow ? (
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-9 bg-jade-400" />
                <p className="font-display text-[10.5px] font-semibold tracking-[0.17em] text-jade-300/85 uppercase">
                  {t(eyebrow)}
                </p>
              </div>
            ) : null}
            <h1 className={`font-display font-semibold tracking-[-0.045em] ${compactTitle ? "text-3xl leading-[1.02] sm:text-4xl lg:text-5xl" : "text-4xl leading-[1.02] sm:text-5xl"}`}>
              {t(title)}
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-sky-50/72 sm:text-[16px]">
              {t(description)}
            </p>
            {children}
          </div>

          {heroLogo ? (
            <div
              className={`order-first relative shrink-0 overflow-hidden rounded-[1.35rem] border border-white/30 bg-white p-3 shadow-2xl shadow-black/20 sm:p-4 ${
                heroLogo.frame === "ultrawide"
                  ? "aspect-[3/1] w-40 sm:w-44 lg:w-60"
                  : heroLogo.frame === "wide"
                    ? "aspect-[2.25/1] w-40 sm:w-44 lg:w-60"
                    : heroLogo.frame === "landscape"
                      ? "aspect-[5/4] w-28 sm:w-36 lg:w-48"
                      : "aspect-square w-28 sm:w-32 lg:w-44"
              }`}
            >
              <div className="relative size-full">
                <Image
                  src={heroLogo.src}
                  alt={heroLogo.alt}
                  fill
                  priority
                  sizes="(max-width: 640px) 96px, (max-width: 1024px) 144px, 176px"
                  className="object-contain"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-crimson-500 via-white/20 to-jade-400"
      />
    </section>
  );
}
