"use server";

import { revalidatePath, updateTag } from "next/cache";
import {
  createNewsArticleIdAsync,
  createNewsArticleSlugAsync,
  getAdminNewsArticleAsync,
  listAdminNewsCategoriesAsync,
  listTrashedNewsArticlesAsync,
  moveNewsArticleToTrashAsync,
  permanentlyDeleteNewsArticleAsync,
  restoreNewsArticleAsync,
  setNewsArticlePublishedAsync,
  saveNewsArticleAsync,
} from "@/lib/admin-news-repository";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { redirect } from "next/navigation";
import type { NewsArticle } from "@/data/news";
import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";
import { revalidateLocalizedPaths, revalidatePublicSitemap } from "@/lib/public-revalidation";

function revalidateNewsAdmin() {
  revalidatePath("/admin/news");
  revalidatePath("/admin/news/trash");
}

function revalidatePublishedNews(slug: string) {
  updateTag("public-news");
  revalidateLocalizedPaths(["/", "/news", `/news/${slug}`]);
  revalidatePublicSitemap();
}

export async function trashNewsAction(id: string) {
  const actor = await requireAdminPermission("news");
  const article = await getAdminNewsArticleAsync(id);
  await moveNewsArticleToTrashAsync(id);
  await recordAdminAuditLogAsync({ module: "news", action: "News moved to trash", entityType: "news-article", entityId: id, targetLabel: id, detail: "Article moved to trash.", actorEmail: actor.email });
  revalidateNewsAdmin();
  if (article?.published) revalidatePublishedNews(article.slug);
}

export async function restoreNewsAction(id: string) {
  const actor = await requireAdminPermission("news");
  const article = (await listTrashedNewsArticlesAsync()).find((candidate) => candidate.id === id);
  await restoreNewsArticleAsync(id);
  await recordAdminAuditLogAsync({ module: "news", action: "News restored", entityType: "news-article", entityId: id, targetLabel: id, detail: "Article restored from trash.", actorEmail: actor.email });
  revalidateNewsAdmin();
  if (article?.published) revalidatePublishedNews(article.slug);
}

export async function deleteNewsPermanentlyAction(id: string) {
  const actor = await requireAdminPermission("news");
  const article = (await listTrashedNewsArticlesAsync()).find((candidate) => candidate.id === id);
  await permanentlyDeleteNewsArticleAsync(id);
  await recordAdminAuditLogAsync({ module: "news", action: "News permanently deleted", entityType: "news-article", entityId: id, targetLabel: id, detail: "Article permanently removed.", actorEmail: actor.email });
  revalidateNewsAdmin();
  if (article?.published) revalidatePublishedNews(article.slug);
}

export async function setNewsPublishedAction(id: string, published: boolean) {
  const actor = await requireAdminPermission("news");
  const article = await getAdminNewsArticleAsync(id);
  await setNewsArticlePublishedAsync(id, published);
  await recordAdminAuditLogAsync({ module: "news", action: published ? "News published" : "News unpublished", entityType: "news-article", entityId: id, targetLabel: id, detail: published ? "Article made public." : "Article returned to draft.", actorEmail: actor.email });
  revalidateNewsAdmin();
  if (article) revalidatePublishedNews(article.slug);
}

export async function saveNewsArticleAction(formData: FormData) {
  const actor = await requireAdminPermission("news");
  const title = required(formData, "title_en");
  const existingId = text(formData, "id");
  const existing = existingId ? await getAdminNewsArticleAsync(existingId) : undefined;
  const id = existing?.id || await createNewsArticleIdAsync(title);
  const slug = existing?.slug || await createNewsArticleSlugAsync(title);
  const richContent = richDocument(formData.get("body_en_json"), text(formData, "body_en"));
  const contentText = documentText(richContent);
  const publishedAt = text(formData, "published_at") || new Date().toISOString().slice(0, 10);
  const image = text(formData, "cover_image_url") || existing?.image || "/images/about-hero-lab-alt.jpg";
  const selectedCategoryIds = [...new Set(formData.getAll("category_ids").map(String))];
  const categoryById = new Map((await listAdminNewsCategoriesAsync()).map((category) => [category.id, category.name]));
  const selectedCategories = selectedCategoryIds.flatMap((id) => {
    const name = categoryById.get(id);
    return name ? [{ id, name }] : [];
  });
  const article: NewsArticle = {
    id, slug, title, excerpt: contentText.slice(0, 220), publishedAt,
    dateLabel: formatDate(publishedAt), minutesToRead: Math.max(1, Math.ceil(contentText.split(/\s+/).filter(Boolean).length / 200)),
    image, imageAlt: title, imageWidth: existing?.imageWidth || 1200, imageHeight: existing?.imageHeight || 675,
    categories: selectedCategories.map((category) => category.name), categoryIds: selectedCategories.map((category) => category.id), tagIds: existing?.tagIds || [], hashtags: existing?.hashtags || [],
    contentText, richContent, rawPost: existing?.rawPost || null,
  };
  const saveIntent = text(formData, "save_intent");
  const mode = saveIntent === "publish" ? "publish" : "save";
  await saveNewsArticleAsync(article, {
    mode,
    arabic: { title: text(formData, "title_ar"), body: text(formData, "body_ar") },
    french: { title: text(formData, "title_fr"), body: text(formData, "body_fr") },
  });
  const savedState = mode === "publish" ? "Published" : existing?.published ? "Unpublished changes" : "Draft";
  await recordAdminAuditLogAsync({ module: "news", action: existing ? "News article saved" : "News article created", entityType: "news-article", entityId: article.id, targetLabel: article.title, detail: `${savedState} article saved with English, Arabic, and French fields.`, actorEmail: actor.email });
  revalidateNewsAdmin();
  if (mode === "publish") revalidatePublishedNews(article.slug);
  const result = mode === "publish" ? "published" : "saved";
  redirect(`/admin/news?result=${result}&slug=${encodeURIComponent(article.slug)}`);
}

