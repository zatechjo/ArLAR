import { createStaticPageMetadata } from "@/lib/seo";
import Link from "next/link";

import { Arlar27PageHero } from "@/components/congresses/arlar27/page-hero";
import { Arlar27PortalCta } from "@/components/congresses/arlar27/portal-cta";
import { ArrowRight, Check, FileText } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { getManagedArlar27ExternalAsync } from "@/lib/arlar27-admin-repository";

export const generateMetadata = createStaticPageMetadata("/congresses/arlar27/abstracts");

const steps = [
  { title: "Read the guidelines", text: "Review the official categories, format, authorship, and eligibility requirements when they are released." },
  { title: "Prepare your abstract", text: "Build your submission around the final instructions before entering it into the congress portal." },
  { title: "Submit online", text: "Use the official ArLAR27 submission portal once abstract submission opens." },
  { title: "Await the decision", text: "Corresponding authors will receive the scientific committee’s decision through the submitted contact details." },
] as const;

export default async function Arlar27AbstractsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const destination: { url: string; enabled: boolean } = await getManagedArlar27ExternalAsync("abstracts");
  // Links across the microsite already open the portal in a new tab. Someone who
  // reaches this route directly (search, sitemap, a shared URL) gets the same
  // choice rather than being thrown off the site by a redirect.
  const portalUrl = destination.enabled && destination.url ? destination.url : null;

  return (
    <main>
      <Arlar27PageHero title="Abstract Submission" description="A platform for research from across the Arab region and the wider rheumatology community." />

      {portalUrl ? (
        <Arlar27PortalCta
          title="Abstract submission is open."
          description="Submissions are handled on the official congress portal, which opens in a new tab."
          action="Open the submission portal"
          url={portalUrl}
        />
      ) : null}

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
            <div>
              <span className="grid size-12 place-items-center rounded-2xl bg-[#eef5fa] text-[#0d4c7a]"><FileText className="size-6" /></span>
              <h2 className="mt-6 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-ink-950">{t("Share your work at ArLAR27.")}</h2>
              <p className="mt-5 text-[13px] leading-6 text-ink-500">
                {portalUrl
                  ? t("Submissions for the ArLAR27 scientific programme are handled on the official congress portal.")
                  : t("The call for abstracts, categories, submission rules, and deadlines are being prepared. No submission is open yet.")}
              </p>
              <div className={`mt-7 rounded-[1.4rem] border p-5 ${portalUrl ? "border-jade-200 bg-jade-50" : "border-[#edd8a1] bg-[#fffaf0]"}`}>
                <p className={`font-display text-[10px] font-semibold tracking-[0.14em] uppercase ${portalUrl ? "text-jade-700" : "text-[#8b6719]"}`}>{t("Current status")}</p>
                <p className="mt-2 text-[13px] font-medium text-ink-800">
                  {portalUrl ? t("Abstract submission is open on the official portal.") : t("Submission portal and deadlines forthcoming.")}
                </p>
              </div>
            </div>

            <div className="divide-y divide-ink-200 border-y border-ink-200">
              {steps.map((step, index) => (
                <article key={step.title} className="grid gap-3 py-5 sm:grid-cols-[3rem_1fr] sm:gap-5">
                  <span className="grid size-10 place-items-center rounded-full bg-[#032b52] font-display text-[10px] font-semibold text-[#ffd45c]">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-[17px] font-semibold text-ink-950">{t(step.title)}</h3>
                    <p className="mt-2 text-[12px] leading-6 text-ink-500">{t(step.text)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 rounded-[1.75rem] bg-[#f3f6f6] p-6 sm:grid-cols-3 sm:p-8">
            {["Categories will be confirmed", "Deadlines will be confirmed", "Guidelines will be downloadable"].map((item) => (
              <p key={item} className="flex items-center gap-3 font-display text-[12px] font-medium text-ink-800"><Check className="size-4 shrink-0 text-[#0d4c7a]" />{t(item)}</p>
            ))}
          </div>

          <Link href={localizePath("/contact", lang)} className="mt-8 inline-flex items-center gap-2 font-display text-[12px] font-semibold text-[#0d4c7a]">{t("Abstract-related enquiry")} <ArrowRight className="rtl-flip size-4" /></Link>
        </div>
      </section>
    </main>
  );
}
