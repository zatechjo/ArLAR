import { notFound } from "next/navigation";
import { NewsComposer } from "@/components/admin/news-composer";
import { NewsEditorActions } from "@/components/admin/news-editor-actions";
import { getAdminNewsArticleAsync, listAdminNewsCategoriesAsync } from "@/lib/admin-news-repository";
import { newsRichContentToHtml } from "@/lib/news-editor-html";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";
import { getImportedArabicTranslation } from "@/lib/wix-blog-translations";
import { saveNewsArticleAction } from "@/app/(admin)/admin/(panel)/news/actions";

export default async function AdminNewsEditorPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { slug } = await params; const query = await searchParams; const article = await getAdminNewsArticleAsync(slug); if (!article) notFound();
  const [media, categories] = await Promise.all([getAdminMediaLibraryAsync(), listAdminNewsCategoriesAsync()]);
  const english = { title: article.title, body: newsRichContentToHtml(article.richContent, article.contentText) };
  const importedArabic = getImportedArabicTranslation(article.id, article.slug);
  const arabic = languageOrFallback(article.translations?.arabic, importedArabic ? { title: importedArabic.title, body: newsRichContentToHtml(importedArabic.richContent, importedArabic.body) } : undefined, english);
  const french = languageOrFallback(article.translations?.french, undefined, english);
  return <><NewsEditorHeader title="Edit post" subtitle="Update the article and translations." actions={<NewsEditorActions articleId={article.id} articleTitle={article.title} />} /><div className="px-5 py-6 sm:px-8">{query.saved === "1" ? <p className="mx-auto mb-5 max-w-6xl rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">News article saved.</p> : null}<NewsComposer action={saveNewsArticleAction} media={media} categories={categories} record={{ id: article.id, slug: article.slug, image: article.image, date: article.publishedAt, published: article.published, hasUnpublishedChanges: article.hasUnpublishedChanges, categoryIds: article.categoryIds, english, arabic, french }} /></div></>;
}

function languageOrFallback(primary: { title: string; body: string } | undefined, imported: { title: string; body: string } | undefined, english: { title: string; body: string }) {
  const candidate = primary?.title?.trim() || primary?.body?.trim() ? primary : imported;
  return {
    title: candidate?.title?.trim() ? candidate.title : english.title,
    body: candidate?.body?.trim() ? candidate.body : english.body,
  };
}

function NewsEditorHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions: React.ReactNode }) { return <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-6 sm:px-8"><div><h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>{actions}</div>; }
