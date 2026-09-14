import mediaManifest from "../../data/wix/blog/media-manifest.json";
import videoManifest from "../../data/wix/blog/video-r2-manifest.json";

const images = new Map(
  (mediaManifest.media as Array<{ mediaKey: string; localName?: string; status?: string }>).map((item) => [item.mediaKey, item]),
);
const videos = new Map(
  (videoManifest.videos as Array<{ id: string; publicUrl?: string | null; status?: string }>).map((item) => [item.id, item]),
);

export function migratedWixMediaUrl(value: string | null | undefined) {
  const source = String(value || "").trim();
  if (!source) return null;

  const videoId = wixVideoId(source);
  if (videoId) return videos.get(videoId)?.publicUrl || null;

  const imageKey = wixImageKey(source);
  if (imageKey) {
    const image = images.get(imageKey) || images.get(`external:${imageKey}`);
    return image?.localName && image.status !== "failed:403"
      ? `/images/wix-blog/originals/${image.localName}`
      : null;
  }

  return source;
}

export function wixImageKey(source: string | null | undefined) {
  const value = String(source || "").trim();
  if (!value) return null;
  if (value.includes("static.wixstatic.com/media/")) return value.split("static.wixstatic.com/media/")[1].split(/[?#/]/)[0];
  if (value.startsWith("media/")) return value.slice(6).split(/[?#/]/)[0];
  if (value.startsWith("wix:image://v1/")) return value.slice(15).split(/[?#/]/)[0];
  return null;
}

function wixVideoId(source: string) {
  if (source.includes("video.wixstatic.com/video/")) return source.split("video.wixstatic.com/video/")[1].split(/[?#/]/)[0];
  if (source.startsWith("video/")) return source.slice(6).split(/[?#/]/)[0];
  return null;
}
