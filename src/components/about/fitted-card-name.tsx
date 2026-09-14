"use client";

import { useLayoutEffect, useRef } from "react";

const MAX_FONT_SIZE = 24;
const MIN_FONT_SIZE = 12;

export function FittedCardName({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const nameRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const element = nameRef.current;
    if (!element) return;

    let cancelled = false;

    const fitName = () => {
      if (cancelled) return;

      element.style.fontSize = `${MAX_FONT_SIZE}px`;

      const availableWidth = element.clientWidth;
      const requiredWidth = element.scrollWidth;
      if (!availableWidth || !requiredWidth) return;

      const fittedSize =
        requiredWidth > availableWidth
          ? Math.max(
              MIN_FONT_SIZE,
              (MAX_FONT_SIZE * availableWidth) / requiredWidth - 0.25,
            )
          : MAX_FONT_SIZE;

      element.style.fontSize = `${fittedSize}px`;
    };

    fitName();
    void document.fonts.ready.then(fitName);

    const resizeObserver = new ResizeObserver(fitName);
    resizeObserver.observe(element);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, [name]);

  return (
    <h3
      ref={nameRef}
      className={`w-full overflow-hidden whitespace-nowrap font-display text-2xl font-semibold leading-tight tracking-[-0.025em] ${className}`}
    >
      {name}
    </h3>
  );
}
