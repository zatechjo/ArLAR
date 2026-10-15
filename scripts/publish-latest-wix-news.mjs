import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const apply = process.argv.includes("--apply");
const limit = 4;
const env = {
  ...parseEnv(await readFile(path.join(root, ".env.local"), "utf8")),
  ...await parseOptionalEnv(path.join(root, ".env.production.local")),
  ...process.env,
};
const merged = JSON.parse(await readFile(path.join(root, "data/wix/blog/bilingual/merged.posts.json"), "utf8"));
const categories = JSON.parse(await readFile(path.join(root, "data/wix/blog/categories.raw.json"), "utf8"));
const manifestPath = path.join(root, "data/wix/blog/media-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const outputDir = path.join(root, "public/images/wix-blog/originals");
const latest = merged.posts
  .filter((post) => post.locale === "en")
  .toSorted((a, b) => Date.parse(b.firstPublishedDate || b.lastPublishedDate || 0) - Date.parse(a.firstPublishedDate || a.lastPublishedDate || 0))
  .slice(0, limit);

if (!latest.length) throw new Error("No English Wix posts were found in the bilingual export.");
console.table(latest.map((post) => ({ date: post.firstPublishedDate?.slice(0, 10), slug: post.slug, title: post.title })));
if (!apply) {
  console.log("Dry run only. Re-run with --apply to download media, upload it to R2, and publish these posts.");
  process.exit(0);
}

for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY", "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_R2_BUCKET", "CLOUDFLARE_R2_ACCESS_KEY_ID", "CLOUDFLARE_R2_SECRET_ACCESS_KEY", "CLOUDFLARE_R2_PUBLIC_BASE_URL"]) {
  if (!env[name]) throw new Error(`${name} is missing from .env.local.`);
}

await mkdir(outputDir, { recursive: true });
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID, secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY },
});
const publicBase = env.CLOUDFLARE_R2_PUBLIC_BASE_URL.replace(/\/+$/, "");
const mediaByKey = new Map((manifest.media || []).map((item) => [item.mediaKey, item]));
const mediaForPost = new Map();

for (const post of latest) {
  const englishMedia = await cacheImage(post.media?.wixMedia?.image, post.title);
  const arabic = post.translations?.arabic;
  const arabicSource = findArabicSource(arabic?.sourcePostId);
  const arabicMedia = await cacheImage(arabicSource?.media?.wixMedia?.image, arabic?.title || post.title);
  mediaForPost.set(post.id, { englishMedia, arabicMedia: arabicMedia || englishMedia });
}

manifest.exportedAt = new Date().toISOString();
manifest.total = mediaByKey.size;
manifest.media = [...mediaByKey.values()].toSorted((a, b) => a.mediaKey.localeCompare(b.mediaKey));
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
const categoryRecords = categoryRecordsFor(latest);
const categoryIdBySourceId = new Map();
if (categoryRecords.length) {
  const { data: existing, error: existingError } = await db.from("news_categories").select("id, slug").in("slug", categoryRecords.map((category) => category.slug));
  if (existingError) throw existingError;
  const existingIdBySlug = new Map((existing || []).map((category) => [category.slug, category.id]));
  const newCategories = categoryRecords.filter((category) => !existingIdBySlug.has(category.slug));
  const { error } = await db.from("news_categories").upsert(newCategories.map(({ sourceId, ...category }) => category), { onConflict: "id" });
  if (error) throw error;
  for (const category of categoryRecords) categoryIdBySourceId.set(category.sourceId, existingIdBySlug.get(category.slug) || category.id);
}

for (const post of latest) {
  const { englishMedia, arabicMedia } = mediaForPost.get(post.id);
  const cover = englishMedia || arabicMedia;
  if (!cover) throw new Error(`No cover image was found for ${post.slug}.`);
  const { error: mediaError } = await db.from("media_assets").upsert({
    id: uuid(`wix-news-media:${cover.mediaKey}`), storage_provider: "r2", storage_key: cover.objectKey,
    public_url: cover.publicUrl, original_name: cover.localName, mime_type: mimeType(cover.localName), size_bytes: cover.size,
    folder: "news", width: cover.width || null, height: cover.height || null, alt_text: post.title, source_url: cover.sourceUrl,
  }, { onConflict: "storage_key" });
  if (mediaError) throw mediaError;

  const publishedAt = (post.firstPublishedDate || post.lastPublishedDate || new Date().toISOString()).slice(0, 10);
  const article = {
    id: post.id, slug: post.slug, status: "published", lifecycle: "active", deleted_at: null,
    cover_media_id: uuid(`wix-news-media:${cover.mediaKey}`), published_at: `${publishedAt}T00:00:00Z`,
  };
  const { error: articleError } = await db.from("news_articles").upsert(article, { onConflict: "id" });
  if (articleError) throw articleError;

  const englishRich = rewriteRichMedia(post.richContent, englishMedia);
  const englishText = post.contentText || post.excerpt || "";
  const arabic = post.translations?.arabic;
  const arabicBody = htmlBody(arabic?.body || englishText, arabicMedia);
  const frenchBody = htmlBody(englishText, englishMedia);
  const translations = [
    { article_id: post.id, locale: "en", title: post.title, excerpt: post.excerpt || englishText.slice(0, 220), body: { contentText: englishText, richContent: englishRich, rawPost: post.rawPost, article: articleMeta(post, cover, publishedAt) } },
    { article_id: post.id, locale: "ar", title: arabic?.title || post.title, excerpt: arabic?.excerpt || "", body: { html: arabicBody } },
    { article_id: post.id, locale: "fr", title: post.title, excerpt: post.excerpt || englishText.slice(0, 220), body: { html: frenchBody } },
  ];
  const { error: translationError } = await db.from("news_translations").upsert(translations, { onConflict: "article_id,locale" });
  if (translationError) throw translationError;

  const links = (post.categoryIds || []).flatMap((sourceId) => {
    const categoryId = categoryIdBySourceId.get(sourceId);
    return categoryId ? [{ article_id: post.id, category_id: categoryId }] : [];
  });
  const { error: deleteError } = await db.from("news_article_categories").delete().eq("article_id", post.id);
  if (deleteError) throw deleteError;
  if (links.length) {
    const { error: linkError } = await db.from("news_article_categories").upsert(links, { onConflict: "article_id,category_id" });
    if (linkError) throw linkError;
  }
  console.log(`Published ${post.slug}`);
}

