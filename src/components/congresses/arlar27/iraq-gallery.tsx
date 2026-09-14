"use client";

import Image from "next/image";

import type { IraqGalleryImage } from "@/data/iraq-gallery";
import { useTranslations } from "@/i18n/locale-context";

/** Tile geometry per shape, so the strip reads as a varied rhythm. */
const SHAPE_CLASS: Record<IraqGalleryImage["shape"], string> = {
  wide: "w-[19rem] aspect-[16/10] sm:w-[26rem]",
  tall: "w-[12rem] aspect-[3/4] sm:w-[15rem]",
  square: "w-[15rem] aspect-square sm:w-[19rem]",
};

const SIZES = "(min-width: 640px) 26rem, 19rem";

/**
 * A seamless, auto-scrolling strip of destination photographs.
 *
 * The track is rendered twice and translated by -50%, so the loop has no seam.
 * The base list is repeated first so a short gallery still fills the width —
 * with only a couple of photographs the strip would otherwise show a gap.
 */
export function IraqGallery({ images }: { images: IraqGalleryImage[] }) {
  const { t } = useTranslations();
  if (images.length === 0) return null;

  const tiles: IraqGalleryImage[] = [];
  while (tiles.length < Math.max(6, images.length)) tiles.push(...images);

  return (
    <div className="group/gallery relative overflow-hidden">
      {/* Soft edges so tiles fade in and out rather than being cut off. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r from-[#f7f9f9] to-transparent rtl:bg-gradient-to-l sm:w-28"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-[#f7f9f9] to-transparent rtl:bg-gradient-to-r sm:w-28"
      />

      <ul
        className="flex w-max gap-4 motion-safe:animate-marquee motion-reduce:translate-x-0 group-hover/gallery:[animation-play-state:paused] group-focus-within/gallery:[animation-play-state:paused]"
        // The duplicate half is presentational; screen readers get the first
        // copy only, via aria-hidden on the clones below.
      >
        {[...tiles, ...tiles].map((image, index) => (
          <li
            key={`${image.src}-${index}`}
            aria-hidden={index >= tiles.length}
            className={`relative shrink-0 overflow-hidden rounded-[1.4rem] border border-[#dfe6e6] bg-[#e9eeee] ${SHAPE_CLASS[image.shape]}`}
          >
            <Image
              src={image.src}
              alt={index >= tiles.length ? "" : t(image.alt)}
              fill
              sizes={SIZES}
              className="object-cover"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
