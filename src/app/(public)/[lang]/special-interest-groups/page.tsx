import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import { getManagedSigDirectoryAsync } from "@/lib/sig-directory-repository";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export const generateMetadata = createStaticPageMetadata("/special-interest-groups");

export default async function SpecialInterestGroupsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const href = (path: string) => localizePath(path, lang);
  const groups = (await filterDeletedAdminRecordsAsync(
    "sigs",
    (await getManagedSigDirectoryAsync()).map((group) => ({ ...group, id: group.slug })),
  )).filter((group) => group.visible);
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Special Interest Groups" }]}
        title="Special Interest Groups"
        description="Focused communities bringing together expertise from across the Arab rheumatology network."
        grainId="special-interest-groups-grain"
      />

      <section className="relative overflow-hidden bg-[#f5f8f7] py-16 lg:py-20">
        <div
          aria-hidden
          className="absolute -left-36 top-24 size-80 rounded-full bg-crimson-50/80 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-36 bottom-20 size-80 rounded-full bg-jade-50 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-crimson-600" />
                <p className="font-display text-[11px] font-semibold tracking-[0.17em] text-ink-500 uppercase">
                  {t("The SIG network")}
                </p>
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink-950 sm:text-4xl">
                {t("Nine groups. One collaborative network.")}
              </h2>
              <p className="mt-4 max-w-xl text-[14px] leading-7 text-ink-500">
                {t("Each group connects ArLAR members around a focused area of rheumatology, research, education, or professional practice.")}
              </p>
            </div>

            <div className="hidden items-end gap-3 border-l border-ink-200 pl-6 sm:flex">
              <strong className="font-display text-4xl font-semibold leading-none text-jade-700">
                {String(groups.length).padStart(2, "0")}
              </strong>
              <span className="pb-0.5 font-display text-[10px] font-semibold leading-4 tracking-[0.13em] text-ink-400 uppercase">
                {t("Special interest")}
                <br />
                {t("groups")}
              </span>
            </div>
          </div>

          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group, index) => (
              <li key={group.slug}>
                <Link
                  href={href("/special-interest-groups/" + group.slug)}
                  className="group flex h-full min-h-[23rem] cursor-pointer flex-col overflow-hidden rounded-[1.65rem] border border-ink-100 bg-white transition-[border-color,box-shadow,transform] duration-500 ease-out hover:-translate-y-1 hover:border-jade-200 hover:shadow-xl hover:shadow-ink-950/6"
                >
                  <div className="relative flex h-[13rem] items-center justify-center overflow-hidden border-b border-ink-100 bg-[#fbfcfc] p-7">
                    <div
                      aria-hidden
                      className="absolute -right-12 -top-12 size-32 rounded-full border-[18px] border-jade-50/80 transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                      aria-hidden
                      className="absolute -bottom-16 -left-14 size-32 rounded-full border-[18px] border-crimson-50/75"
                    />
                    <div className="relative h-[8.5rem] w-full">
                      <Image
                        src={group.logo}
                        alt={t(group.name) + " " + t("logo")}
                        fill
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 24rem"
                        className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-display text-[10px] font-semibold tracking-[0.16em] text-crimson-600 uppercase">
                        {group.abbreviation}
                      </span>
                      <span className="font-display text-[10px] font-semibold tracking-[0.12em] text-ink-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-4 max-w-sm font-display text-[21px] font-semibold leading-7 tracking-[-0.025em] text-ink-950">
                      {t(group.name)}
                    </h3>
                    <div className="mt-auto pt-6">
                      <div className="h-px bg-linear-to-r from-ink-100 to-transparent" />
                      <span className="mt-4 inline-flex items-center gap-2 font-display text-[14px] font-semibold text-ink-900 transition-colors duration-300 group-hover:text-crimson-700">
                        {t("View group")}
                        <ArrowRight className="rtl-flip size-[1.05rem] text-crimson-600 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
