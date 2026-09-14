import { NewsComposer } from "@/components/admin/news-composer";
import { NewsEditorActions } from "@/components/admin/news-editor-actions";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";
import { saveNewsArticleAction } from "@/app/(admin)/admin/(panel)/news/actions";
import { listAdminNewsCategoriesAsync } from "@/lib/admin-news-repository";

export default async function NewNewsPage() { const [media, categories] = await Promise.all([getAdminMediaLibraryAsync(), listAdminNewsCategoriesAsync()]); return <><div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-6 sm:px-8"><div><h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Create post</h1><p className="mt-1 text-sm text-slate-500">Add a news article</p></div><NewsEditorActions /></div><div className="px-5 py-6 sm:px-8"><NewsComposer action={saveNewsArticleAction} media={media} categories={categories} /></div></>; }
