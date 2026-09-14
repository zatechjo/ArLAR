import { AboutDirectoryHero } from "@/components/about/about-directory-hero";
import { ArrowUpRight } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { createStaticPageMetadata } from "@/lib/seo";

export const generateMetadata = createStaticPageMetadata("/about/secretariat");

const officeNumbers = [
  "+961 1 510 880",
  "+961 1 510 881",
  "+961 1 510 882",
  "+961 1 510 883",
] as const;

export default async function SecretariatPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const isArabic = lang === "ar";

  return (
    <main>
      <AboutDirectoryHero
        currentPage="Secretariat"
        title="Secretariat"
        description="Contact the ArLAR Secretariat for event-related enquiries and support."
        grainId="secretariat-hero-grain"
      />

      <section className="relative overflow-hidden bg-white pb-10 pt-8 sm:pb-12 sm:pt-10 lg:pb-14">
        <div
          aria-hidden
          className="absolute -left-32 top-24 size-80 rounded-full bg-crimson-50/80 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-32 bottom-16 size-80 rounded-full bg-jade-50/90 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-ink-100 bg-white shadow-[0_24px_70px_-44px_rgba(7,19,31,0.32)]">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-crimson-600 via-crimson-300 to-jade-500"
            />

            <div className="grid md:grid-cols-[0.82fr_1.18fr]">
              <aside className="relative isolate overflow-hidden bg-[#07131f] p-7 text-white sm:p-8 lg:p-9">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(circle_at_90%_8%,rgba(0,149,59,0.28),transparent_31%),radial-gradient(circle_at_7%_92%,rgba(193,2,48,0.25),transparent_35%)]"
                />
                <div
                  aria-hidden
                  className="absolute -bottom-40 -right-32 size-[28rem] rounded-full border border-white/8"
                />
                <div
                  aria-hidden
                  className="absolute -bottom-24 -right-16 size-72 rounded-full border border-white/6"
                />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-9 bg-jade-300" />
                    <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-jade-200 uppercase">
                      {t("Contact person")}
                    </p>
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.035em] sm:text-4xl">
                    {isArabic ? "سيدة حجيج" : "Sayde Hojeij"}
                  </h2>
                  <p className="mt-2 text-[13px] text-sky-100/55">
                    {isArabic ? "سكرتارية الرابطة" : "ArLAR Secretariat"}
                  </p>

                  <div className="mt-10 border-t border-white/12 pt-6">
                    <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-white/45 uppercase">
                      {t("Organisation")}
                    </p>
                    <p
                      lang={isArabic ? "ar" : "en"}
                      dir={isArabic ? "rtl" : "ltr"}
                      translate={isArabic ? undefined : "no"}
                      className="mt-2.5 max-w-sm font-display text-xl font-semibold leading-7 tracking-[-0.02em] text-white"
                    >
                      {isArabic
                        ? "شركة إنفومد لتنظيم المؤتمرات والمعارض"
                        : "Infomed International for Events"}
                    </p>
                  </div>
                </div>
              </aside>

              <div className="flex flex-col justify-center bg-[#fbfcfc] p-6 sm:p-8 lg:p-9">
                <div>
                  <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-crimson-600 uppercase">
                    {t("Get in touch")}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.035em] text-ink-950">
                    {t("Contact details")}
                  </h3>
                </div>

                <dl className="mt-6 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-crimson-100 bg-white p-4 sm:col-span-2 sm:p-5">
                    <dt className="font-display text-[10px] font-semibold tracking-[0.16em] text-ink-400 uppercase">
                      {t("Email address")}
                    </dt>
                    <dd className="mt-2.5">
                      <a
                        href="mailto:arlar@arabrheumatology.org"
                        className="group flex items-start justify-between gap-4 font-display text-[16px] font-semibold text-crimson-700 sm:text-lg"
                      >
                        <span className="break-all underline decoration-crimson-200 underline-offset-4 transition-colors group-hover:text-crimson-900">
                          arlar@arabrheumatology.org
                        </span>
                        <ArrowUpRight className="mt-0.5 size-5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    </dd>
                  </div>

                  <div className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-5">
                    <dt className="font-display text-[10px] font-semibold tracking-[0.16em] text-ink-400 uppercase">
                      {t("Office numbers")}
                    </dt>
                    <dd className="mt-3 grid gap-0.5">
                      {officeNumbers.map((number) => (
                        <a
                          key={number}
                          href={"tel:" + number.replaceAll(" ", "")}
                          className="group flex w-fit items-center gap-2 py-1 font-display text-[17px] font-semibold text-ink-800 transition-colors hover:text-jade-700"
                        >
                          <span className="size-1.5 rounded-full bg-jade-500 transition-transform group-hover:scale-125" />
                          <span className="underline decoration-ink-200 underline-offset-4 group-hover:decoration-jade-300">
                            <span dir="ltr" className="whitespace-nowrap">
                              {number}
                            </span>
                          </span>
                        </a>
                      ))}
                    </dd>
                  </div>

                  <div className="rounded-2xl border border-jade-100 bg-jade-50/55 p-4 sm:p-5">
                    <dt className="font-display text-[10px] font-semibold tracking-[0.16em] text-jade-700 uppercase">
                      {t("Mobile number")}
                    </dt>
                    <dd className="mt-3">
                      <a
                        href="tel:+96171565442"
                        className="group inline-flex items-center gap-2 font-display text-[17px] font-semibold text-ink-900 transition-colors hover:text-jade-700"
                      >
                        <span dir="ltr" className="whitespace-nowrap underline decoration-jade-200 underline-offset-4">
                          +961 71 565442
                        </span>
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
