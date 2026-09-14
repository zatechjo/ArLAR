export const locales = ["en", "ar", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localeDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && isLocale(segment) ? segment : defaultLocale;
}

export function stripLocaleFromPathname(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] && isLocale(parts[0])) parts.shift();
  return `/${parts.join("/")}`.replace(/\/$/, "") || "/";
}

export function localizePath(href: string, locale: Locale): string {
  if (!href || href.startsWith("#") || /^(?:https?:|mailto:|tel:)/i.test(href)) return href;

  const [pathnameWithQuery, hash = ""] = href.split("#", 2);
  const [pathname, query = ""] = pathnameWithQuery.split("?", 2);
  const cleanPath = stripLocaleFromPathname(pathname || "/");
  const localizedPath = locale === defaultLocale
    ? cleanPath
    : `/${locale}${cleanPath === "/" ? "" : cleanPath}`;

  return `${localizedPath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export const languageNames: Record<Locale, { label: string; nativeLabel: string }> = {
  en: { label: "English", nativeLabel: "English" },
  ar: { label: "Arabic", nativeLabel: "العربية" },
  fr: { label: "French", nativeLabel: "Français" },
};
