import type { ReactNode } from "react";
import Link from "next/link";

import { ArrowRight, Check, ChevronDown, Mail } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: ReactNode[];
  bullets?: ReactNode[];
  notice?: ReactNode;
};

type LegalPageProps = {
  locale: Locale;
  title: string;
  description: string;
  updated: string;
  grainId: string;
  introduction: ReactNode;
  sections: LegalSection[];
  relatedHref: "/privacy" | "/terms";
  relatedLabel: string;
};

export function LegalPage({
  locale,
  title,
  description,
  updated,
  grainId,
  introduction,
  sections,
  relatedHref,
  relatedLabel,
}: LegalPageProps) {
  const t = (source: string) => translate(locale, source);
  const renderTranslated = (node: ReactNode) => typeof node === "string" ? t(node) : node;
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: title }]}
        title={title}
        description={description}
        grainId={grainId}
      >
        <p className="mt-6 inline-flex rounded-full border border-white/15 bg-white/7 px-3.5 py-2 font-display text-[10.5px] font-semibold text-white/65 backdrop-blur-sm">
          {t("Last updated")} {t(updated)}
        </p>
      </PageHero>

      <section className="bg-[#f4f7f6] py-10 sm:py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-9">
          <details className="group rounded-[1.35rem] border border-ink-100 bg-white lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
              <span className="font-display text-[10px] font-semibold tracking-[0.16em] text-crimson-600 uppercase">
                {t("On this page")}
              </span>
              <ChevronDown className="size-4 text-ink-400 transition-transform group-open:rotate-180" />
            </summary>
            <ol className="grid gap-0.5 border-t border-ink-100 px-3 py-3 sm:grid-cols-2">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex items-start gap-3 rounded-xl px-3 py-2.5 text-[11.5px] leading-5 text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-950"
                  >
                    <span className="mt-0.5 font-display text-[9px] font-semibold text-ink-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{t(section.title)}</span>
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <aside className="hidden gap-4 lg:sticky lg:top-56 lg:grid">
            <nav
              aria-label={`${title} sections`}
              className="rounded-[1.5rem] border border-ink-100 bg-white p-5"
            >
              <p className="font-display text-[9.5px] font-semibold tracking-[0.16em] text-crimson-600 uppercase">
                {t("On this page")}
              </p>
              <ol className="mt-4 grid gap-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group flex items-start gap-3 rounded-xl px-2.5 py-2.5 text-[11.5px] leading-5 text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-950"
                    >
                      <span className="mt-0.5 font-display text-[9px] font-semibold text-ink-300 transition-colors group-hover:text-crimson-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{t(section.title)}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="relative isolate overflow-hidden rounded-[1.4rem] bg-[#07131f] p-5 text-white">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(0,149,59,0.24),transparent_38%),radial-gradient(circle_at_5%_100%,rgba(193,2,48,0.2),transparent_42%)]"
              />
              <div className="relative">
                <span className="grid size-9 place-items-center rounded-xl bg-white/8 text-jade-300 ring-1 ring-inset ring-white/10">
                  <Mail className="size-4" />
                </span>
                <h2 className="mt-4 font-display text-[15px] font-semibold">
                  {t("Questions about this page?")}
                </h2>
                <p className="mt-2 text-[10.5px] leading-5 text-sky-50/50">
                  {t("Contact the ArLAR Secretariat for clarification or a privacy-related request.")}
                </p>
                <a
                  href="mailto:info.arlar@arabrheumatology.org"
                  className="mt-4 inline-flex items-center gap-2 font-display text-[10.5px] font-semibold text-jade-300 transition-colors hover:text-white"
                >
                  {t("Email the Secretariat")}
                  <ArrowRight className="rtl-flip size-3.5" />
                </a>
              </div>
            </div>
          </aside>

          <article className="overflow-hidden rounded-[1.8rem] border border-ink-100 bg-white">
            <div className="border-b border-ink-100 bg-[linear-gradient(120deg,rgba(193,2,48,0.045),transparent_42%,rgba(0,149,59,0.055))] p-6 sm:p-8 lg:p-10">
              <p className="max-w-3xl text-[14px] leading-7 text-ink-600 sm:text-[15px]">
                {renderTranslated(introduction)}
              </p>
            </div>

            <div className="px-6 sm:px-8 lg:px-10">
              {sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-60 border-b border-ink-100 py-8 last:border-b-0 sm:py-10"
                >
                  <div className="flex items-start gap-4 sm:gap-5">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-crimson-50 font-display text-[9px] font-bold text-crimson-700 ring-1 ring-inset ring-crimson-100">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-xl font-semibold tracking-[-0.025em] text-ink-950 sm:text-2xl">
                        {t(section.title)}
                      </h2>

                      {section.paragraphs?.length ? (
                        <div className="mt-4 grid gap-3.5 text-[12.5px] leading-6 text-ink-600 sm:text-[13.5px] sm:leading-7">
                          {section.paragraphs.map((paragraph, paragraphIndex) => (
                            <p key={paragraphIndex}>{renderTranslated(paragraph)}</p>
                          ))}
                        </div>
                      ) : null}

                      {section.bullets?.length ? (
                        <ul className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-x-6">
                          {section.bullets.map((bullet, bulletIndex) => (
                            <li
                              key={bulletIndex}
                              className="flex items-start gap-2.5 text-[12px] leading-6 text-ink-600 sm:text-[13px]"
                            >
                              <Check className="mt-1 size-3.5 shrink-0 text-jade-700" />
                              <span>{renderTranslated(bullet)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {section.notice ? (
                        <div className="mt-5 rounded-2xl border border-jade-100 bg-jade-50/65 px-4 py-3.5 text-[11.5px] leading-6 text-jade-950/75 sm:text-[12.5px]">
                          {renderTranslated(section.notice)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-ink-100 bg-[#f8faf9] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
              <p className="text-[11px] text-ink-400">
                {t("This page should be read together with the rest of the ArLAR website information.")}
              </p>
              <Link
                href={localizePath(relatedHref, locale)}
                className="group inline-flex items-center gap-2 font-display text-[11.5px] font-semibold text-crimson-700 transition-colors hover:text-crimson-900"
              >
                {t(relatedLabel)}
                <ArrowRight className="rtl-flip size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
