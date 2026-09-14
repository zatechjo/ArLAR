import Link from "next/link";

import { NewsTrashManager } from "@/components/admin/news-trash-manager";
import { ArrowLeft } from "lucide-react";
import { listTrashedNewsArticlesAsync } from "@/lib/admin-news-repository";

export default async function NewsTrashPage() {
  const deletedDateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Amman",
  });
  const items = (await listTrashedNewsArticlesAsync()).map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    image: article.image,
    dateLabel: article.dateLabel,
    deletedLabel: article.deletedAt ? deletedDateFormatter.format(new Date(article.deletedAt)) : "Recently",
    published: article.published,
  }));

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 bg-white px-5 py-6 sm:px-8">
        <div><h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Trash</h1><p className="mt-1 text-sm text-slate-500">{items.length} deleted {items.length === 1 ? "post" : "posts"} · restore or remove permanently</p></div>
        <Link href="/admin/news" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"><ArrowLeft size={16} />Back to news</Link>
      </header>
      <div className="px-5 py-6 sm:px-8">
        <NewsTrashManager items={items} />
      </div>
    </>
  );
}
