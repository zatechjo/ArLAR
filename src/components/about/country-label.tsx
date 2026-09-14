"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "@/i18n/locale-context";

const FLAG_WIDTH = 52;

export function CountryLabel({
  countryName,
  className = "",
}: {
  countryName: string;
  className?: string;
}) {
  const { t } = useTranslations();
  const labelRef = useRef<HTMLSpanElement>(null);
  const [isShort, setIsShort] = useState(false);

  useLayoutEffect(() => {
    const element = labelRef.current;
    if (!element) return;

    let cancelled = false;

    const measure = () => {
      if (cancelled) return;

      const previousWidth = element.style.width;
      const previousMaxWidth = element.style.maxWidth;
      element.style.width = "max-content";
      element.style.maxWidth = "none";
      const naturalWidth = element.getBoundingClientRect().width;
      element.style.width = previousWidth;
      element.style.maxWidth = previousMaxWidth;

      setIsShort(naturalWidth <= FLAG_WIDTH);
    };

    measure();
    void document.fonts.ready.then(measure);

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, [countryName]);

  return (
    <span
      ref={labelRef}
      className={`font-display text-[10px] font-semibold leading-4 tracking-[0.1em] uppercase ${
        isShort ? "w-[3.25rem] text-center" : "max-w-36 text-right"
      } ${className}`}
    >
      {t(countryName)}
    </span>
  );
}
