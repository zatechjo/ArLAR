import { createStaticPageMetadata } from "@/lib/seo";

import { Arlar27PageHero } from "@/components/congresses/arlar27/page-hero";
import { CalendarDays } from "@/components/icons";
import { arlar27Days } from "@/data/arlar27";
import type { Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { getPublishedSiteContent } from "@/lib/site-content-repository";

export const generateMetadata = createStaticPageMetadata("/congresses/arlar27/programme");

export default async function Arlar27ProgrammePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const days = await getPublishedSiteContent("arlar27", "days", arlar27Days);
  return (
    <main>
      <Arlar27PageHero title="Scientific Programme" description="Four days in Baghdad dedicated to the science, practice, and future of rheumatology." />

      <section className="bg-[#f3f6f6] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-[#0d4c7a] uppercase">{t("24–27 March 2027")}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-ink-950 sm:text-4xl">{t("Build your congress schedule.")}</h2>
            </div>
            <p className="max-w-lg text-[13px] leading-6 text-ink-500">{t("Session times, halls, tracks, and faculty will be added after the scientific programme is approved.")}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {days.map((day, index) => (
              <article key={day.day} className="overflow-hidden rounded-[1.65rem] border border-[#dce3e2] bg-white">
                <div className="border-b border-[#dce3e2] bg-[#08253e] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <CalendarDays className="size-5 text-[#ffc21c]" />
                    <span className="font-display text-[10px] font-semibold text-white/36">0{index + 1}</span>
                  </div>
                  <p className="mt-8 font-display text-[10px] font-semibold tracking-[0.15em] text-[#ffd45c] uppercase">{t(day.day)}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-6">{t(day.date)}</h3>
                </div>
                <div className="p-6">
                  <p className="text-[12px] leading-6 text-ink-500">{t("The detailed schedule for this day will be announced.")}</p>
                  <p className="mt-6 border-t border-ink-200 pt-4 font-display text-[9px] font-semibold tracking-[0.13em] text-[#a9873e] uppercase">{t("Programme forthcoming")}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.6rem] border border-[#dce3e2] bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
            <div>
              <h3 className="font-display text-xl font-semibold text-ink-950">{t("Programme updates")}</h3>
              <p className="mt-2 text-[12px] leading-6 text-ink-500">{t("The downloadable programme and session filters will appear here once the schedule is released.")}</p>
            </div>
            <span className="mt-5 inline-flex min-h-10 items-center rounded-full bg-[#eef5fa] px-4 font-display text-[10px] font-semibold tracking-[0.12em] text-[#0d4c7a] uppercase sm:mt-0">{t("Coming soon")}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
