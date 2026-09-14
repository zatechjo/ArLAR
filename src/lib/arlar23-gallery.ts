import "server-only";

import manifest from "@/data/arlar23-gallery.json";

type ManifestAsset = (typeof manifest.entries)[number];

export type Arlar23GalleryImage = {
  day: number;
  /** Position within the day, used to build the alt text at render time. */
  order: number;
  label: string;
  src: string;
  thumbnailSrc: string;
  alt: string;
};

function galleryBaseUrl() {
  return process.env.NEXT_PUBLIC_ARLAR23_GALLERY_BASE_URL?.trim().replace(/\/+$/, "") || "";
}

function sourceFor(asset: ManifestAsset, thumbnail = false) {
  const baseUrl = galleryBaseUrl();
  const cloudflareKey = thumbnail ? asset.thumbnailCloudflareKey : asset.cloudflareKey;
  const localSrc = thumbnail ? asset.thumbnailLocalSrc : asset.localSrc;
  return baseUrl ? `${baseUrl}/${cloudflareKey}` : localSrc;
}

export function getArlar23GalleryThumbnailSrc(src: string) {
  return src
    .replace("/images/arlar23/gallery/", "/images/arlar23/gallery-thumbnails/")
    .replace(/\.(?:jpe?g)(?=\?|$)/i, ".webp");
}

export function getArlar23GalleryImages(): Arlar23GalleryImage[] {
  // `alt` is the English fallback. Localised pages rebuild it from `day` and
  // `order` so the phrase table holds three strings rather than one entry per
  // photograph.
  return manifest.entries.map((asset) => ({
    day: asset.day,
    order: asset.order,
    label: `Day ${asset.day}`,
    src: sourceFor(asset),
    thumbnailSrc: sourceFor(asset, true),
    alt: `ArLAR23 Kuwait Congress gallery, Day ${asset.day}, photo ${asset.order}`,
  }));
}

export const arlar23GalleryCounts = manifest.counts;
