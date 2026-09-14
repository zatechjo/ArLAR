import type { Metadata } from "next";

import { localizePath, locales, type Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export const SITE_URL = "https://www.arabrheumatology.org";
export const SITE_NAME = "ArLAR";

type SeoEntry = {
  title: string;
  description: string;
  noIndex?: boolean;
};

const seoEntries = {
  "/": {
    title: "Arab League of Associations for Rheumatology",
    description: "The Arab League of Associations for Rheumatology unites national rheumatology societies across the Arab world — advancing care, education, and research since 1995.",
  },
  "/about": {
    title: "About ArLAR",
    description: "Learn about ArLAR, its mission, regional role, and history from its founding in 1995 to the present day.",
  },
  "/about/board": {
    title: "Board of Directors",
    description: "Meet the Executive Council and Board Members leading the Arab League of Associations for Rheumatology.",
  },
  "/about/bylaws": {
    title: "ArLAR Bylaws",
    description: "Browse the official bylaws of the Arab League of Associations for Rheumatology.",
  },
  "/about/media-group": {
    title: "ArLAR Media Group",
    description: "Meet the ArLAR Media Group connecting the regional rheumatology community through communication, awareness, and outreach.",
  },
  "/about/president-message": {
    title: "President's Message",
    description: "A message of purpose, partnership, and progress from the President of ArLAR.",
  },
  "/about/scientific-committee": {
    title: "Scientific Committee",
    description: "Meet the regional experts guiding ArLAR’s scientific direction, education, and research priorities.",
  },
  "/about/secretariat": {
    title: "Secretariat",
    description: "Contact the ArLAR Secretariat about membership, education, events, research, media, partnerships, and general enquiries.",
  },
  "/college/about": {
    title: "About ArLAR College",
    description: "ArLAR College is an initiative of the ArLAR Scientific Committee and Board of Directors, advancing scientific collaboration, awareness, and continuous medical education in rheumatology across the Arab countries and beyond.",
  },
  "/college/events": {
    title: "ArLAR College Events",
    description: "Upcoming ArLAR College webinars and the full archive of past webinar replays, searchable by title and year.",
  },
  "/college/members": {
    title: "ArLAR College Members",
    description: "The rheumatologists who make up ArLAR College, from across the Arab world.",
  },
  "/congresses/arlar21": {
    title: "ArLAR21 Jordan e-Congress",
    description: "Explore the ArLAR21 Jordan e-Congress and browse its complete archive of 80 scientific recordings.",
  },
  "/congresses/arlar21-replay": {
    title: "ArLAR21 Jordan Replays",
    description: "Explore the ArLAR21 Jordan e-Congress and browse its complete archive of 80 scientific recordings.",
  },
  "/congresses/arlar23-replay": {
    title: "ArLAR23 Kuwait Congress Replays",
    description: "Watch the complete available ArLAR23 Kuwait Congress replay archive from 2–4 March 2023.",
  },
  "/congresses/arlar27": {
    title: "ArLAR27 Iraq Congress",
    description: "The official ArLAR27 Iraq Congress website. Join the Arab rheumatology community in Baghdad from 24–27 March 2027.",
  },
  "/congresses/arlar27/about-iraq": {
    title: "About Iraq",
    description: "Discover Baghdad, host city of the ArLAR27 Iraq Congress.",
  },
  "/congresses/arlar27/abstracts": {
    title: "Abstract Submission",
    description: "Abstract submission information for the ArLAR27 Iraq Congress.",
  },
  "/congresses/arlar27/committee": {
    title: "Congress Committee",
    description: "The leaders and working groups guiding the scientific vision and congress experience of ArLAR27.",
  },
  "/congresses/arlar27/faculty": {
    title: "Faculty",
    description: "Regional and international experts will come together in Baghdad to share evidence, experience, and new perspectives.",
  },
  "/congresses/arlar27/programme": {
    title: "Scientific Programme",
    description: "Four days in Baghdad dedicated to the science, practice, and future of rheumatology.",
  },
  "/congresses/arlar27/registration": {
    title: "Registration",
    description: "Plan to join the Arab rheumatology community in Baghdad from 24 to 27 March 2027.",
  },
  "/congresses/arlar27/welcome": {
    title: "Welcome Message",
    description: "Welcome to ArLAR27 in Baghdad, Iraq, 24–27 March 2027.",
  },
  "/contact": {
    title: "Contact Us",
    description: "Contact the ArLAR Secretariat about membership, education, scientific activities, events, and other organisational matters.",
  },
  "/education": {
    title: "Educational Library",
    description: "Search ArLAR webinars, congress replays, publications, clinical cases, and E-Bulletins in one educational library.",
  },
  "/events/international": {
    title: "International Events & Congresses",
    description: "A curated calendar of international rheumatology meetings and congresses.",
  },
  "/events/members": {
    title: "ArLAR Members Events & Congresses",
    description: "ArLAR members events and congresses across the Arab world.",
  },
  "/events/related-links": {
    title: "Related Rheumatology Links",
    description: "Regional and international rheumatology associations, societies, and musculoskeletal health organizations.",
  },
  "/members": {
    title: "ArLAR Members",
    description: "The national rheumatology societies that make up ArLAR, from the Gulf to North Africa.",
  },
  "/news": {
    title: "ArLAR News",
    description: "ArLAR announcements, member updates, congress news, research activity, and developments from the Arab rheumatology community.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description: "How ArLAR handles personal information when visitors use the website, contact the Secretariat, or access ArLAR services.",
  },
  "/professionals/e-bulletin": {
    title: "ArLAR E-Bulletin",
    description: "Browse every issue of the ArLAR E-Bulletin from the Media Group archive.",
  },
  "/professionals/partners": {
    title: "ArLAR Partners",
    description: "Explore partner initiatives and open educational resources shared with the ArLAR community.",
  },
  "/professionals/publications": {
    title: "ArLAR Publications",
    description: "Browse scientific studies and research published by the Arab League of Associations for Rheumatology.",
  },
  "/public-patients": {
    title: "For Public & Patients",
    description: "Plain-language answers about rheumatology, living with rheumatic disease, treatment safety, and COVID-19 from ArLAR and the AAAA Group.",
  },
  "/search": {
    title: "Search ArLAR",
    description: "Search ArLAR news, doctors, special interest groups, webinars, publications, patient information, and website pages.",
    noIndex: true,
  },
  "/special-interest-groups": {
    title: "Special Interest Groups",
    description: "Explore ArLAR's nine Special Interest Groups advancing rheumatology research, education, clinical practice, and collaboration.",
  },
  "/special-interest-groups/arab-adult-arthritis-awareness": {
    title: "Arab Adult Arthritis Awareness Group",
    description: "Learn about the AAAA Group, its mission, board, regional members, and archived educational webinars.",
  },
  "/terms": {
    title: "Terms & Conditions",
    description: "The terms that apply when using the ArLAR website, educational resources, event information, and digital services.",
  },
} as const satisfies Record<string, SeoEntry>;

export type StaticSeoPath = keyof typeof seoEntries;

const openGraphLocales: Record<Locale, string> = {
  en: "en_US",
  ar: "ar_AR",
  fr: "fr_FR",
};

export function absoluteLocalizedUrl(path: string, locale: Locale): string {
  return new URL(localizePath(path, locale), SITE_URL).toString();
}

export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, absoluteLocalizedUrl(path, locale)])),
    "x-default": absoluteLocalizedUrl(path, "en"),
  };
}

