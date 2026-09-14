import { createStaticPageMetadata } from "@/lib/seo";

import { ContactForm } from "@/components/contact/contact-form";
import { ArrowUpRight, Mail, Phone, Users } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import type { Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export const generateMetadata = createStaticPageMetadata("/contact");

const officeNumbers = [
  "+961 1 510 880",
  "+961 1 510 881",
  "+961 1 510 882",
  "+961 1 510 883",
] as const;

export default async function ContactPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Contact Us" }]}
        title="Contact Us"
        description="Contact the ArLAR Secretariat about membership, education, scientific activities, events, and other organisational matters."
        grainId="contact-hero-grain"
      >
        <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sky-50/65">
          <span className="inline-flex items-center gap-2.5">
            <Mail className="size-4 text-jade-300" />
            <span className="font-display text-[11px] font-semibold">{t("General enquiries")}</span>
          </span>
          <span className="inline-flex items-center gap-2.5">
            <Users className="size-4 text-jade-300" />
            <span className="font-display text-[11px] font-semibold">{t("Members and partners")}</span>
          </span>
        </div>
      </PageHero>

      <section className="bg-[#f4f7f6] py-10 sm:py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          <aside className="grid gap-4 lg:sticky lg:top-56">
            <div className="relative isolate overflow-hidden rounded-[1.7rem] bg-[#07131f] p-6 text-white">
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(0,149,59,0.25),transparent_34%),radial-gradient(circle_at_8%_90%,rgba(193,2,48,0.22),transparent_38%)]" />
              <div aria-hidden className="absolute -bottom-24 -right-20 size-60 rounded-full border border-white/8" />
              <div className="relative">
                <p className="font-display text-[9.5px] font-semibold tracking-[0.16em] text-jade-300 uppercase">
                  {t("ArLAR Secretariat")}
                </p>
                <h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em]">
                  {t("Sayde Hojeij")}
                </h2>
                <p className="mt-2 text-[11.5px] text-sky-50/48">
                  {t("Infomed International for Events")}
                </p>
                <a
                  href="mailto:arlar@arabrheumatology.org"
                  className="group mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5 font-display text-[11.5px] font-semibold text-white/82 transition-colors hover:text-jade-300"
                >
                  <span className="min-w-0 break-all">arlar@arabrheumatology.org</span>
                  <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-ink-100 bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-jade-50 text-jade-700">
                  <Phone className="size-4" />
                </span>
                <div>
                  <p className="font-display text-[9px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
                    {t("Office numbers")}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-ink-400">{t("Lebanon")}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-1 border-t border-ink-100 pt-4">
                {officeNumbers.map((number) => (
                  <a
                    key={number}
                    href={`tel:${number.replaceAll(" ", "")}`}
                    dir="ltr"
                    className="w-fit py-1 font-display text-[13px] font-semibold text-ink-700 [unicode-bidi:isolate] transition-colors hover:text-jade-700"
                  >
                    {number}
                  </a>
                ))}
              </div>
              <div className="mt-4 border-t border-ink-100 pt-4">
                <p className="font-display text-[9px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
                  {t("Mobile")}
                </p>
                <a
                  href="tel:+96171565442"
                  dir="ltr"
                  className="mt-2 inline-block font-display text-[14px] font-semibold text-crimson-700 [unicode-bidi:isolate] transition-colors hover:text-crimson-900"
                >
                  +961 71 565442
                </a>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-crimson-100 bg-crimson-50/65 p-5">
              <p className="font-display text-[11px] font-semibold text-crimson-900">
                {t("No medical advice or care")}
              </p>
              <p className="mt-2 text-[10.5px] leading-5 text-crimson-900/65">
                {t("ArLAR is a professional organisation for rheumatology doctors and related professionals. It cannot provide medical advice, diagnosis, treatment, referrals, or emergency assistance.")}
              </p>
            </div>
          </aside>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
