import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";

import {
  AskAQuestion,
  PatientFaqCentre,
  SourceLink,
} from "@/components/public-patients/patient-faq-centre";
import { ArrowRight, HeartPulse, Search } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import {
  patientFaqs,
  patientInformationSources,
} from "@/data/patient-faqs";
import { getPublishedSiteContent } from "@/lib/site-content-repository";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export const generateMetadata = createStaticPageMetadata("/public-patients");

export default async function PublicPatientsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const [managedFaqs, managedSources] = await Promise.all([
    getPublishedSiteContent("patients", "faqs", patientFaqs, lang),
    getPublishedSiteContent("patients", "information-sources", patientInformationSources, lang),
  ]);
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "For Public & Patients" }]}
        title={"For Public & Patients"}
        description={"Clear, reliable answers to common questions about rheumatic diseases, treatment, daily life, and staying well."}
        grainId="public-patients-hero-grain"
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#patient-faqs"
            className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 font-display text-[11.5px] font-semibold text-ink-950 transition-colors hover:bg-jade-50 hover:text-jade-800"
          >
            <Search className="size-4" />
            {t("Browse")} {managedFaqs.length} {t("answers")}
            <ArrowRight className="rtl-flip size-3.5 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#ask-a-question"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 font-display text-[11.5px] font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
          >
            {t("Ask your own question")}
          </a>
        </div>
      </PageHero>

      <section className="bg-white py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid overflow-hidden rounded-[1.8rem] border border-ink-100 bg-white lg:grid-cols-[15rem_minmax(0,1fr)_auto]">
            <div className="relative min-h-48 overflow-hidden border-b border-ink-100 bg-[#f8faf9] lg:min-h-0 lg:border-b-0 lg:border-e">
              <Image
                src="/images/special-interest-groups/aaaa.png"
                alt="Arab Adult Arthritis Awareness Group logo"
                fill
                sizes="(max-width: 1024px) 100vw, 240px"
                className="object-contain p-7"
                priority
              />
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-crimson-600" />
                <p className="font-display text-[9.5px] font-semibold tracking-[0.16em] text-crimson-600 uppercase">
                  {t("Page stewardship")}
                </p>
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em] text-ink-950 sm:text-3xl">
                {t("Managed by the AAAA Group")}
              </h2>
              <p className="mt-3 max-w-2xl text-[13px] leading-6 text-ink-500">
                {t("The Arab Adult Arthritis Awareness Group brings together doctors across the Arab region to make reliable rheumatology information easier for patients and the public to understand and use.")}
              </p>
            </div>

            <div className="flex items-center border-t border-ink-100 p-6 lg:border-s lg:border-t-0 lg:p-8">
              <Link
                href={localizePath("/special-interest-groups/arab-adult-arthritis-awareness", lang)}
                className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-ink-150 px-4 font-display text-[11.5px] font-semibold text-ink-900 transition-colors hover:border-jade-300 hover:text-jade-800"
              >
                {t("Meet the AAAA Group")}
                <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-crimson-100 bg-crimson-50/65 px-4 py-3.5 sm:px-5">
            <HeartPulse className="mt-0.5 size-4 shrink-0 text-crimson-700" />
            <p className="text-[11.5px] leading-5 text-crimson-900/75">
              {t("This page provides general education and cannot diagnose, prescribe, or replace your clinician. For severe or rapidly worsening symptoms, contact local emergency services.")}
            </p>
          </div>
        </div>
      </section>

      <div id="patient-faqs" className="scroll-mt-56">
        <PatientFaqCentre faqs={managedFaqs} />
      </div>

      <AskAQuestion />

      <section className="border-t border-ink-100 bg-[#f4f7f6] py-12 sm:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-jade-600" />
              <p className="font-display text-[10px] font-semibold tracking-[0.16em] text-jade-700 uppercase">
                {t("Information sources")}
              </p>
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em] text-ink-950 sm:text-3xl">
              {t("Where this guidance comes from")}
            </h2>
            <p className="mt-3 max-w-md text-[12px] leading-6 text-ink-500">
              {t("Time-sensitive health information is supported by current public-health and rheumatology guidance from established international organisations.")}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {managedSources.map((source) => (
              <SourceLink key={source.href} {...source} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
