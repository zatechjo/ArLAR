import blogExport from "./blog-posts.json";
import categoryExport from "../../data/wix/blog/categories.raw.json";
import mediaExport from "../../data/wix/blog/media-manifest.json";
import { migratedWixMediaUrl } from "@/lib/wix-media-url";

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  dateLabel: string;
  minutesToRead: number;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  coverVideo?: { src: string; poster?: string; title?: string };
  coverEmbedUrl?: string;
  categories: string[];
  categoryIds: string[];
  tagIds: string[];
  hashtags: string[];
  contentText: string;
  richContent: unknown;
  rawPost: unknown;
};

export type NewsCardArticle = Pick<
  NewsArticle,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "publishedAt"
  | "dateLabel"
  | "image"
  | "imageAlt"
  | "categories"
>;

type BlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  url?: string | null;
  excerpt?: string | null;
  contentText?: string | null;
  richContent?: unknown;
  heroImage?: string | null;
  media?: {
    wixMedia?: {
      image?: {
        id?: string;
        url?: string;
        width?: number;
        height?: number;
        filename?: string;
      };
      videoV2?: {
        resolutions?: Array<{ url?: string; format?: string; width?: number; height?: number }>;
        posters?: Array<{
          id?: string;
          url?: string;
          width?: number;
          height?: number;
        }>;
      };
    };
    embedMedia?: {
      thumbnail?: { url?: string; width?: number; height?: number };
      video?: { url?: string };
    };
  } | null;
  firstPublishedDate?: string | null;
  minutesToRead?: number | null;
  categoryIds?: string[];
  tagIds?: string[];
  hashtags?: string[];
  rawPost?: unknown;
};

type BlogExport = { posts: BlogPostRecord[] };
type CategoryExport = {
  records: Array<{ id: string; label?: string; title?: string }>;
};
type MediaExport = {
  media: Array<{ mediaKey: string; localName?: string; status?: string }>;
};

const blogData = blogExport as unknown as BlogExport;
const categoriesData = categoryExport as unknown as CategoryExport;
const mediaData = mediaExport as unknown as MediaExport;

const categoryLabels = new Map(
  categoriesData.records.map((category) => [
    category.id,
    category.label || category.title || category.id,
  ]),
);

const mediaByKey = new Map(
  mediaData.media.map((media) => [media.mediaKey, media]),
);

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function mediaKeyFromId(id: string | null | undefined) {
  if (!id) return null;
  if (id.includes("static.wixstatic.com/media/")) {
    return id.split("static.wixstatic.com/media/")[1].split(/[?#/]/)[0];
  }
  if (id.startsWith("media/")) return id.slice("media/".length);
  if (id.startsWith("wix:image://v1/")) {
    const value = id.slice("wix:image://v1/".length);
    const slash = value.indexOf("/");
    return (slash === -1 ? value : value.slice(0, slash)).split("#")[0];
  }
  return id;
}

function localMediaPath(id: string | null | undefined) {
  const key = mediaKeyFromId(id);
  const media = key
    ? mediaByKey.get(key) || mediaByKey.get(`external:${key}`)
    : undefined;
  if (media?.localName && media.status !== "failed:403") {
    return `/images/wix-blog/originals/${media.localName}`;
  }
  return null;
}

function richTextFallback(content: string | null | undefined) {
  return (content || "").trim();
}

function estimateMinutes(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200));
}

function articleFromPost(post: BlogPostRecord): NewsArticle {
  const publishedAt = post.firstPublishedDate?.slice(0, 10) || "";
  const cover = post.media?.wixMedia?.image;
  const richContent = post.richContent || { nodes: [] };
  const contentText = richTextFallback(post.contentText);
  const categoryIds = post.categoryIds || [];
  const categories = categoryIds.map(
    (categoryId) => categoryLabels.get(categoryId) || categoryId,
  );
  const videoPoster = post.media?.wixMedia?.videoV2?.posters?.[0];
  const embedThumbnail = post.media?.embedMedia?.thumbnail;
  const coverId = cover?.id || videoPoster?.id || embedThumbnail?.url;
  const coverVideoSource = post.media?.wixMedia?.videoV2?.resolutions?.find(
    (resolution) => resolution.format === "mp4" && resolution.url,
  )?.url;
  const migratedCoverVideo = migratedWixMediaUrl(coverVideoSource);
  const image =
    localMediaPath(coverId) ||
    localMediaPath(post.heroImage) ||
    "/images/arlar-logo.png";

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || contentText.slice(0, 500),
    publishedAt,
    dateLabel: publishedAt
      ? dateFormatter.format(new Date(`${publishedAt}T00:00:00Z`))
      : "",
    minutesToRead:
      post.minutesToRead || estimateMinutes(contentText),
    image,
    imageAlt: cover?.filename || post.title,
    imageWidth: cover?.width || videoPoster?.width || embedThumbnail?.width || 1600,
    imageHeight: cover?.height || videoPoster?.height || embedThumbnail?.height || 1000,
    coverVideo: migratedCoverVideo
      ? {
          src: migratedCoverVideo,
          poster: videoPoster?.id ? localMediaPath(videoPoster.id) || undefined : undefined,
          title: post.title,
        }
      : undefined,
    coverEmbedUrl: post.media?.embedMedia?.video?.url || undefined,
    categories,
    categoryIds,
    tagIds: post.tagIds || [],
    hashtags: post.hashtags || [],
    contentText,
    richContent,
    rawPost: post.rawPost || post,
  };
}

export const newsArticles = blogData.posts
  .map(articleFromPost)
  .toSorted((left, right) =>
    right.publishedAt.localeCompare(left.publishedAt),
  );

// Keep the rich document out of the client-side archive payload. Full content
// stays available to the server-rendered article route, while cards only need
// their display metadata.
export function toNewsCardArticle(article: NewsArticle): NewsCardArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    publishedAt: article.publishedAt,
    dateLabel: article.dateLabel,
    image: article.image,
    imageAlt: article.imageAlt,
    categories: article.categories,
  };
}

export const newsArticleCards: NewsCardArticle[] = newsArticles.map(toNewsCardArticle);

function normalizeNewsSlug(slug: string) {
  try {
    return decodeURIComponent(slug).normalize("NFC");
  } catch {
    return slug.normalize("NFC");
  }
}

export function getNewsArticle(slug: string) {
  const normalizedSlug = normalizeNewsSlug(slug);
  return newsArticles.find(
    (article) => normalizeNewsSlug(article.slug) === normalizedSlug,
  );
}
