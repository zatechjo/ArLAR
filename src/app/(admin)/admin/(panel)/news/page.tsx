import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { NewsManager } from "@/components/admin/news-manager";
import { listAdminNewsArticlesAsync } from "@/lib/admin-news-repository";

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const items = (await listAdminNewsArticlesAsync()).map((article, index) => ({ id: article.id, slug: article.slug, title: article.title, excerpt: article.excerpt, date: article.publishedAt, dateLabel: article.dateLabel, image: article.image, categories: article.categories, featured: index < 3, published: article.published, hasUnpublishedChanges: Boolean(article.hasUnpublishedChanges) }));
  const result = Array.isArray(query.result) ? query.result[0] : query.result;
  const savedSlug = Array.isArray(query.slug) ? query.slug[0] : query.slug;
  const savedItem = savedSlug ? items.find((item) => item.slug === savedSlug) : undefined;
  const saveResult = savedItem && (result === "published" || result === "saved") ? { kind: result, item: savedItem } as const : undefined;
  return <><header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 bg-white px-5 py-6 sm:px-8"><div><h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">News</h1><p className="mt-1 text-sm text-slate-500">{items.length} posts · manage the ArLAR blog</p></div><div className="flex flex-wrap items-center gap-2"><Link href="/admin/news/trash" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"><Trash2 size={16} />Trash</Link><Link href="/admin/news/new" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-crimson-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-crimson-700"><Plus size={16} />New post</Link></div></header><div className="px-5 py-6 sm:px-8"><NewsManager items={items} saveResult={saveResult} /></div></>;
}
