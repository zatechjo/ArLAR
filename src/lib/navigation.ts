import { languageNames, localizePath, locales, type Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";

export type NavLink = {
  label: string;
  href?: string;
  description?: string;
  links?: NavLink[];
  emphasis?: "related";
};

export type NavItem = {
  label: string;
  href?: string;
  links?: NavLink[];
};

export const mainNav: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About Us",
    href: "/about",
    links: [
      {
        label: "About ArLAR",
        href: "/about",
        description: "Mission, vision, and who we are",
      },
      {
        label: "History of ArLAR",
        href: "/about#history",
        description: "From 1995 to today",
      },
      {
        label: "President Message",
        href: "/about/president-message",
        description: "A word from our president",
      },
      {
        label: "Board of Directors",
        href: "/about/board",
        description: "Regional leadership",
      },
      {
        label: "Scientific Committee",
        href: "/about/scientific-committee",
        description: "Guiding our scientific agenda",
      },
      {
        label: "ArLAR Media Group",
        href: "/about/media-group",
        description: "Communication and outreach",
      },
      {
        label: "ArLAR Bylaws",
        href: "/about/bylaws",
        description: "Governing documents",
      },
      {
        label: "Secretariat",
        href: "/about/secretariat",
        description: "Administration and contact points",
      },
    ],
  },
  {
    label: "ArLAR College",
    href: "/college/about",
    links: [
      {
        label: "About ArLAR College",
        href: "/college/about",
        description: "What the College is and why it exists",
      },
      {
        label: "ArLAR College Members",
        href: "/college/members",
        description: "Meet the college community",
      },
      {
        label: "ArLAR College Events",
        href: "/college/events",
        description: "Courses, webinars and workshops",
      },
    ],
  },
  {
    label: "ArLAR Members",
    href: "/members",
  },
  {
    label: "Events & Congresses",
    links: [
      {
        label: "Past ArLAR Congresses",
        description: "Replays and the full congress archive",
        links: [
          {
            label: "ArLAR23 Kuwait Replay",
            href: "/congresses/arlar23-replay",
            description: "Watch sessions on demand",
          },
          {
            label: "ArLAR21 Jordan Replay",
            href: "/congresses/arlar21-replay",
            description: "Watch sessions on demand",
          },
        ],
      },
      {
        label: "ArLAR Members Events & Congresses",
        href: "/events/members",
        description: "Events by national societies",
      },
      {
        label: "International Events & Congresses",
        href: "/events/international",
        description: "EULAR, ACR and global meetings",
      },
      {
        label: "Related Links",
        href: "/events/related-links",
        description: "Useful regional and global resources",
        emphasis: "related",
      },
    ],
  },
  {
    label: "For Healthcare Professionals",
    links: [
      {
        label: "ArLAR Publications",
        href: "/professionals/publications",
        description: "Recommendations and scientific output",
      },
      {
        label: "ArLAR E-Bulletin",
        href: "/professionals/e-bulletin",
        description: "News and updates from the Media Group",
      },
      {
        label: "ArLAR Partners",
        href: "/professionals/partners",
        description: "Industry and institutional partners",
      },
    ],
  },
  {
    label: "Educational Library",
    href: "/education",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

function localizeNavLink(link: NavLink, locale: Locale): NavLink {
  return {
    ...link,
    label: translate(locale, link.label),
    href: link.href ? localizePath(link.href, locale) : undefined,
    description: link.description ? translate(locale, link.description) : undefined,
    links: link.links?.map((child) => localizeNavLink(child, locale)),
  };
}

export function getMainNav(locale: Locale): NavItem[] {
  return mainNav.map((item) => ({
    ...item,
    label: translate(locale, item.label),
    href: item.href ? localizePath(item.href, locale) : undefined,
    links: item.links?.map((link) => localizeNavLink(link, locale)),
  }));
}

export const languages = locales.map((code) => ({ code, ...languageNames[code] }));

export const memberCountries = [
  "Algeria",
  "Egypt",
  "Iraq",
  "Jordan",
  "Kuwait",
  "Lebanon",
  "Libya",
  "Morocco",
  "Oman",
  "Palestine",
  "Qatar",
  "Saudi Arabia",
  "Sudan",
  "Syria",
  "Tunisia",
  "UAE",
];
