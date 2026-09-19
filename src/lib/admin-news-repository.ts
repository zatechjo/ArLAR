import "server-only";

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import {
  getNewsArticle,
  newsArticles,
  toNewsCardArticle,
  type NewsArticle,
  type NewsCardArticle,
} from "@/data/news";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabasePublicDataClient, getCurrentAdminProfileId, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/config";
import { getImportedArabicTranslation } from "@/lib/wix-blog-translations";
import { siteMediaUrl } from "@/lib/media-url";

type NewsLifecycle = "active" | "trashed" | "deleted";

type NewsTranslation = {
  title: string;
  body: string;
  richContent?: unknown;
};

type NewsTranslations = { arabic: NewsTranslation; french: NewsTranslation };

type NewsDraftRevision = {
  article: NewsArticle;
  translations: NewsTranslations;
};

type SaveNewsInput = {
  mode: "save" | "publish";
  arabic: { title: string; body: string };
  french: { title: string; body: string };
};

type NewsState = {
  lifecycle?: NewsLifecycle;
  deletedAt?: string;
  published?: boolean;
  article?: NewsArticle;
  translations?: NewsTranslations;
  draft?: NewsDraftRevision;
};

type NewsStateStore = {
  version: 1;
  records: Record<string, NewsState>;
};

export type ManagedNewsArticle = NewsArticle & {
  published: boolean;
  translations?: NewsTranslations;
  hasUnpublishedChanges?: boolean;
  draftRevision?: NewsDraftRevision;
};

export type TrashedNewsArticle = ManagedNewsArticle & {
  deletedAt: string;
};

export type AdminNewsCategory = {
  id: string;
  name: string;
};

function listLocalNewsCategories(): AdminNewsCategory[] {
  const categories = new Map<string, string>();
  for (const article of newsArticles) {
    article.categoryIds.forEach((id, index) => {
      if (!categories.has(id)) categories.set(id, article.categories[index] || id);
    });
  }
  return [...categories].map(([id, name]) => ({ id, name })).toSorted((left, right) => left.name.localeCompare(right.name));
}

function localizePublicArticle(article: ManagedNewsArticle, locale: Locale): ManagedNewsArticle {
  const publicArticle = { ...article, image: siteMediaUrl(article.image) };
  if (locale === "en") return publicArticle;
  const importedArabic = locale === "ar" ? getImportedArabicTranslation(article.id, article.slug) : undefined;
  const savedArabic = article.translations?.arabic;
  const translated = locale === "ar"
    ? {
        title: savedArabic?.title || importedArabic?.title || "",
        body: savedArabic?.body || importedArabic?.body || "",
        richContent: savedArabic?.body?.trim()
          ? savedArabic.richContent
          : importedArabic?.richContent,
      }
    : article.translations?.french;
  return {
    ...publicArticle,
    title: translated?.title?.trim() || article.title,
    imageAlt: translated?.title?.trim() || article.imageAlt,
    dateLabel: formatNewsDate(article.publishedAt, locale),
    translations: locale === "ar"
      ? {
          arabic: {
            title: translated?.title || "",
            body: translated?.body || "",
            richContent: translated?.richContent,
          },
          french: article.translations?.french || { title: "", body: "" },
        }
      : article.translations,
  };
}

const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "news-state.json");

function readStore(): NewsStateStore {
  if (!existsSync(statePath)) return { version: 1, records: {} };

  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<NewsStateStore>;
    return {
      version: 1,
      records: parsed.records && typeof parsed.records === "object" ? parsed.records : {},
    };
  } catch {
    // A damaged development-state file should not take the public site down.
    return { version: 1, records: {} };
  }
}

