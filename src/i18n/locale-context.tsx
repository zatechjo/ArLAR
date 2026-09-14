"use client";

import { createContext, useContext, useEffect } from "react";

import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/config";
import { translate } from "@/i18n/messages";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  useEffect(() => {
    if (locale === "en") return;

    // A small compatibility layer for legacy route modules that still contain
    // literal UI copy. New code should call `t()` directly, but translating
    // exact text nodes here prevents an otherwise mixed-language page while
    // those modules are being migrated. It is intentionally exact-match only:
    // names, article bodies, URLs, and user-entered content are left alone.
    const translateDom = () => {
      const root = document.body;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) nodes.push(node as Text);
      for (const textNode of nodes) {
        const parent = textNode.parentElement;
        if (!parent || parent.closest("script,style,noscript,[data-no-translate]")) continue;
        const source = textNode.nodeValue ?? "";
        const trimmed = source.trim();
        if (!trimmed) continue;
        const translated = translate(locale, trimmed);
        if (translated === trimmed) continue;
        const start = source.indexOf(trimmed);
        textNode.nodeValue = `${source.slice(0, start)}${translated}${source.slice(start + trimmed.length)}`;
      }
      for (const element of Array.from(root.querySelectorAll<HTMLElement>("[aria-label], [title], input[placeholder], textarea[placeholder]"))) {
        for (const attribute of ["aria-label", "title", "placeholder"] as const) {
          const value = element.getAttribute(attribute);
          if (value) element.setAttribute(attribute, translate(locale, value));
        }
      }
    };

    let timer: number | undefined;
    const schedule = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = undefined;
        translateDom();
      }, 60);
    };
    const frame = window.requestAnimationFrame(translateDom);
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      window.cancelAnimationFrame(frame);
      if (timer !== undefined) window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [locale]);

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useTranslations() {
  const locale = useLocale();
  return {
    locale,
    t: (source: string) => translate(locale, source),
    href: (path: string) => localizePath(path, locale),
  };
}
