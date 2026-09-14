import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";

import { ArrowUpRight, Download, FileText } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import type { Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { formatDoctorName } from "@/lib/doctor-name";
import { publicMediaUrl } from "@/lib/media-url";
import { getPublishedProfessionalResourcesAsync } from "@/lib/professional-resources-repository";

export const generateMetadata = createStaticPageMetadata("/professionals/publications");

const publicationFallbacks = [
  {
    title:
      "The impact of COVID-19 pandemic on rheumatology practice: a cross-sectional multinational study",
    journal: "Rheumatology International",
    year: "2020",
    cover: "/images/publications/covid-practice-study-cover.jpg",
    document:
      "/documents/publications/covid-19-rheumatology-practice-study.pdf",
    authors: [
      "Nelly Ziadé",
      "Ihsane Hmamouchi",
      "Lina el Kibbi",
      "Nizar Abdulateef",
      "Hussein Halabi",
      "Fatemah Abutiban",
      "Wafa Hamdi",
      "Manal el Rakawi",
      "Mervat Eissa",
      "Basel Masri",
    ],
  },
  {
    title:
      "Impact of the COVID-19 pandemic on patients with chronic rheumatic diseases: A study in 15 Arab countries",
    journal: "International Journal of Rheumatic Diseases",
    year: "2020",
    cover: "/images/publications/chronic-diseases-study-cover.jpg",
    document:
      "/documents/publications/covid-19-chronic-rheumatic-diseases-study.pdf",
    authors: [
      "Nelly Ziadé",
      "Lina el Kibbi",
      "Ihsane Hmamouchi",
      "Nizar Abdulateef",
      "Hussein Halabi",
      "Wafa Hamdi",
      "Fatemah Abutiban",
      "Manal el Rakawi",
      "Mervat Eissa",
      "Basel Masri",
    ],
  },
] as const;

const archPublications = [
  {
    id: "arch-rheumatology-workforce",
    title:
      "The rheumatology workforce in the Arab countries: current status, challenges, opportunities, and future needs from an ArLAR cross-sectional survey",
    journal: "Clinical Rheumatology",
    year: "2023",
    identifier: "PMID 37624401",
    href: "https://pubmed.ncbi.nlm.nih.gov/37624401/",
    authors: [
      "Nelly Ziadé",
      "Ihsane Hmamouchi",
      "Chafika Haouichat",
      "Fatemah Baron",
      "Sulaiman Al Mayouf",
      "Nizar Abdulateef",
      "Basel Masri",
      "Manal El Rakawi",
      "Lina El Kibbi",
      "Manal El Mashaleh",
      "Bassel Elzorkany",
      "Jamal Al Saleh",
      "Christian Dejaco",
      "Fatemah Abutiban",
    ],
  },
  {
    id: "arch-rheumatologist-burnout",
    title:
      "Burnout syndrome among rheumatologists and rheumatology fellows in Arab countries: an ArLAR multinational study",
    journal: "Clinical Rheumatology",
    year: "2023",
    identifier: "PMID 38012468",
    href: "https://pubmed.ncbi.nlm.nih.gov/38012468/",
    authors: [
      "Rita Naim",
      "Nelly Ziadé",
      "Chafika Haouichat",
      "Fatemah Baron",
      "Sulaiman M Al-Mayouf",
      "Nizar Abdulateef",
      "Basel Masri",
      "Manal El Rakawi",
      "Lina El Kibbi",
      "Manal Al Mashaleh",
      "Fatemah Abutiban",
      "Ihsane Hmamouchi",
    ],
  },
  {
    id: "arch-tactic-psaid",
    title:
      "Is the patient-perceived impact of psoriatic arthritis a global concept? An international study in 13 Arab countries (TACTIC study)",
    journal: "Rheumatology",
    year: "2024",
    identifier: "PMID 38498150",
    href: "https://pubmed.ncbi.nlm.nih.gov/38498150/",
    authors: [
      "Nelly Ziadé",
      "Noura Abbas",
      "Ihsane Hmamouchi",
      "Lina El Kibbi",
      "Avin Maroof",
      "Bassel Elzorkany",
      "Nizar Abdulateef",
      "Asal Adnan",
      "Nabaa Ihsan Awadh",
      "Faiq Isho Gorial",
      "Nada Alchama",
      "Chafika Haouichat",
      "Fatima Alnaimat",
      "Suad Hannawi",
      "Saed Atawnah",
      "Hussein Halabi",
      "Manal Al Mashaleh",
      "Laila Aljazwi",
      "Ahmed Abogamal",
      "Laila Ayoub",
      "Elyes Bouajina",
      "Rachid Bahiri",
      "Sahar Saad",
      "Maha Sabkar",
      "Krystel Aouad",
      "Laure Gossec",
    ],
  },
  {
    id: "arch-aaaa-awareness",
    title:
      "Shaping awareness about rheumatic and musculoskeletal diseases in the Arab region: The Arab Adult Arthritis Awareness Group initiative",
    journal: "Arab Journal of Rheumatology",
    year: "2024",
    identifier: "DOI 10.4103/ajr.ajr_3_24",
    href: "https://journals.lww.com/ajrh/fulltext/2024/02010/shaping_awareness_about_rheumatic_and.1.aspx",
    authors: [
      "Lina El Kibbi",
      "Hussein Halabi",
      "Basel Masri",
      "Ihsane Hmamouchi",
      "Mona Metawee",
      "Khalid Alnaqbi",
      "Wafa Hamdi",
      "Fatemah Abutiban",
      "Sima Abu Al-Saoud",
      "Nasra Al Adhoubi",
      "Samar Al Emadi",
      "Sahar Saad",
      "Malak M. Aburas",
      "Nelly Ziade",
    ],
  },
] as const;

export default async function PublicationsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const t = (value: string) => translate(lang, value);
  const managedPublications = (await getPublishedProfessionalResourcesAsync("publication"))
    .map((resource) => {
      const fallback = publicationFallbacks.find(
        (publication) => publication.title === resource.title,
      );
      return {
        id: resource.id,
        title: resource.title,
        journal: resource.journal || resource.collection,
        year: resource.date.slice(0, 4) || "Undated",
        cover: resource.image || fallback?.cover || "",
        document: publicMediaUrl(resource.resourceUrl || resource.publicHref),
        authors: resource.authors,
      };
    });
  const publications = managedPublications.filter(
    (publication) =>
      !archPublications.some(
        (archPublication) =>
          archPublication.title === publication.title || archPublication.href === publication.document,
      ),
  );
  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: "For Healthcare Professionals" },
          { label: "ArLAR Publications" },
        ]}
        title={"ArLAR Publications"}
        description={"Scientific work developed across the ArLAR network and published in peer-reviewed rheumatology journals."}
        grainId="publications-hero-grain"
      />

      <section className="bg-[#f5f8f7] py-12 sm:py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-jade-600" />
              <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-jade-700 uppercase">
                {t("ArLAR Research Group · ARCH")}
              </p>
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
              {t("ARCH publications")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500">
              {t("Peer-reviewed studies developed through the ArLAR Research Group (ARCH), with author lists and a direct link to the published record.")}
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {archPublications.map((publication) => (
              <article
                key={publication.id}
                className="group rounded-[1.7rem] border border-jade-200/80 bg-gradient-to-br from-[#f2fbf7] via-white to-white p-6 transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-jade-300 hover:shadow-[0_18px_45px_-28px_rgba(12,96,72,0.55)] sm:p-7"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 font-display text-[10px] font-semibold tracking-[0.13em] uppercase">
                  <span className="inline-flex items-center gap-2 text-jade-700">
                    <span className="size-1.5 rounded-full bg-jade-500" />
                    {t("ARCH · Research manuscript")}
                  </span>
                  <span className="text-ink-400">{publication.year}</span>
                </div>

                <h3 className="mt-5 font-display text-[1.3rem] font-semibold leading-[1.28] tracking-[-0.03em] text-ink-950">
                  {publication.title}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium text-jade-700">
                  <span>{publication.journal}</span>
                  <span aria-hidden className="size-1 rounded-full bg-ink-200" />
                  <span className="text-ink-400">{publication.identifier}</span>
                </div>

                <details className="mt-6 border-t border-jade-100 pt-4">
                  <summary className="cursor-pointer list-none font-display text-[10px] font-semibold tracking-[0.14em] text-ink-500 uppercase marker:hidden">
                    {t("Authors")} ({publication.authors.length})
                  </summary>
                  <ul className="mt-3 grid gap-x-5 gap-y-1.5 text-[12px] leading-5 text-ink-600 sm:grid-cols-2">
                    {publication.authors.map((author) => (
                      <li key={author}>{author}</li>
                    ))}
                  </ul>
                </details>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <a
                    href={publication.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-jade-700 px-4 font-display text-[12px] font-semibold text-white transition-colors hover:bg-jade-800"
                  >
                    <FileText className="size-4" />
                    {t("Open publication")}
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-crimson-600" />
              <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-crimson-600 uppercase">
                {t("Research archive")}
              </p>
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
              {t("ArLAR scientific studies")}
            </h2>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {publications.map((publication) => (
              <article
                key={publication.id}
                className="group overflow-hidden rounded-[1.7rem] border border-ink-100 bg-white transition-[transform,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-jade-200"
              >
                <div className="grid min-h-full sm:grid-cols-[11rem_1fr]">
                  <a
                    href={publication.document}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${t("View study")} — ${publication.title}`}
                    className="relative block min-h-72 cursor-pointer overflow-hidden border-b border-ink-100 bg-[#edf1f0] sm:min-h-full sm:border-r sm:border-b-0"
                  >
                    {publication.cover ? (
                      <Image
                        src={publication.cover}
                        alt={`${t("First page of")} ${publication.title}`}
                        fill
                        sizes="(min-width: 640px) 176px, 100vw"
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                      />
                    ) : (
                      <FileText className="absolute inset-0 m-auto size-10 text-ink-300" />
                    )}
                  </a>

                  <div className="flex min-w-0 flex-col p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2 font-display text-[10px] font-semibold tracking-[0.13em] uppercase">
                      <span className="text-crimson-600">{t("Original article")}</span>
                      <span aria-hidden className="size-1 rounded-full bg-ink-200" />
                      <span className="text-ink-400">{publication.year}</span>
                    </div>

                    <h3 className="mt-4 font-display text-[1.35rem] font-semibold leading-[1.25] tracking-[-0.03em] text-ink-950">
                      {publication.title}
                    </h3>
                    <p className="mt-3 text-[12px] font-medium text-jade-700">
                      {publication.journal}
                    </p>

                    <div className="mt-6 border-t border-ink-100 pt-5">
                      <p className="font-display text-[9.5px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
                        {t("Authors")}
                      </p>
                      <p className="mt-2.5 text-[12px] leading-5.5 text-ink-600">
                        {publication.authors.map((author) => formatDoctorName(author)).join(" · ")}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-7">
                      <a
                        href={publication.document}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-ink-150 px-4 font-display text-[12px] font-semibold text-ink-900 transition-colors hover:border-jade-300 hover:text-jade-700"
                      >
                        <FileText className="size-4" />
                        {t("View study")}
                        <ArrowUpRight className="size-3.5" />
                      </a>
                      <a
                        href={publication.document}
                        download
                        className="inline-flex cursor-pointer items-center gap-2 font-display text-[12px] font-semibold text-jade-700 transition-colors hover:text-jade-600"
                      >
                        <Download className="size-4" />
                        {t("Download PDF")}
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