function writeStore(store: NewsStateStore) {
  mkdirSync(stateDirectory, { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, statePath);
}

function assertKnownArticle(store: NewsStateStore, id: string) {
  if (!newsArticles.some((article) => article.id === id) && !store.records[id]?.article) throw new Error("Unknown news article.");
}

function allArticles(store: NewsStateStore) {
  const baseIds = new Set(newsArticles.map((article) => article.id));
  return [...newsArticles, ...Object.values(store.records).flatMap((state) => state.article && !baseIds.has(state.article.id) ? [state.article] : [])];
}

function stateFor(store: NewsStateStore, id: string): Required<Pick<NewsState, "lifecycle" | "published">> & NewsState {
  const state = store.records[id] || {};
  return {
    ...state,
    lifecycle: state.lifecycle || "active",
    published: state.published ?? true,
  };
}

function managedArticle(article: NewsArticle, store: NewsStateStore): ManagedNewsArticle {
  const state = stateFor(store, article.id);
  return { ...(state.article || article), published: state.published, translations: state.translations, hasUnpublishedChanges: Boolean(state.draft), draftRevision: state.draft };
}

function articleForEditing(article: ManagedNewsArticle): ManagedNewsArticle {
  if (!article.draftRevision) return article;
  return {
    ...article.draftRevision.article,
    published: article.published,
    translations: article.draftRevision.translations,
    hasUnpublishedChanges: true,
    draftRevision: article.draftRevision,
  };
}

export function listAdminNewsArticles() {
  const store = readStore();
  return allArticles(store)
    .filter((article) => stateFor(store, article.id).lifecycle === "active")
    .map((article) => managedArticle(article, store));
}

export function getAdminNewsArticle(slug: string) {
  const store = readStore();
  const article = allArticles(store).find((candidate) => candidate.slug === slug || candidate.id === slug) || getNewsArticle(slug);
  if (!article) return undefined;
  if (stateFor(store, article.id).lifecycle !== "active") return undefined;
  return articleForEditing(managedArticle(article, store));
}

export function listTrashedNewsArticles(): TrashedNewsArticle[] {
  const store = readStore();
  return allArticles(store).flatMap((article) => {
    const state = stateFor(store, article.id);
    if (state.lifecycle !== "trashed") return [];
    return [{ ...managedArticle(article, store), deletedAt: state.deletedAt || "" }];
  }).toSorted((left, right) => right.deletedAt.localeCompare(left.deletedAt));
}

export function listPublicNewsArticles() {
  return listAdminNewsArticles().filter((article) => article.published);
}

export function listPublicNewsArticleCards(): NewsCardArticle[] {
  return listPublicNewsArticles().map(toNewsCardArticle);
}

export function getPublicNewsArticle(slug: string) {
  const store = readStore();
  const article = allArticles(store).find((candidate) => candidate.slug === slug || candidate.id === slug) || getNewsArticle(slug);
  if (!article || stateFor(store, article.id).lifecycle !== "active") return undefined;
  const liveArticle = managedArticle(article, store);
  return liveArticle.published ? liveArticle : undefined;
}

function updateArticleState(id: string, update: (current: NewsState) => NewsState) {
  const store = readStore();
  assertKnownArticle(store, id);
  store.records[id] = update(store.records[id] || {});
  writeStore(store);
}

export function saveNewsArticle(article: NewsArticle, input: SaveNewsInput) {
  const store = readStore();
  const current = store.records[article.id] || {};
  const translations = { arabic: input.arabic, french: input.french };
  const articleAlreadyExists = newsArticles.some((candidate) => candidate.id === article.id) || Boolean(current.article);
  const currentlyPublished = articleAlreadyExists && stateFor(store, article.id).published;
  store.records[article.id] = input.mode === "save" && currentlyPublished
    ? { ...current, lifecycle: "active", draft: { article, translations } }
    : { ...current, lifecycle: "active", article, published: input.mode === "publish", translations, draft: undefined };
  writeStore(store);
  return article;
}

export function createNewsArticleId(title: string) {
  const store = readStore();
  const base = title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120) || "news-post";
  const ids = new Set(allArticles(store).map((article) => article.id)); let id = base; let suffix = 2; while (ids.has(id)) id = `${base}-${suffix++}`; return id;
}

export function moveNewsArticleToTrash(id: string) {
  updateArticleState(id, (current) => ({
    ...current,
    lifecycle: "trashed",
    deletedAt: new Date().toISOString(),
  }));
}

export function restoreNewsArticle(id: string) {
  updateArticleState(id, (current) => {
    const { deletedAt, ...rest } = current;
    void deletedAt;
    return { ...rest, lifecycle: "active" };
  });
}

export function permanentlyDeleteNewsArticle(id: string) {
  updateArticleState(id, (current) => ({
    ...current,
    lifecycle: "deleted",
    deletedAt: current.deletedAt || new Date().toISOString(),
  }));
}

