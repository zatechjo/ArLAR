"use client";

import { CheckCircle2, Copy, ExternalLink, Loader2, Pencil, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { AdminSearchField, AdminSelect, StatusPill } from "@/components/admin/admin-ui";
import { DeleteConfirmDialog, TrashIcon } from "@/components/admin/delete-confirm-dialog";
import { setNewsPublishedAction, trashNewsAction } from "@/app/(admin)/admin/(panel)/news/actions";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

export type AdminNewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateLabel: string;
  image: string;
  categories: string[];
  featured: boolean;
  published: boolean;
  hasUnpublishedChanges: boolean;
};

type NewsSaveResult = { kind: "published" | "saved"; item: AdminNewsItem };

export function NewsManager({ items, saveResult }: { items: AdminNewsItem[]; saveResult?: NewsSaveResult }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<AdminNewsItem | null>(null);
  const [publishedIds, setPublishedIds] = useState(() => new Set(items.filter((item) => item.published).map((item) => item.id)));
  const [saveNotice, setSaveNotice] = useState(saveResult);
  const [copied, setCopied] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const saveNoticeModalRef = useModalAccessibility<HTMLElement>({ open: Boolean(saveNotice), onClose: dismissSaveNotice });
  const visible = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const published = publishedIds.has(item.id);
      const matchesQuery = !needle || `${item.title} ${item.excerpt} ${item.categories.join(" ")}`.toLowerCase().includes(needle);
      const matchesStatus = status === "all"
        || (status === "featured" && item.featured)
        || (status === "published" && published)
        || (status === "draft" && !published)
        || (status === "changes" && item.hasUnpublishedChanges);
      return matchesQuery && matchesStatus;
    });
    return filtered.toSorted((a, b) => {
      // Keep unpublished work visible at the top of the newsroom regardless
      // of the selected secondary sort, so drafts are never buried beneath
      // the public archive.
      const aHasPendingWork = !publishedIds.has(a.id) || a.hasUnpublishedChanges;
      const bHasPendingWork = !publishedIds.has(b.id) || b.hasUnpublishedChanges;
      if (aHasPendingWork !== bHasPendingWork) return aHasPendingWork ? -1 : 1;
      if (sort === "oldest") return a.date.localeCompare(b.date);
      if (sort === "title") return a.title.localeCompare(b.title);
      return b.date.localeCompare(a.date);
    });
  }, [deferredQuery, items, publishedIds, sort, status]);
  const pageSize = 15;
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const pageItems = visible.slice((page - 1) * pageSize, page * pageSize);

  function togglePublished(id: string) {
    const nextPublished = !publishedIds.has(id);
    setPublishedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    startTransition(async () => {
      await setNewsPublishedAction(id, nextPublished);
      router.refresh();
    });
  }

  function moveToTrash(item: AdminNewsItem) {
    startTransition(async () => {
      await trashNewsAction(item.id);
      setDeleting(null);
      router.refresh();
    });
  }

  function dismissSaveNotice() {
    setSaveNotice(undefined);
    router.replace("/admin/news", { scroll: false });
  }

  async function copyPublishedUrl() {
    if (!saveNotice) return;
    await navigator.clipboard.writeText(`${window.location.origin}/news/${encodeURIComponent(saveNotice.item.slug)}`);
    setCopied(true);
  }

  return (
    <div>
      {saveNotice ? (
        <div className="fixed inset-0 z-[150] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) dismissSaveNotice(); }}>
          <section ref={saveNoticeModalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="news-save-title" className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button type="button" onClick={dismissSaveNotice} aria-label="Close success message" className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={17} /></button>
            <span className="grid size-11 place-items-center rounded-xl bg-jade-50 text-jade-700"><CheckCircle2 size={23} /></span>
            <h2 id="news-save-title" className="mt-4 text-xl font-bold tracking-tight text-slate-950">{saveNotice.kind === "published" ? "News published" : saveNotice.item.published ? "Unpublished changes saved" : "Draft saved"}</h2>
            <p className="mt-2 pr-6 text-sm leading-6 text-slate-500"><strong className="font-semibold text-slate-800">{saveNotice.item.title}</strong> {saveNotice.kind === "published" ? "is now live on the website." : saveNotice.item.published ? "remains live with its previous version until you publish these changes." : "was saved successfully."}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {saveNotice.kind === "published" ? <a href={`/news/${encodeURIComponent(saveNotice.item.slug)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-crimson-600 px-4 text-sm font-semibold text-white transition hover:bg-crimson-700"><ExternalLink size={15} />View on website</a> : null}
              {saveNotice.kind === "published" ? <button type="button" onClick={copyPublishedUrl} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-jade-300 hover:text-jade-700"><Copy size={15} />{copied ? "URL copied" : "Copy URL"}</button> : <button type="button" onClick={dismissSaveNotice} className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">Done</button>}
            </div>
          </section>
        </div>
      ) : null}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <AdminSearchField value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search posts, categories, or article text..." />
        <div className="flex gap-2">
          <AdminSelect label="Status" value={status} onChange={(value) => { setStatus(value); setPage(1); }}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="changes">Unpublished changes</option>
            <option value="featured">Featured</option>
          </AdminSelect>
          <AdminSelect label="Sort" value={sort} onChange={(value) => { setSort(value); setPage(1); }}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </AdminSelect>
        </div>
      </div>

      <div className="relative">
        <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 ${isPending ? "pointer-events-none select-none blur-[2px] opacity-55" : ""}`} aria-busy={isPending}>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Post</th>
                <th className="w-44 whitespace-nowrap px-4 py-3">Date</th>
                <th className="w-36 px-4 py-3">Status</th>
                <th className="w-[250px] px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.map((item) => {
                const published = publishedIds.has(item.id);
                return (
                  <tr key={item.id} className={`transition ${published ? "hover:bg-slate-50/60" : "bg-amber-50/35 hover:bg-amber-50/60"}`}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/news/${encodeURIComponent(item.slug)}`} className="group flex min-w-0 items-center gap-3">
                        <Image src={item.image} alt="" width={56} height={40} className="h-10 w-14 shrink-0 rounded-md object-cover" />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate font-semibold text-slate-800 group-hover:text-crimson-700">
                            {item.featured ? <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" /> : null}
                            <span className="truncate">{item.title}</span>
                          </p>
                          <p className="truncate text-xs text-slate-400">/{item.slug}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{item.dateLabel || "Not dated"}</td>
                    <td className="px-4 py-3"><div className="flex flex-col items-start gap-1.5"><StatusPill tone={published ? "green" : "amber"}>{published ? "Published" : "Draft"}</StatusPill>{item.hasUnpublishedChanges ? <StatusPill tone="amber">Unpublished changes</StatusPill> : null}</div></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" disabled={isPending} onClick={() => togglePublished(item.id)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-crimson-300 hover:text-crimson-700 disabled:opacity-50">{published ? "Unpublish" : "Publish"}</button>
                        <Link href={`/admin/news/${encodeURIComponent(item.slug)}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#071421] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#142535]"><Pencil size={13} />Edit</Link>
                        <button type="button" disabled={isPending} onClick={() => setDeleting(item)} aria-label={`Move ${item.title} to trash`} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700 disabled:opacity-50"><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          <Pagination page={page} count={pageCount} setPage={setPage} />
        </div>
        {isPending ? (
          <div className="absolute inset-0 z-10 grid place-items-center" role="status" aria-live="polite">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg">
              <Loader2 className="size-4 animate-spin text-crimson-600" />
              Updating news…
            </span>
          </div>
        ) : null}
      </div>
      <DeleteConfirmDialog open={Boolean(deleting)} title={deleting?.title || "this post"} heading={`Move ${deleting?.title || "this post"} to trash?`} description="The post will leave the public website immediately. You can restore it from Trash." confirmLabel="Move to trash" onClose={() => setDeleting(null)} onConfirm={() => deleting && moveToTrash(deleting)} />
    </div>
  );
}

function Pagination({ page, count, setPage }: { page: number; count: number; setPage: (value: number | ((value: number) => number)) => void }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
      <p className="text-xs text-slate-400">Page {page} of {count}</p>
      <div className="flex gap-2">
        <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-35">Previous</button>
        <button type="button" disabled={page === count} onClick={() => setPage((value) => Math.min(count, value + 1))} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-35">Next</button>
      </div>
    </div>
  );
}
