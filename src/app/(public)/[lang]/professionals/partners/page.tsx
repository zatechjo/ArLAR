import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";

import { ArrowUpRight, BookOpen, Download } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import type { Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { publicMediaUrl } from "@/lib/media-url";
import { getPublishedProfessionalResourcesAsync } from "@/lib/professional-resources-repository";

export const generateMetadata = createStaticPageMetadata("/professionals/partners");

const bookUrl = "https://link.springer.com/book/10.1007/978-981-15-8323-0";
const bookPdf =
  "https://link.springer.com/content/pdf/10.1007/978-981-15-8323-0.pdf";

export default async function PartnersPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const partners = await getPublishedProfessionalResourcesAsync("partner");
  const partner = partners[0];
  if (!partner) {
    return (
      <main>
        <PageHero
          breadcrumbs={[{ label: "For Healthcare Professionals" }, { label: "ArLAR Partners" }]}
          title="ArLAR Partners"
          description="Collaborations and trusted educational resources supporting rheumatology practice across the region."
          grainId="partners-hero-grain"
        />
        <section className="bg-[#f5f8f7] py-12 sm:py-14 lg:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="rounded-[1.8rem] border border-ink-100 bg-white px-6 py-14 text-center">
              <BookOpen className="mx-auto size-7 text-ink-300" />
              <h2 className="mt-4 font-display text-xl font-semibold text-ink-950">{t("Partner resources are being prepared")}</h2>
              <p className="mt-2 text-[12.5px] text-ink-500">{t("Published partnerships will appear here.")}</p>
            </div>
          </div>
        </section>
      </main>
    );
  }
  const title = partner?.title || "Skills in Rheumatology";
  const cover = partner?.image || "/images/publications/skills-in-rheumatology-cover.png";
  const destination = partner?.resourceUrl || bookUrl;
  const editors = partner?.authors.length ? partner.authors : ["Hani Almoallim", "Mohamed Cheikh"];
  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "For Healthcare Professionals" },
          { label: "ArLAR Partners" },
        ]}
        title="ArLAR Partners"
        description="Collaborations and trusted educational resources supporting rheumatology practice across the region."
        grainId="partners-hero-grain"
      />

      <section className="bg-[#f5f8f7] py-12 sm:py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <article className="overflow-hidden rounded-[1.8rem] border border-ink-100 bg-white">
            <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
              {/* Tight padding so the cover fills its panel instead of floating
                  in a wide margin. The column ratio is unchanged, so the
                  details panel beside it keeps its width. */}
              <div className="flex items-center justify-center border-b border-ink-100 bg-[#eef3f2] p-4 sm:p-5 lg:border-r lg:border-b-0">
                <div className="relative aspect-[568/837] w-full overflow-hidden rounded-md border border-ink-150 bg-white">
                  <Image
                    src={cover}
                    alt={`${title} ${t("cover")}`}
                    fill
                    sizes="(min-width: 1024px) 460px, (min-width: 640px) 60vw, 92vw"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="p-6 sm:p-10 lg:p-12">
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-crimson-600" />
                  <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-crimson-600 uppercase">
                    {t("Al-Zaidi Chair of Research in Rheumatic Diseases")}
                  </p>
                </div>

                <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.04em] text-ink-950 sm:text-4xl">
                  {title}
                </h2>
                <p className="mt-3 text-[14px] text-ink-500">
                  {t("Edited by")} <strong className="font-semibold text-ink-800">{editors.join(" & ")}</strong>
                </p>

                <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 sm:grid-cols-4">
                  {[
                    ["Access", "Open access"],
                    ["Edition", "First"],
                    ["Published", "2021"],
                    ["Length", "566 pages"],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-[#f9fbfa] px-4 py-4">
                      <span className="block font-display text-[9px] font-semibold tracking-[0.13em] text-ink-400 uppercase">
                        {t(label)}
                      </span>
                      <strong className="mt-1.5 block font-display text-[13px] font-semibold text-ink-900">
                        {t(value)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-4 text-[13px] leading-6 text-ink-600">
                  <p>
                    {partner?.description || <>{t("ArLAR is pleased to share the online publication of")} <em>Skills in Rheumatology</em> {t("by Springer Nature. The complete book is available online free of charge.")}</>}
                  </p>
                  <p>
                    {t("The editors extend their gratitude to all authors and supporters who contributed to producing this valuable open resource.")}
                  </p>
                  <p>
                    {t("The book can be read in full or explored chapter by chapter, and may be shared with medical students, medical and family medicine residents, rheumatology fellows, family physicians, general practitioners, and any reader interested in rheumatology.")}
                  </p>
                </div>

                <div className="mt-8 border-t border-ink-100 pt-6">
                  <p className="font-display text-[9.5px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
                    {t("Warm regards")}
                  </p>
                  <p className="mt-2 font-display text-[14px] font-semibold text-ink-900">
                    {t("Editors")} {editors.join(" & ")}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={destination}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ink-150 px-5 font-display text-[12px] font-semibold text-ink-900 transition-colors hover:border-jade-300 hover:text-jade-700"
                  >
                    <BookOpen className="size-4" />
                    {t("Read the book")}
                    <ArrowUpRight className="size-3.5" />
                  </a>
                  <a
                    href={bookPdf}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 font-display text-[12px] font-semibold text-jade-700 transition-colors hover:text-jade-600"
                  >
                    <Download className="size-4" />
                    {t("Download full book")}
                  </a>
                </div>

                <p className="mt-6 text-[10.5px] leading-5 text-ink-400">
                  DOI: 10.1007/978-981-15-8323-0 · Springer Singapore · eBook ISBN 978-981-15-8323-0
                </p>
              </div>
            </div>
          </article>

          {partners.length > 1 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {partners.slice(1).map((item) => (
                <article key={item.id} className="flex min-w-0 gap-5 rounded-[1.5rem] border border-ink-100 bg-white p-5 sm:p-6">
                  {item.image ? (
                    <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
                      <Image src={item.image} alt="" fill sizes="96px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="grid aspect-[3/4] w-24 shrink-0 place-items-center rounded-xl bg-ink-50">
                      <BookOpen className="size-6 text-ink-300" />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="font-display text-[9.5px] font-semibold tracking-[0.14em] text-crimson-600 uppercase">{t("Partner resource")}</p>
                    <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.025em] text-ink-950">{item.title}</h2>
                    {item.description ? <p className="mt-2 line-clamp-3 text-[12px] leading-5 text-ink-500">{item.description}</p> : null}
                    <a href={publicMediaUrl(item.resourceUrl || item.publicHref)} target="_blank" rel="noreferrer" className="mt-auto inline-flex cursor-pointer items-center gap-2 pt-5 font-display text-[12px] font-semibold text-jade-700 hover:text-jade-600">
                      {item.actionLabel || t("Open resource")}<ArrowUpRight className="size-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
