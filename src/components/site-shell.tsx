"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SocialRail } from "@/components/social-rail";
import { LocaleProvider } from "@/i18n/locale-context";
import type { Locale } from "@/i18n/config";
import type { arlarContactLinks, arlarSocialLinks } from "@/lib/contact-links";

type LatestNews = { slug: string; title: string };

export function SiteShell({
  children,
  latestNews,
  socialLinks,
  contactLinks,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
  latestNews: LatestNews[];
  socialLinks: typeof arlarSocialLinks;
  contactLinks: typeof arlarContactLinks;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <div className="min-h-screen flex-1 bg-[#f4f5f7]">{children}</div>;
  }

  return (
    <LocaleProvider locale={locale}>
      <SiteHeader locale={locale} latestNews={latestNews} />
      <SocialRail socialLinks={socialLinks} contactLinks={contactLinks} />
      <ViewTransition default="page-fade">
        <div className="flex-1">{children}</div>
      </ViewTransition>
      <SiteFooter locale={locale} socialLinks={socialLinks} />
    </LocaleProvider>
  );
}
