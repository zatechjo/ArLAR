import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";

import { ArrowUpRight } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import type { Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { getPublishedProfessionalResourcesAsync } from "@/lib/professional-resources-repository";
import { publicMediaUrl } from "@/lib/media-url";

export const generateMetadata = createStaticPageMetadata("/professionals/e-bulletin");

const bulletinFallbacks = [
  {
    issue: "05",
    label: "Fifth issue",
    date: "January 2026",
    cover: "/images/e-bulletin/issue-05-cover.jpg",
    href: "/documents/e-bulletin/arlar-e-bulletin-issue-05.pdf",
  },
  {
    issue: "04",
    label: "Fourth issue",
    date: "August 2024",
    cover: "/images/e-bulletin/issue-04-cover.jpg",
    href: "/documents/e-bulletin/arlar-e-bulletin-issue-04.pdf",
  },
  {
    issue: "03",
    label: "Third issue",
    date: "January 2024",
    cover: "/images/e-bulletin/issue-03-cover.png",
    href: "/documents/e-bulletin/arlar-e-bulletin-issue-03.pdf",
  },
  {
    issue: "02",
    label: "Second issue",
    date: "October 2023",
    cover: "/images/e-bulletin/issue-02-cover.jpg",
    href: "/documents/e-bulletin/arlar-e-bulletin-issue-02.pdf",
  },
  {
    issue: "01",
    label: "First issue",
    date: "January 2022",
    cover: "/images/e-bulletin/issue-01-cover.jpg",
    href: "/documents/e-bulletin/arlar-e-bulletin-issue-01.pdf",
  },
] as const;

export default async function EBulletinPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const managedBulletins = (await getPublishedProfessionalResourcesAsync("bulletin")).map((resource) => ({
    issue: resource.issueNumber || resource.id.replace("bulletin-", ""),
    label: resource.title.replace(/^ArLAR E-Bulletin\s*[—-]\s*/i, ""),
    date: resource.date ? new Intl.DateTimeFormat(lang === "ar" ? "ar-JO" : lang === "fr" ? "fr-FR" : "en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${resource.date}T12:00:00Z`)) : t("Undated"),
    cover: resource.image || bulletinFallbacks.find((bulletin) => bulletin.issue === (resource.issueNumber || resource.id.replace("bulletin-", "")))?.cover || "",
    href: publicMediaUrl(resource.resourceUrl || resource.publicHref),
  }));
  const bulletins = managedBulletins;
  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "For Healthcare Professionals" },
          { label: "ArLAR E-Bulletin" },
        ]}
        title="ArLAR E‑Bulletin"
        description="News, activities, and updates from the ArLAR community, collected by the ArLAR Media Group."
        grainId="e-bulletin-hero-grain"
      >
        <div className="mt-8 flex items-end gap-3">
          <strong className="font-display text-3xl font-semibold leading-none text-white">
            {bulletins.length.toString().padStart(2, "0")}
          </strong>
          <span className="pb-0.5 font-display text-[10px] font-semibold tracking-[0.14em] text-sky-100/55 uppercase">
            {t("Issues in the archive")}
          </span>
        </div>
      </PageHero>

      <section className="bg-[#f5f8f7] py-12 sm:py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-crimson-600" />
                <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-crimson-600 uppercase">
                  {t("Complete archive")}
                </p>
              </div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
                {t("Browse every issue")}
              </h2>
            </div>
            <p className="max-w-md text-[12.5px] leading-6 text-ink-500">
              {t("Select an issue to open the original E‑Bulletin as a PDF in your browser.")}
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            {bulletins.map((bulletin, index) => (
              <a
                key={bulletin.issue}
                href={bulletin.href}
                target="_blank"
                rel="noreferrer"
                className="group grid cursor-pointer overflow-hidden rounded-[1.7rem] border border-ink-100 bg-white transition-[transform,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-jade-200 sm:grid-cols-[minmax(0,0.86fr)_minmax(0,1fr)]"
              >
                <div className="relative aspect-[0.707] overflow-hidden border-b border-ink-100 bg-[#f4eeeb] sm:border-r sm:border-b-0">
                  {bulletin.cover ? (
                    <Image
                      src={bulletin.cover}
                      alt={`${t("Cover of the")} ${t(bulletin.label)} ${t("of the ArLAR E-Bulletin")}`}
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 46vw, 24vw"
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                    />
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-col p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-display text-[9.5px] font-semibold tracking-[0.15em] text-crimson-600 uppercase">
                      {t(index === 0 ? "Latest issue" : "From the archive")}
                    </p>
                    <span className="font-display text-[10px] font-semibold tracking-[0.12em] text-ink-300">
                      {bulletin.issue}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.035em] text-ink-950">
                    {t(bulletin.label)}
                  </h3>
                  <p className="mt-2 font-display text-[13px] font-medium text-jade-700">
                    {bulletin.date}
                  </p>
                  <p className="mt-5 text-[12.5px] leading-6 text-ink-500">
                    {t("News, activities, and updates from rheumatology communities across the Arab region.")}
                  </p>

                  <div className="mt-auto pt-8">
                    <div className="h-px bg-linear-to-r from-ink-100 to-transparent" />
                    <span className="mt-5 inline-flex items-center gap-2 font-display text-[13px] font-semibold text-ink-900 transition-colors group-hover:text-jade-700">
                      {t("Open the issue")}
                      <ArrowUpRight className="size-4 text-crimson-600 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-2 block text-[10.5px] text-ink-400">
                      {t("Arabic")} · PDF
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
