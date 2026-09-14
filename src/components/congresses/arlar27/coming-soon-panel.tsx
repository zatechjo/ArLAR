"use client";

import Link from "next/link";

import { ArrowRight, CalendarDays } from "@/components/icons";
import { useTranslations } from "@/i18n/locale-context";

type ComingSoonPanelProps = {
  label: string;
  title: string;
  description: string;
  items: readonly string[];
};

export function ComingSoonPanel({
  label,
  title,
  description,
  items,
}: ComingSoonPanelProps) {
  const { t, href } = useTranslations();
  return (
    <section className="bg-[#f3f6f6] py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid overflow-hidden rounded-[2rem] border border-[#d9e0e0] bg-white lg:grid-cols-[0.78fr_1.22fr]">
          <div className="relative overflow-hidden bg-[#08253e] p-7 text-white sm:p-10">
            <div aria-hidden className="absolute -bottom-24 -right-20 size-64 rounded-full border border-[#ffc21c]/24" />
            <div aria-hidden className="absolute -bottom-8 -right-3 size-40 rounded-full border border-white/10" />
            <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-[#ffd45c] uppercase">
              {t(label)}
            </p>
            <h2 className="mt-4 max-w-md font-display text-3xl font-semibold leading-[1.08] tracking-[-0.035em]">
              {t(title)}
            </h2>
            <p className="mt-5 max-w-md text-[13px] leading-6 text-white/62">
              {t(description)}
            </p>
            <span className="mt-10 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ffc21c]/35 bg-[#ffc21c]/10 px-4 font-display text-[10px] font-semibold tracking-[0.12em] text-[#ffd45c] uppercase">
              <CalendarDays className="size-4" />
              {t("Announcement forthcoming")}
            </span>
          </div>

          <div className="p-7 sm:p-10">
            <p className="font-display text-[10px] font-semibold tracking-[0.16em] text-[#0d4c7a] uppercase">
              {t("What will be published here")}
            </p>
            <div className="mt-5 divide-y divide-ink-200">
              {items.map((item, index) => (
                <div key={item} className="flex items-center gap-4 py-4 first:pt-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#eef5fa] font-display text-[10px] font-semibold text-[#0d4c7a]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="font-display text-[14px] font-medium text-ink-900">{t(item)}</p>
                </div>
              ))}
            </div>
            <Link
              href={href("/contact")}
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#032b52] px-5 font-display text-[12px] font-semibold text-[#ffd45c] transition-colors hover:bg-[#0d4c7a]"
            >
              {t("Contact the Secretariat")}
              <ArrowRight className="rtl-flip size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
