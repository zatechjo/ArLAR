import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { display } from "@/app/fonts";
import { SiteShell } from "@/components/site-shell";
import { isLocale, localeDirection, locales, type Locale } from "@/i18n/config";
import { listPublicNewsArticlesAsync } from "@/lib/admin-news-repository";
import { arlarContactLinks, arlarSocialLinks } from "@/lib/contact-links";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { getPublishedSiteContent } from "@/lib/site-content-repository";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "ArLAR — Arab League of Associations for Rheumatology",
    template: "%s | ArLAR",
  },
  description:
    "The Arab League of Associations for Rheumatology unites national rheumatology societies across the Arab world — advancing care, education, and research since 1995.",
  authors: [{ name: "Arab League of Associations for Rheumatology", url: SITE_URL }],
  creator: "Arab League of Associations for Rheumatology",
  publisher: "Arab League of Associations for Rheumatology",
  category: "Rheumatology",
  keywords: [
    "ArLAR",
    "Arab rheumatology",
    "rheumatology",
    "rheumatic diseases",
    "medical education",
    "Arab League of Associations for Rheumatology",
  ],
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function PublicRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const [news, socialLinks, contactLinks] = await Promise.all([
    listPublicNewsArticlesAsync(locale),
    getPublishedSiteContent("global", "social-links", arlarSocialLinks, locale),
    getPublishedSiteContent("global", "contact-links", arlarContactLinks, locale),
  ]);
  const latestNews = news.slice(0, 10).map(({ slug, title }) => ({
    slug,
    title,
  }));
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: "Arab League of Associations for Rheumatology",
      alternateName: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/arlar-logo-tight.png`,
      medicalSpecialty: "Rheumatologic",
      sameAs: socialLinks.map((link) => link.href),
      contactPoint: contactLinks.map((link) => ({
        "@type": "ContactPoint",
        contactType: "Secretariat",
        ...(link.href.startsWith("mailto:") ? { email: link.href.slice(7) } : {}),
        ...(link.href.startsWith("tel:") ? { telephone: link.href.slice(4) } : {}),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: locale,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}${locale === "en" ? "" : `/${locale}`}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <html
      lang={locale}
      dir={localeDirection(locale)}
      data-scroll-behavior="smooth"
      className={`${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }}
        />
        <SiteShell locale={locale} latestNews={latestNews} socialLinks={socialLinks} contactLinks={contactLinks}>{children}</SiteShell>
      </body>
    </html>
  );
}
