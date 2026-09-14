"use client";

import { useEffect, useState } from "react";

import { Check, Link2, Share2 } from "@/components/icons";
import { useTranslations } from "@/i18n/locale-context";

export function ArticleShare({ path, title }: { path: string; title: string }) {
  const { t } = useTranslations();
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setUrl(`${window.location.origin}${path}`);
      setCanNativeShare(typeof navigator.share === "function");
    });

    return () => cancelAnimationFrame(frame);
  }, [path]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked by browser or device settings.
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // Closing the native share sheet does not require an error state.
    }
  }

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="relative flex flex-col items-start sm:items-end">
      <button
        type="button"
        onClick={() => setShowShare((current) => !current)}
        aria-expanded={showShare}
        className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-crimson-600 px-4 font-display text-[11px] font-semibold text-white transition-colors hover:bg-crimson-700"
      >
        <Share2 className="size-4" />
        {t("Share this page")}
      </button>

      {showShare ? (
        <div className="absolute end-0 top-full z-30 mt-3 w-72 rounded-2xl border border-ink-100 bg-white p-4 shadow-[0_18px_45px_-20px_rgba(5,13,22,0.35)]">
          <p className="font-display text-[9.5px] font-semibold tracking-[0.16em] text-crimson-700 uppercase">
            {t("Share via")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SharePill
              href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
              label="WhatsApp"
            />
            <SharePill
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              label="Facebook"
            />
            <SharePill
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              label="LinkedIn"
            />
            <SharePill
              href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
              label="X"
            />
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border border-ink-100 bg-white px-3 font-display text-[10.5px] font-semibold text-ink-500 transition-colors hover:border-jade-300 hover:text-jade-700"
            >
              {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
              {copied ? t("Copied") : t("Copy link")}
            </button>
            {canNativeShare ? (
              <button
                type="button"
                onClick={nativeShare}
                className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border border-ink-100 bg-white px-3 font-display text-[10.5px] font-semibold text-ink-500 transition-colors hover:border-jade-300 hover:text-jade-700"
              >
                <Share2 className="size-3.5" />
                {t("More")}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SharePill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-8 items-center rounded-full border border-ink-100 bg-white px-3 font-display text-[10.5px] font-semibold text-ink-500 transition-colors hover:border-crimson-200 hover:text-crimson-700"
    >
      {label}
    </a>
  );
}