export function setNewsArticlePublished(id: string, published: boolean) {
  updateArticleState(id, (current) => ({ ...current, published }));
}

async function loadSupabaseNews(client: SupabaseClient, slug?: string, includeDrafts = false) {
  const articleSelect = "id, slug, status, lifecycle, deleted_at, cover_media_id, published_at, created_at, updated_at";
  const articleResult = slug
    ? await client.from("news_articles").select(articleSelect).eq("slug", slug)
    : await client.from("news_articles").select(articleSelect);
  const { data: articles, error: articleError } = articleResult;
  if (articleError) throw articleError;
  if (!articles?.length) return [];

  const articleIds = articles.map((article) => article.id);
  const mediaIds = articles.flatMap((article) => article.cover_media_id ? [article.cover_media_id] : []);
  const draftsResult = includeDrafts
    ? client.from("site_content").select("content_key, data").eq("namespace", "news-drafts").eq("locale", "en").eq("status", "draft").in("content_key", articleIds)
    : Promise.resolve({ data: [], error: null });
  const [{ data: translations, error: translationError }, { data: categories, error: categoryError }, { data: links, error: linkError }, mediaResult, { data: drafts, error: draftError }] = await Promise.all([
    client.from("news_translations").select("article_id, locale, title, excerpt, body").in("article_id", articleIds),
    client.from("news_categories").select("id, name"),
    client.from("news_article_categories").select("article_id, category_id").in("article_id", articleIds),
    mediaIds.length
      ? client.from("media_assets").select("id, public_url, alt_text, width, height").in("id", mediaIds)
      : Promise.resolve({ data: [], error: null }),
    draftsResult,
  ]);
  const { data: media, error: mediaError } = mediaResult;
  const error = articleError || translationError || categoryError || linkError || mediaError || draftError;
  if (error) throw error;

  const translationsByArticle = new Map<string, typeof translations>();
  for (const translation of translations || []) {
    const list = translationsByArticle.get(translation.article_id) || [];
    list.push(translation);
    translationsByArticle.set(translation.article_id, list);
  }
  const categoryById = new Map((categories || []).map((category) => [category.id, category.name]));
  const categoryIdsByArticle = new Map<string, string[]>();
  for (const link of links || []) {
    const list = categoryIdsByArticle.get(link.article_id) || [];
    list.push(link.category_id);
    categoryIdsByArticle.set(link.article_id, list);
  }
  const mediaById = new Map((media || []).map((asset) => [asset.id, asset]));
  const draftByArticleId = new Map((drafts || []).map((draft) => [draft.content_key, draft.data as NewsDraftRevision]));
  const sourceById = new Map(newsArticles.map((article) => [article.id, article]));

  return articles.map((row): ManagedNewsArticle & { lifecycle: NewsLifecycle; deletedAt?: string } => {
    const source = sourceById.get(row.id);
    const articleTranslations = translationsByArticle.get(row.id) || [];
    const english = articleTranslations.find((translation) => translation.locale === "en");
    const arabic = articleTranslations.find((translation) => translation.locale === "ar");
    const french = articleTranslations.find((translation) => translation.locale === "fr");
    const body = (english?.body || {}) as { contentText?: string; richContent?: unknown; rawPost?: unknown; article?: Partial<NewsArticle> };
    const draftRevision = draftByArticleId.get(row.id);
    const storedArticle = body.article || {};
    const publishedAt = row.published_at?.slice(0, 10) || source?.publishedAt || "";
    const asset = row.cover_media_id ? mediaById.get(row.cover_media_id) : undefined;
    const linkedCategoryIds = categoryIdsByArticle.get(row.id);
    const categoryIds = linkedCategoryIds?.length ? linkedCategoryIds : source?.categoryIds || [];
    const categories = categoryIds.map(
      (id, index) => categoryById.get(id) || source?.categories[index] || id,
    );
    const contentText = body.contentText || source?.contentText || "";
    const article: NewsArticle = {
      id: row.id,
      slug: row.slug,
      title: english?.title || storedArticle.title || source?.title || "Untitled article",
      excerpt: english?.excerpt || storedArticle.excerpt || source?.excerpt || contentText.slice(0, 500),
      publishedAt,
      dateLabel: storedArticle.dateLabel || source?.dateLabel || formatNewsDate(publishedAt),
      minutesToRead: storedArticle.minutesToRead || source?.minutesToRead || Math.max(1, Math.ceil(contentText.split(/\s+/).filter(Boolean).length / 200)),
      image: siteMediaUrl(asset?.public_url || storedArticle.image || source?.image || "/images/arlar-logo.png"),
      imageAlt: asset?.alt_text || storedArticle.imageAlt || source?.imageAlt || english?.title || "ArLAR news",
      imageWidth: asset?.width || storedArticle.imageWidth || source?.imageWidth || 1600,
      imageHeight: asset?.height || storedArticle.imageHeight || source?.imageHeight || 1000,
      coverVideo: storedArticle.coverVideo || source?.coverVideo,
      coverEmbedUrl: storedArticle.coverEmbedUrl || source?.coverEmbedUrl,
      categories,
      categoryIds,
      tagIds: storedArticle.tagIds || source?.tagIds || [],
      hashtags: storedArticle.hashtags || source?.hashtags || [],
      contentText,
      richContent: body.richContent || source?.richContent || { nodes: [] },
      rawPost: body.rawPost || source?.rawPost || {},
    };
    return {
      ...article,
      published: row.status === "published",
      lifecycle: (row.lifecycle || "active") as NewsLifecycle,
      deletedAt: row.deleted_at || undefined,
      translations: {
        arabic: { title: arabic?.title || "", body: String((arabic?.body as { html?: string } | null)?.html || "") },
        french: { title: french?.title || "", body: String((french?.body as { html?: string } | null)?.html || "") },
      },
      hasUnpublishedChanges: Boolean(draftRevision),
      draftRevision,
    };
  });
}

