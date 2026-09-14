"use client";

import { ArrowRight } from "@/components/icons";
import { useTranslations } from "@/i18n/locale-context";

/**
 * Banner shown on an ArLAR27 page whose content lives on an external portal.
 *
 * The portal always opens in a new tab so the visitor keeps the congress site
 * open behind them — the same reason microsite links to these routes are
 * new-tab anchors rather than navigations.
 */
export function Arlar27PortalCta({
  title,
  description,
  action,
  url,
}: {
  title: string;
  description: string;
  action: string;
  url: string;
}) {
  const { t } = useTranslations();

  return (
    <section className="border-b border-ink-200 bg-[#eef5fa]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-ink-950">{t(title)}</h2>
          <p className="mt-1.5 text-[13px] leading-6 text-ink-500">{t(description)}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#032b52] px-6 font-display text-[13px] font-semibold text-[#ffd45c] transition-colors hover:bg-[#0d4c7a]"
        >
          {t(action)}
          <ArrowRight className="rtl-flip size-4" />
        </a>
      </div>
    </section>
  );
}