type EditorNode = { type?: string; text?: string; attrs?: Record<string, unknown>; marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>; content?: EditorNode[] };
function richDocument(value: FormDataEntryValue | null, htmlFallback: string) {
  try { const parsed = JSON.parse(String(value || "")) as EditorNode; if (parsed?.type === "doc") return { nodes: (parsed.content || []).flatMap(convertNode) }; } catch { /* use text fallback */ }
  const plain = htmlFallback.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { nodes: plain ? [{ type: "PARAGRAPH", nodes: [{ type: "TEXT", textData: { text: plain, decorations: [] } }] }] : [] };
}
function convertNode(node: EditorNode): unknown[] {
  if (node.type === "paragraph") return [{ type: "PARAGRAPH", nodes: inlineNodes(node.content), paragraphData: { textStyle: { textAlignment: String(node.attrs?.textAlign || "") } } }];
  if (node.type === "heading") return [{ type: "HEADING", nodes: inlineNodes(node.content), headingData: { level: Number(node.attrs?.level || 2), textStyle: { textAlignment: String(node.attrs?.textAlign || "") } } }];
  if (node.type === "image") return [{ type: "IMAGE", imageData: { image: { src: { id: String(node.attrs?.src || "") }, altText: String(node.attrs?.alt || "") } } }];
  if (node.type === "hardBreak") return [{ type: "PARAGRAPH", nodes: [] }];
  if (node.type === "bulletList" || node.type === "orderedList") return (node.content || []).flatMap((item, index) => { const label = node.type === "orderedList" ? `${index + 1}. ` : "• "; const children = (item.content || []).flatMap((child) => child.type === "paragraph" ? [{ type: "PARAGRAPH", nodes: [{ type: "TEXT", textData: { text: label, decorations: [] } }, ...inlineNodes(child.content)] }] : convertNode(child)); return children; });
  if (node.type === "blockquote") return (node.content || []).flatMap(convertNode);
  return (node.content || []).flatMap(convertNode);
}
function inlineNodes(nodes: EditorNode[] = []) { return nodes.flatMap((node) => { if (node.type === "hardBreak") return [{ type: "TEXT", textData: { text: "\n", decorations: [] } }]; if (node.type !== "text") return []; const decorations = (node.marks || []).flatMap((mark) => { if (mark.type === "bold") return [{ type: "BOLD" }]; if (mark.type === "italic") return [{ type: "ITALIC" }]; if (mark.type === "underline") return [{ type: "UNDERLINE" }]; if (mark.type === "link") return [{ type: "LINK", linkData: { link: { url: String(mark.attrs?.href || "") } } }]; return []; }); return [{ type: "TEXT", textData: { text: node.text || "", decorations } }]; }); }
function documentText(document: { nodes: unknown[] }) { const pieces: string[] = []; const visit = (value: unknown) => { if (!value || typeof value !== "object") return; const node = value as { textData?: { text?: string }; nodes?: unknown[] }; if (node.textData?.text) pieces.push(node.textData.text); node.nodes?.forEach(visit); }; document.nodes.forEach(visit); return pieces.join(" ").replace(/\s+/g, " ").trim(); }
function text(formData: FormData, name: string) { return String(formData.get(name) || "").trim(); }
function required(formData: FormData, name: string) { const value = text(formData, name); if (!value) throw new Error("Enter the English post title before saving."); return value; }
function formatDate(value: string) { const date = new Date(`${value}T00:00:00Z`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date); }