const loadCachedPublicSupabaseNews = unstable_cache(
  async () => {
    const client = createSupabasePublicDataClient();
    const rows = client ? await loadSupabaseNews(client) : [];
    // Directory cards, navigation, and search do not need the multi-megabyte
    // rich article documents. Keeping summaries below Next's 2 MB cache-entry
    // limit prevents every public request from falling back to five DB reads.
    return rows.map((article) => ({
      ...article,
      contentText: article.contentText.slice(0, 2_000),
      richContent: { nodes: [] },
      rawPost: null,
      translations: article.translations
        ? {
            arabic: { title: article.translations.arabic.title, body: "" },
            french: { title: article.translations.french.title, body: "" },
          }
        : undefined,
    }));
  },
  ["public-news"],
  { tags: ["public-news"], revalidate: false },
);

const loadCachedPublicSupabaseNewsArticle = unstable_cache(
  async (slug: string) => {
    const client = createSupabasePublicDataClient();
    if (!client) return null;
    return (await loadSupabaseNews(client, slug)).find(
      (article) => article.slug === slug && article.lifecycle === "active" && article.published,
    ) ?? null;
  },
  ["public-news-article"],
  { tags: ["public-news"], revalidate: false },
);

export async function listAdminNewsArticlesAsync() {
  if (!getSupabasePublicConfig()) return listAdminNewsArticles();
  try {
    const rows = await loadSupabaseNews(await createSupabaseServerClient(), undefined, true);
    if (!rows.length) return listAdminNewsArticles();
    return rows.filter((article) => article.lifecycle === "active").toSorted((left, right) => right.publishedAt.localeCompare(left.publishedAt));
  } catch (error) {
    reportSupabaseReadFallback("admin-news", error);
    return listAdminNewsArticles();
  }
}

export async function listAdminNewsCategoriesAsync(): Promise<AdminNewsCategory[]> {
  const fallback = listLocalNewsCategories();
  if (!getSupabasePublicConfig()) return fallback;
  try {
    const { data, error } = await (await createSupabaseServerClient())
      .from("news_categories")
      .select("id, name")
      .order("name");
    if (error) throw error;
    return data?.length ? data : fallback;
  } catch (error) {
    reportSupabaseReadFallback("admin-news-categories", error);
    return fallback;
  }
}

export async function getAdminNewsArticleAsync(slug: string) {
  const article = (await listAdminNewsArticlesAsync()).find((candidate) => candidate.slug === slug || candidate.id === slug);
  return article ? articleForEditing(article) : undefined;
}

