import { createStaticPageMetadata } from "@/lib/seo";
import Image from "next/image";

import { Arlar27PageHero } from "@/components/congresses/arlar27/page-hero";
import { Quote } from "@/components/icons";
import { arlar27 } from "@/data/arlar27";
import type { Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { getManagedArlar27WelcomeAsync } from "@/lib/arlar27-admin-repository";
import { getArlar27DoctorAsync } from "@/lib/arlar27-people";

export const generateMetadata = createStaticPageMetadata("/congresses/arlar27/welcome");

export default async function Arlar27WelcomePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = (source: string) => translate(lang, source);
  const arlar27Welcome = await getManagedArlar27WelcomeAsync();
  const localized = lang === "en" ? undefined : arlar27Welcome.translations?.[lang];
  const copy = {
    pageTitle: localized?.pageTitle || t(arlar27Welcome.pageTitle),
    pageDescription: localized?.pageDescription || t(arlar27Welcome.pageDescription),
    greeting: localized?.greeting || t(arlar27Welcome.greeting),
    paragraphs: localized?.paragraphs?.length ? localized.paragraphs : arlar27Welcome.paragraphs.map(t),
    closing: localized?.closing || t(arlar27Welcome.closing),
    signoff: localized?.signoff || t(arlar27Welcome.signoff),
  };
  const roles = localized?.authorRoles?.length ? localized.authorRoles : arlar27Welcome.authorRoles.map(t);
  const author = await getArlar27DoctorAsync(arlar27Welcome.authorDoctorId);
  const authorName =
    (lang === "ar" && author?.nameAr) ||
    (lang === "fr" && author?.nameFr) ||
    author?.fullName ||
    arlar27.president.name;
  const authorImage = author?.image ?? arlar27.president.image;

  return (
    <main>
      <Arlar27PageHero
        title={copy.pageTitle}
        description={copy.pageDescription}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <article className="grid min-w-0 gap-8 lg:grid-cols-[320px_1fr] lg:gap-12">
            <aside className="min-w-0 lg:sticky lg:top-[13rem] lg:self-start">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(145deg,#032b52_0%,#063761_55%,#0d4c7a_100%)] p-5 text-white shadow-xl shadow-ink-950/20 sm:p-6">
                <div className="grid justify-items-center gap-4 text-center">
                  <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/40">
                    <Image
                      src={authorImage}
                      alt={authorName}
                      fill
                      sizes="144px"
                      className="object-cover object-top"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold leading-tight text-white">
                      {authorName}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-[#ffd45c] uppercase">
                      {t("President of ArLAR")}
                    </p>
                  </div>
                </div>

                <ul className="mt-5 grid gap-2.5 border-t border-white/15 pt-5 text-sm">
                  {roles.map((role) => (
                    <li key={role} className="flex items-start gap-2.5 leading-6 text-white/88">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#ffc21c]" />
                      <span className="min-w-0">{role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="relative min-w-0">
              <Quote className="size-12 text-[#0d4c7a]/28" aria-hidden="true" />
              <p className="mt-3 font-display text-lg font-semibold text-ink-950">
                {copy.greeting}
              </p>

              <div className="mt-4 space-y-4 text-[15px] leading-8 text-ink-600 sm:text-base">
              {copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <p className="font-display text-lg font-semibold text-ink-900">
                  {copy.closing}
                </p>
                <p>{copy.signoff}</p>
            </div>

              <div className="mt-8 border-t border-ink-100 pt-5">
                <p className="font-display text-base font-semibold text-ink-950">
                  {authorName}
                </p>
                <div className="mt-1 space-y-0.5 text-sm leading-6 text-ink-500">
                  {roles.map((role) => <p key={role}>{role}</p>)}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
