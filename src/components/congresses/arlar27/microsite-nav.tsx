"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Arlar27ExternalAwareLink } from "@/components/congresses/arlar27/external-aware-link";
import { ArrowRight, CalendarDays, MapPin } from "@/components/icons";
import { arlar27, arlar27Navigation } from "@/data/arlar27";
import { useTranslations } from "@/i18n/locale-context";
import type { Arlar27ExternalLinks } from "@/lib/arlar27-external-links";

export function Arlar27MicrositeNav({ congress, navigation, externalLinks }: { congress: typeof arlar27; navigation: typeof arlar27Navigation; externalLinks: Arlar27ExternalLinks }) {
  const pathname = usePathname();
  const { t, href } = useTranslations();
  const isHome = pathname === href("/congresses/arlar27");

  if (isHome) return null;

  return (
    <>
      <section className="relative overflow-hidden bg-[#032b52] text-white">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,194,28,0.13),transparent_31%),radial-gradient(circle_at_85%_120%,rgba(13,76,122,0.3),transparent_31%)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.11)_1px,transparent_0)] opacity-20 [background-size:24px_24px] [mask-image:linear-gradient(90deg,black,transparent_80%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:py-7">
          <Link href={href("/congresses/arlar27")} className="flex min-w-0 items-center gap-4">
            <span className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-2">
              <Image
                src={congress.logo}
                alt={t("ArLAR Iraq 2027 Congress")}
                width={180}
                height={120}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                ArLAR<span className="text-[#ffc21c]">27</span> {t("Iraq")}
              </span>
              <span className="mt-1 block text-[11px] text-white/52 sm:text-[12px]">
                {t("Shaping the Future of Rheumatology")}
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-semibold text-white/82">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/14 bg-white/6 px-4">
              <CalendarDays className="size-4 text-[#ffc21c]" />
              {t(congress.dates)}
            </span>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/14 bg-white/6 px-4">
              <MapPin className="size-4 text-[#ffc21c]" />
              {t(congress.location)}
            </span>
          </div>
        </div>
      </section>

      <Arlar27MenuBar navigation={navigation} externalLinks={externalLinks} />
    </>
  );
}

export function Arlar27MenuBar({ navigation, externalLinks }: { navigation: typeof arlar27Navigation; externalLinks: Arlar27ExternalLinks }) {
  const pathname = usePathname();
  const { t, href } = useTranslations();

  return (
    <div className="border-y border-ink-200 bg-white text-ink-900">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6">
        <nav
          aria-label={t("ArLAR27 congress")}
          className="min-w-0 flex-1 snap-x overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max items-center gap-2">
            {navigation.map((item) => {
              const itemHref = href(item.href);
              // An externally-backed item never highlights: it opens a new tab
              // rather than moving the visitor off the current page.
              const isActive =
                item.href in externalLinks
                  ? false
                  : item.href === "/congresses/arlar27"
                    ? pathname === itemHref
                    : pathname.startsWith(itemHref);

              return (
                <Arlar27ExternalAwareLink
                  key={item.href}
                  path={item.href}
                  href={itemHref}
                  externalLinks={externalLinks}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-12 snap-start items-center rounded-xl border px-4 py-2.5 font-display text-[13px] font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-[#032b52] bg-[#032b52] text-[#ffd45c]"
                      : "border-transparent text-ink-600 hover:border-ink-200 hover:bg-ink-50 hover:text-ink-950"
                  }`}
                >
                  {t(item.label)}
                </Arlar27ExternalAwareLink>
              );
            })}
          </div>
        </nav>

        <Arlar27ExternalAwareLink
          path="/congresses/arlar27/registration"
          href={href("/congresses/arlar27/registration")}
          externalLinks={externalLinks}
          className="hidden min-h-12 shrink-0 items-center gap-2 rounded-full bg-[#032b52] px-5 font-display text-[13px] font-semibold text-[#ffd45c] transition-colors hover:bg-[#0d4c7a] xl:inline-flex"
        >
          <CalendarDays className="size-3.5" />
          {t("Registration")}
          <ArrowRight className="rtl-flip size-3.5" />
        </Arlar27ExternalAwareLink>
      </div>
    </div>
  );
}