export async function listTrashedNewsArticlesAsync(): Promise<TrashedNewsArticle[]> {
  if (!getSupabasePublicConfig()) return listTrashedNewsArticles();
  try {
    return (await loadSupabaseNews(await createSupabaseServerClient(), undefined, true)).filter((article) => article.lifecycle === "trashed").map((article) => ({ ...article, deletedAt: article.deletedAt || "" })).toSorted((left, right) => right.deletedAt.localeCompare(left.deletedAt));
  } catch (error) {
    reportSupabaseReadFallback("admin-news-trash", error);
    return listTrashedNewsArticles();
  }
}

export async function listPublicNewsArticlesAsync(locale: Locale = "en") {
  if (!getSupabasePublicConfig()) return listPublicNewsArticles().map((article) => localizePublicArticle(article, locale));
  try {
    const rows = await loadCachedPublicSupabaseNews();
    if (!rows.length) return listPublicNewsArticles().map((article) => localizePublicArticle(article, locale));
    return rows.filter((article) => article.lifecycle === "active" && article.published).toSorted((left, right) => right.publishedAt.localeCompare(left.publishedAt)).map((article) => localizePublicArticle(article, locale));
  } catch (error) {
    reportSupabaseReadFallback("public-news", error);
    return listPublicNewsArticles().map((article) => localizePublicArticle(article, locale));
  }
}

export async function listPublicNewsArticleCardsAsync(locale: Locale = "en"): Promise<NewsCardArticle[]> {
  return (await listPublicNewsArticlesAsync(locale)).map(toNewsCardArticle);
}

export async function getPublicNewsArticleAsync(slug: string, locale: Locale = "en") {
  if (!getSupabasePublicConfig()) {
    const article = getPublicNewsArticle(slug);
    return article ? localizePublicArticle(article, locale) : undefined;
  }
  try {
    const article = await loadCachedPublicSupabaseNewsArticle(slug);
    return article ? localizePublicArticle(article, locale) : undefined;
  } catch (error) {
    reportSupabaseReadFallback(`public-news-article:${slug}`, error);
    const article = getPublicNewsArticle(slug);
    return article ? localizePublicArticle(article, locale) : undefined;
  }
}

async function ensureNewsMedia(client: SupabaseClient, article: NewsArticle, createdBy: string) {
  const storageKey = `external:${article.image}`;
  const { data, error } = await client.from("media_assets").upsert({ storage_provider: "external", storage_key: storageKey, public_url: article.image, original_name: article.image.split("/").pop() || "news-cover", mime_type: "application/octet-stream", size_bytes: 0, folder: "news", width: article.imageWidth || null, height: article.imageHeight || null, alt_text: article.imageAlt, source_url: article.image, created_by: createdBy }, { onConflict: "storage_key" }).select("id").single();
  if (error || !data) throw error || new Error("Unable to save the news cover metadata.");
  return data.id as string;
}