console.log(`Published ${latest.length} Wix articles with English, Arabic, and French versions.`);

async function cacheImage(image, alt) {
  if (!image?.id || !image?.url) return null;
  const mediaKey = image.id;
  const localName = safeName(mediaKey);
  const destination = path.join(outputDir, localName);
  let size = 0;
  try { size = (await stat(destination)).size; } catch {
    const response = await fetch(image.url);
    if (!response.ok) throw new Error(`Could not download ${image.url}: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(destination, buffer);
    size = buffer.length;
  }
  const objectKey = `images/wix-blog/originals/${localName}`;
  await r2.send(new PutObjectCommand({ Bucket: env.CLOUDFLARE_R2_BUCKET, Key: objectKey, Body: await readFile(destination), ContentType: mimeType(localName), CacheControl: "public, max-age=31536000, immutable" }));
  const record = { source: mediaKey, mediaKey, sourceUrl: image.url, locations: ["latest-wix-news-import"], localName, status: "uploaded", width: image.width, height: image.height, size, objectKey, publicUrl: `${publicBase}/${objectKey}`, alt };
  mediaByKey.set(mediaKey, record);
  return record;
}

function findArabicSource(id) { return merged.posts.find((post) => post.id === id); }
function rewriteRichMedia(content, image) {
  const copy = structuredClone(content || { nodes: [] });
  if (!copy.nodes?.length) copy.nodes = [];
  if (image && !copy.nodes.some((node) => node.type === "IMAGE")) copy.nodes.push({ type: "IMAGE", imageData: { image: { src: { id: image.mediaKey }, width: image.width, height: image.height } } });
  return copy;
}
function htmlBody(text, image) {
  const paragraphs = String(text || "").split(/\n{2,}/).filter(Boolean).map((line) => `<p>${escape(line).replace(/\r?\n/g, "<br>")}</p>`).join("");
  return `${paragraphs}${image ? `<img src="${escape(image.publicUrl)}" alt="" />` : ""}`;
}
function articleMeta(post, image, date) {
  return { dateLabel: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`)), minutesToRead: Math.max(1, Math.ceil((post.contentText || post.excerpt || "").split(/\s+/).filter(Boolean).length / 200)), image: image.publicUrl, imageAlt: post.title, imageWidth: image.width || 1200, imageHeight: image.height || 675, tagIds: post.tagIds || [], hashtags: post.hashtags || [] };
}
function categoryRecordsFor(posts) {
  const source = categories.categories || categories.records || [];
  const byId = new Map(source.map((item) => [item.id || item._id, item]));
  return [...new Set(posts.flatMap((post) => post.categoryIds || []))].map((id) => {
    const item = byId.get(id); const name = item?.label || item?.title || "ArLAR";
    return { sourceId: id, id: uuid(`wix-news-category:${id}`), slug: slugify(name), name };
  });
}
function uuid(value) { const chars = createHash("sha1").update(value).digest("hex").slice(0, 32).split(""); chars[12] = "5"; chars[16] = ((Number.parseInt(chars[16], 16) & 0x3) | 0x8).toString(16); const hex = chars.join(""); return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`; }
function safeName(value) { return value.replace(/[^a-zA-Z0-9._-]/g, "_"); }
function mimeType(name) { const extension = path.extname(name).toLowerCase(); return extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : extension === ".gif" ? "image/gif" : "image/jpeg"; }
function slugify(value) { return String(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "arlar"; }
function escape(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
async function parseOptionalEnv(filePath) { try { return Object.fromEntries(Object.entries(parseEnv(await readFile(filePath, "utf8"))).filter(([, value]) => value !== "[SENSITIVE]")); } catch (error) { if (error && typeof error === "object" && error.code === "ENOENT") return {}; throw error; } }
function parseEnv(source) { return Object.fromEntries(source.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#") && line.includes("=")).map((line) => { const index = line.indexOf("="); return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")]; })); }
