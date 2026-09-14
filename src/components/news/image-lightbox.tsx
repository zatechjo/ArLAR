"use client";

import { useCallback, useEffect, useRef } from "react";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

export type LightboxImage = {
  src: string;
  alt?: string;
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

export function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H3v5M3 3l6 6M16 3h5v5M21 3l-6 6M8 21H3v-5M3 21l6-6M16 21h5v-5M21 21l-6-6" />
    </svg>
  );
}

export function ImageLightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onIndex: (index: number) => void;
}) {
  const count = images.length;
  const current = images[index];
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useModalAccessibility<HTMLDivElement>({ onClose, initialFocusRef: closeButtonRef });

  const move = useCallback(
    (delta: number) => {
      if (count < 2) return;
      onIndex((index + delta + count) % count);
    },
    [count, index, onIndex],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [move]);

  if (!current) return null;

  const downloadName = current.src.split("/").pop()?.split("?")[0] || "arlar-image";

  return (
    <div ref={modalRef} tabIndex={-1} className="fixed inset-0 z-[120] flex h-[100dvh] flex-col overflow-hidden" role="dialog" aria-modal="true" aria-label="Image preview">
      <button
        type="button"
        aria-label="Close image preview"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-ink-950/90 backdrop-blur-sm"
      />

      <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-4 py-4 text-white sm:px-6">
        <span className="font-display text-[12px] font-medium text-white/75 tabular-nums">
          {index + 1} / {count}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={current.src}
            download={downloadName}
            aria-label="Download image"
            title="Download image"
            className="grid size-10 cursor-pointer place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <DownloadIcon />
          </a>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close image preview"
            className="grid size-10 cursor-pointer place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-16">
        <button
          type="button"
          aria-label="Close image preview"
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.src}
          alt={current.alt || ""}
          className="relative z-10 max-h-full max-w-full object-contain"
          onClick={(event) => event.stopPropagation()}
        />

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 z-20 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-4"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 z-20 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-4"
            >
              <ChevronIcon direction="right" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