export async function saveNewsArticleAsync(article: NewsArticle, input: SaveNewsInput) {
  if (!getSupabasePublicConfig()) return saveNewsArticle(article, input);
  const client = await createSupabaseServerClient();
  const createdBy = await getCurrentAdminProfileId(client);
  const { data: currentArticle, error: currentArticleError } = await client.from("news_articles").select("status").eq("id", article.id).maybeSingle();
  if (currentArticleError) throw currentArticleError;

  if (input.mode === "save" && currentArticle?.status === "published") {
    const draft: NewsDraftRevision = { article, translations: { arabic: input.arabic, french: input.french } };
    const { error: draftError } = await client.from("site_content").upsert({ namespace: "news-drafts", content_key: article.id, locale: "en", status: "draft", data: draft, updated_by: createdBy, updated_at: new Date().toISOString() }, { onConflict: "namespace,content_key,locale" });
    if (draftError) throw draftError;
    return article;
  }

  const coverMediaId = await ensureNewsMedia(client, article, createdBy);
  const { error: articleError } = await client.from("news_articles").upsert({ id: article.id, slug: article.slug, status: input.mode === "publish" ? "published" : "draft", lifecycle: "active", cover_media_id: coverMediaId, published_at: article.publishedAt ? `${article.publishedAt}T00:00:00Z` : null, created_by: createdBy });
  if (articleError) throw articleError;
  const translations = [
    { article_id: article.id, locale: "en", title: article.title, excerpt: article.excerpt, body: { contentText: article.contentText, richContent: article.richContent, rawPost: article.rawPost, article: { dateLabel: article.dateLabel, minutesToRead: article.minutesToRead, image: article.image, imageAlt: article.imageAlt, imageWidth: article.imageWidth, imageHeight: article.imageHeight, coverVideo: article.coverVideo, coverEmbedUrl: article.coverEmbedUrl, tagIds: article.tagIds, hashtags: article.hashtags } } },
    { article_id: article.id, locale: "ar", title: input.arabic.title, excerpt: "", body: { html: input.arabic.body } },
    { article_id: article.id, locale: "fr", title: input.french.title, excerpt: "", body: { html: input.french.body } },
  ];
  const { error: translationError } = await client.from("news_translations").upsert(translations, { onConflict: "article_id,locale" });
  if (translationError) throw translationError;
  const categories = article.categoryIds.map((sourceId, index) => ({
    id: isUuid(sourceId) ? sourceId : uuidFor(`category:${sourceId}`),
    slug: slugifyNews(article.categories[index] || sourceId),
    name: article.categories[index] || sourceId,
  }));
  if (categories.length) {
    const { error: categoryError } = await client.from("news_categories").upsert(categories, { onConflict: "id" });
    if (categoryError) throw categoryError;
  }
  const { error: deleteLinksError } = await client.from("news_article_categories").delete().eq("article_id", article.id);
  if (deleteLinksError) throw deleteLinksError;
  if (categories.length) {
    const { error: linksError } = await client.from("news_article_categories").insert(categories.map((category) => ({ article_id: article.id, category_id: category.id })));
    if (linksError) throw linksError;
  }
  const { error: clearDraftError } = await client.from("site_content").delete().eq("namespace", "news-drafts").eq("content_key", article.id).eq("locale", "en");
  if (clearDraftError) throw clearDraftError;
  return article;
}

export async function createNewsArticleIdAsync(title: string) {
  if (getSupabasePublicConfig()) return randomUUID();
  const base = slugifyNews(title) || "news-post";
  const ids = new Set((await listAdminNewsArticlesAsync()).map((article) => article.id));
  let id = base;
  let suffix = 2;
  while (ids.has(id)) id = `${base}-${suffix++}`;
  return id;
}

export async function createNewsArticleSlugAsync(title: string) {
  const base = slugifyNews(title) || "news-post";
  const slugs = new Set((await listAdminNewsArticlesAsync()).map((article) => article.slug));
  let slug = base;
  let suffix = 2;
  while (slugs.has(slug)) slug = `${base}-${suffix++}`;
  return slug;
}

async function updateSupabaseNewsLifecycle(id: string, update: Record<string, unknown>) {
  const client = await createSupabaseServerClient();
  const { error } = await client.from("news_articles").update(update).eq("id", id);
  if (error) throw error;
}

export async function moveNewsArticleToTrashAsync(id: string) {
  if (!getSupabasePublicConfig()) return moveNewsArticleToTrash(id);
  return updateSupabaseNewsLifecycle(id, { lifecycle: "trashed", deleted_at: new Date().toISOString() });
}
export async function restoreNewsArticleAsync(id: string) {
  if (!getSupabasePublicConfig()) return restoreNewsArticle(id);
  return updateSupabaseNewsLifecycle(id, { lifecycle: "active", deleted_at: null });
}
export async function permanentlyDeleteNewsArticleAsync(id: string) {
  if (!getSupabasePublicConfig()) return permanentlyDeleteNewsArticle(id);
  return updateSupabaseNewsLifecycle(id, { lifecycle: "deleted", deleted_at: new Date().toISOString() });
}
export async function setNewsArticlePublishedAsync(id: string, published: boolean) {
  if (!getSupabasePublicConfig()) return setNewsArticlePublished(id, published);
  return updateSupabaseNewsLifecycle(id, { status: published ? "published" : "draft" });
}

function formatNewsDate(value: string, locale: Locale = "en") {
  if (!value) return "";
  const dateLocale = locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-GB";
  return new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
function uuidFor(value: string) {
  const hex = createHash("sha1").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "5";
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const raw = hex.join("");
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}
function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
function slugifyNews(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120) || "category";
}

// This module is the persistence boundary. When Supabase is connected, its
// internals can be replaced without changing admin screens or public routes.
// Article media remains URL-based so Cloudflare R2 can be introduced separately.
