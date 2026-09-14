"use client";

import Link from "next/link";
import { useTranslations } from "@/i18n/locale-context";

type Arlar27PageHeroProps = {
  title: string;
  description: string;
};

export function Arlar27PageHero({ title, description }: Arlar27PageHeroProps) {
  const { t, href } = useTranslations();
  return (
    <section className="border-b border-ink-200 bg-[#f7f9f9]">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:py-11">
        <nav
          className="flex flex-wrap items-center gap-2.5 text-[11px] font-medium text-ink-400"
          aria-label={t("Breadcrumb")}
        >
          <Link href={href("/")} className="transition-colors hover:text-ink-900">
            {t("Home")}
          </Link>
          <span aria-hidden className="text-ink-300">/</span>
          <Link
            href={href("/congresses/arlar27")}
            className="transition-colors hover:text-ink-900"
          >
            ArLAR27
          </Link>
          <span aria-hidden className="text-ink-300">/</span>
          <span className="text-[#0d4c7a]">{t(title)}</span>
        </nav>

        <div className="mt-5 max-w-3xl">
          <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-ink-950 sm:text-5xl">
            {t(title)}
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-7 text-ink-500 sm:text-[15px]">
            {t(description)}
          </p>
        </div>
      </div>
    </section>
  );
}