function socialImage(path: string) {
  if (path.startsWith("/congresses/arlar27")) {
    return { url: "/images/arlar27-save-the-date.jpg", width: 2048, height: 1152, alt: "ArLAR27 Iraq Congress — Baghdad, 24–27 March 2027" };
  }
  if (path.startsWith("/college")) {
    return { url: "/images/arlar-college-hero-v2.png", width: 1717, height: 916, alt: "ArLAR College" };
  }
  return { url: "/images/arlar-core-hero-v3.png", width: 1672, height: 941, alt: "Arab League of Associations for Rheumatology" };
}

function conciseMetadataText(value: string, maxLength: number): string {
  const compact = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  const candidate = compact.slice(0, maxLength - 1).trimEnd();
  const lastSpace = candidate.lastIndexOf(" ");
  return `${lastSpace >= Math.floor(maxLength * 0.7) ? candidate.slice(0, lastSpace) : candidate}…`;
}

export function buildLocalizedMetadata({
  locale,
  path,
  title,
  description,
  noIndex = false,
  image,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  noIndex?: boolean;
  image?: { url: string; width?: number; height?: number; alt?: string };
}): Metadata {
  const localizedTitle = conciseMetadataText(translate(locale, title), 64);
  const localizedDescription = conciseMetadataText(translate(locale, description), 160);
  const canonical = absoluteLocalizedUrl(path, locale);
  const socialTitle = localizedTitle.includes(SITE_NAME) ? localizedTitle : `${localizedTitle} | ${SITE_NAME}`;
  const selectedImage = image ?? socialImage(path);

  return {
    title: localizedTitle.includes(SITE_NAME) ? { absolute: localizedTitle } : localizedTitle,
    description: localizedDescription,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      locale: openGraphLocales[locale],
      alternateLocale: locales.filter((item) => item !== locale).map((item) => openGraphLocales[item]),
      title: socialTitle,
      description: localizedDescription,
      images: [selectedImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: localizedDescription,
      images: [selectedImage.url],
    },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export function createStaticPageMetadata(path: StaticSeoPath) {
  return async ({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> => {
    const { lang } = await params;
    const entry = seoEntries[path];
    return buildLocalizedMetadata({ locale: lang, path, ...entry });
  };
}
