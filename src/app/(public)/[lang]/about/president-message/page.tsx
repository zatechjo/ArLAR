import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";

import { Quote } from "@/components/icons";
import { findManagedDoctorByName, listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export const generateMetadata = createStaticPageMetadata("/about/president-message");

const roles = [
  "President of the ArLAR",
  "President of the Iraqi League for Bone and Joint Health",
] as const;

const message = [
  "It is with great honor and a deep sense of responsibility that I step into the role of President of the Arab League of Associations for Rheumatology (ArLAR), representing our beloved Iraq. As a Professor and Consultant Rheumatologist, I carry with me not only years of clinical and academic experience, but also an unwavering belief in the power of regional collaboration to transform patient care to a better state across our Arab countries.",
  "ArLAR stands as a symbol of unity, progress, and shared knowledge. As we embark on this new chapter, my vision is rooted in collective growth, strengthening our scientific community, empowering early-career rheumatologists, and improving access to comprehensive care for every patient living with rheumatic diseases in our region.",
  "Together, we have the potential to lead multicenter research, provide solid publications and awareness programs, and shape policies that reflect the true needs of our people. But none of this is possible without your active participation. I invite every member society, every physician, and every stakeholder to join hands in building a future where excellence in Rheumatology is not just a goal, but a reality we achieve together.",
  "ArLAR is not just an organization, it is a dynamic institution. And it is my firm commitment that under Iraq’s leadership, we will uphold its values, expand its influence, and most importantly, serve the patients who rely on us.",
] as const;

export default async function PresidentMessagePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const president = findManagedDoctorByName(await listManagedDoctorsAsync(), "Nizar AbdulLateef Jasim");
  // Use the Arabic name on the Arabic page, falling back to English if this
  // doctor has no published Arabic name.
  const presidentName =
    (lang === "ar" && president?.nameAr) ||
    president?.fullName ||
    "Nizar AbdulLateef Jasim, MD";
  const presidentImage = president?.image ?? "/images/dr-nizar.jpg";
  return (
    <main>
      <section className="relative isolate min-h-[18rem] overflow-hidden bg-[#07131f] text-white sm:min-h-[19rem] lg:min-h-[20rem]">
        <Image
          src="/images/subpage-hero-medical.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="rtl-hero-mirror object-cover object-center opacity-[0.34]"
          style={{
            filter: "blur(2px) saturate(96%)",
            transform: "scale(1.02)",
          }}
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[linear-gradient(90deg,rgba(5,13,22,0.94)_0%,rgba(5,13,22,0.78)_43%,rgba(5,13,22,0.3)_74%,rgba(5,13,22,0.16)_100%)]"
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(193,2,48,0.22),transparent_27%),radial-gradient(circle_at_84%_70%,rgba(0,149,59,0.18),transparent_32%)]"
        />
        <div
          aria-hidden
          className="rtl-hero-mirror absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_0)] opacity-15 [background-size:24px_24px] [mask-image:linear-gradient(90deg,black,transparent_72%)]"
        />
        <svg
          aria-hidden
          className="absolute inset-0 size-full opacity-[0.07] mix-blend-soft-light"
          preserveAspectRatio="none"
        >
          <filter id="president-hero-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.78"
              numOctaves="3"
              seed="8"
            />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#president-hero-grain)"
          />
        </svg>

        <div className="relative mx-auto flex min-h-[18rem] max-w-7xl flex-col justify-center px-4 py-9 sm:min-h-[19rem] sm:px-6 lg:min-h-[20rem]">
          <nav
            aria-label={t("Breadcrumb")}
            className="flex items-center gap-2.5 font-display text-[13px] font-medium text-white/60"
          >
            <Link href={localizePath("/", lang)} className="transition-colors hover:text-white">
              {t("Home")}
            </Link>
            <span aria-hidden className="text-white/25">
              /
            </span>
            <Link
              href={localizePath("/about", lang)}
              className="transition-colors hover:text-white"
            >
              {t("About Us")}
            </Link>
            <span aria-hidden className="text-white/25">
              /
            </span>
            <span className="text-white/85">{t("President's Message")}</span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <h1 className="max-w-full font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl sm:leading-[0.98]">
              {t("President's Message")}
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-sky-50/72 sm:text-[16px]">
              {t("A message of purpose, partnership, and progress from the President of ArLAR.")}
            </p>
          </div>
        </div>

        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-crimson-500 via-white/20 to-jade-400"
        />
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <article className="grid min-w-0 gap-8 lg:grid-cols-[320px_1fr] lg:gap-12">
            <aside className="min-w-0 lg:sticky lg:top-[13rem] lg:self-start">
              <div className="overflow-hidden rounded-3xl border border-transparent bg-gradient-to-br from-[#79001f] via-crimson-700 to-[#d41442] p-5 text-white shadow-xl shadow-ink-950/20 sm:p-6">
                <div className="grid justify-items-center gap-4 text-center">
                  <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/40">
                    <Image
                      src={presidentImage}
                      alt={presidentName}
                      fill
                      sizes="144px"
                      className="object-cover object-top"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold leading-tight text-white">
                      {presidentName}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-white/72 uppercase">
                      {t("Current President")}
                    </p>
                  </div>
                </div>

                <ul className="mt-5 grid gap-2.5 border-t border-white/15 pt-5 text-sm">
                  {roles.map((role) => (
                    <li
                      key={role}
                      className="flex items-start gap-2.5 leading-6 text-white/88"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-jade-200" />
                      <span className="min-w-0">{t(role)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="relative min-w-0">
              <Quote
                className="size-12 text-jade-600/28"
                aria-hidden="true"
              />
              <p className="mt-3 font-display text-lg font-semibold text-ink-950">
                {t("Dear Colleagues, Partners, and Guests,")}
              </p>

              <div className="mt-4 space-y-4 text-[15px] leading-8 text-ink-600 sm:text-base">
                {message.map((paragraph) => (
                  <p key={paragraph}>{t(paragraph)}</p>
                ))}
                <p className="font-display text-lg font-semibold text-ink-900">
                  {t("Let us move forward with purpose, pride, and partnership.")}
                </p>
                <p>{t("Warm regards,")}</p>
              </div>

              <div className="mt-8 border-t border-ink-100 pt-5">
                <p className="font-display text-base font-semibold text-ink-950">
                  {presidentName}
                </p>
                <div className="mt-1 space-y-0.5 text-sm leading-6 text-ink-500">
                  {roles.map((role) => (
                    <p key={role}>{t(role)}</p>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
