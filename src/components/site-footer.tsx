"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Globe } from "@/components/icons";
import { NewsletterForm } from "@/components/newsletter-form";
import { Facebook, Instagram, LinkedIn, X } from "@/components/social-icons";
import type { arlarSocialLinks } from "@/lib/contact-links";
import { languages } from "@/lib/navigation";
import { localizePath, type Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/locale-context";

const footerColumns = [
  {
    heading: "Discover",
    links: [
      { label: "About ArLAR", href: "/about" },
      { label: "Member Societies", href: "/members" },
      { label: "ArLAR College", href: "/college/about" },
      { label: "Educational Library", href: "/education" },
      { label: "Latest News", href: "/news" },
    ],
  },
  {
    heading: "Take part",
    links: [
      { label: "ArLAR27 Iraq", href: "/congresses/arlar27" },
      { label: "Special Interest Groups", href: "/special-interest-groups" },
      { label: "Member Events", href: "/events/members" },
      { label: "Contact the Secretariat", href: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Publications", href: "/professionals/publications" },
      { label: "ArLAR E-Bulletin", href: "/professionals/e-bulletin" },
      { label: "For Public and Patients", href: "/public-patients" },
      { label: "ArLAR Partners", href: "/professionals/partners" },
      { label: "ArLAR23 Kuwait Replays", href: "/congresses/arlar23-replay" },
      { label: "ArLAR21 Jordan Replays", href: "/congresses/arlar21-replay" },
      { label: "ArLAR Bylaws", href: "/about/bylaws" },
    ],
  },
] as const;

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  x: X,
  linkedin: LinkedIn,
};

export function SiteFooter({ locale, socialLinks }: { locale: Locale; socialLinks: typeof arlarSocialLinks }) {
  const { t, href } = useTranslations();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <footer
      id="site-footer"
      className="relative isolate overflow-hidden bg-[#050c14] text-white"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_8%_25%,rgba(0,149,59,0.1),transparent_26%),radial-gradient(circle_at_92%_10%,rgba(56,189,248,0.08),transparent_28%),radial-gradient(circle_at_58%_100%,rgba(193,2,48,0.07),transparent_25%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-crimson-500 via-white/15 to-jade-400"
      />
      <svg
        aria-hidden
        className="absolute -right-28 bottom-16 size-[34rem] text-white opacity-[0.025]"
        viewBox="0 0 500 500"
        fill="none"
      >
        <path
          d="M250 34 437 142v216L250 466 63 358V142L250 34Z"
          stroke="currentColor"
        />
        <path
          d="M250 110 371 180v140L250 390 129 320V180l121-70Z"
          stroke="currentColor"
        />
        <circle cx="250" cy="250" r="52" stroke="currentColor" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:pt-20">
        <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-sm sm:p-8 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:p-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-jade-400" />
              <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-sky-100/55 uppercase">
                {t("Stay connected")}
              </p>
            </div>
            <h2 className="mt-4 max-w-xl font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-3xl">
              {t("Important rheumatology updates, directly from ArLAR.")}
            </h2>
            <p className="mt-3 max-w-lg text-[12px] leading-6 text-sky-100/45 sm:text-[13px]">
              {t("Receive congress announcements, College webinars, publications, and regional opportunities in one concise update.")}
            </p>
          </div>

          <NewsletterForm />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.15fr_1.85fr]">
          <div>
            <div className="inline-flex rounded-2xl bg-white px-5 py-4">
              <Image
                src="/arlar-logo.png"
                alt="ArLAR - Arab League of Associations for Rheumatology"
                width={180}
                height={92}
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="mt-5 max-w-sm text-[13px] leading-6 text-sky-100/45">
              {t("Connecting national societies across the Arab world to advance rheumatology care, education, research, and professional collaboration.")}
            </p>
            <p className="mt-4 font-display text-[10px] font-semibold tracking-[0.13em] text-jade-300/70 uppercase">
              {t("Advancing rheumatology since 1995")}
            </p>

            <div className="mt-7 flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = socialIcons[social.platform];
                return (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white/55 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <nav
            aria-label={t("Footer navigation")}
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3"
          >
            {footerColumns.map((column) => (
              <div key={column.heading}>
                <h3 className="font-display text-[10px] font-semibold tracking-[0.16em] text-white/35 uppercase">
                  {t(column.heading)}
                </h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={href(link.href)}
                        className="text-[13px] text-sky-100/60 transition-colors hover:text-white"
                      >
                        {t(link.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="text-[11px] text-white/30">
              © {new Date().getFullYear()} ArLAR. {t("All rights reserved.")}
            </p>
            <Link
              href={href("/privacy")}
              className="text-[11px] text-white/35 transition-colors hover:text-white"
            >
              {t("Privacy policy")}
            </Link>
            <Link
              href={href("/terms")}
              className="text-[11px] text-white/35 transition-colors hover:text-white"
            >
              {t("Terms & conditions")}
            </Link>
            <a
              href="https://zatechjo.com"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full border border-jade-400/15 bg-jade-400/7 px-2.5 py-1 text-[10.5px] text-white/35 transition-colors hover:border-jade-300/35 hover:bg-jade-400/12 hover:text-white/70"
            >
              {t("Website by")} <span className="font-display font-semibold text-jade-300/80">ZAtech</span>
              <ArrowUpRight className="size-3 text-jade-300/55 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Globe className="mr-1 size-4 text-white/35" />
            {languages.map((language, index) => (
              <span key={language.code} className="flex items-center">
                {index > 0 ? (
                  <span className="mx-2 text-white/15">/</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => router.replace(localizePath(pathname, language.code))}
                  className={`text-[11px] transition-colors hover:text-white ${
                    language.code === locale
                      ? "font-semibold text-white"
                      : "text-white/40"
                  }`}
                >
                  {language.nativeLabel}
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
