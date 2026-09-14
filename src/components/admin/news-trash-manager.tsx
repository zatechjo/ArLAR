"use client";

import { Loader2, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteNewsPermanentlyAction,
  restoreNewsAction,
} from "@/app/(admin)/admin/(panel)/news/actions";
import { DeleteConfirmDialog, TrashIcon } from "@/components/admin/delete-confirm-dialog";

export type TrashedNewsItem = {
  id: string;
  slug: string;
  title: string;
  image: string;
  dateLabel: string;
  deletedLabel: string;
  published: boolean;
};

export function NewsTrashManager({ items }: { items: TrashedNewsItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<TrashedNewsItem | null>(null);

  function restore(id: string) {
    startTransition(async () => {
      await restoreNewsAction(id);
      router.refresh();
    });
  }

  function permanentlyDelete(item: TrashedNewsItem) {
    startTransition(async () => {
      await deleteNewsPermanentlyAction(item.id);
      setDeleting(null);
      router.refresh();
    });
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-500"><TrashIcon className="size-5" /></span>
        <p className="mt-4 text-sm font-semibold text-slate-700">Trash is empty</p>
        <p className="mt-1 text-sm text-slate-500">News moved here can be restored before it is deleted permanently.</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 ${isPending ? "pointer-events-none select-none blur-[2px] opacity-55" : ""}`} aria-busy={isPending}>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Post</th>
                <th className="w-40 px-4 py-3">Deleted</th>
                <th className="w-32 px-4 py-3">Previous status</th>
                <th className="w-52 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Image src={item.image} alt="" width={56} height={40} className="h-10 w-14 shrink-0 rounded-md object-cover grayscale-[20%]" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">{item.title}</p>
                        <p className="truncate text-xs text-slate-400">/{item.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.deletedLabel}</td>
                  <td className="px-4 py-3 text-slate-500">{item.published ? "Published" : "Draft"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" disabled={isPending} onClick={() => restore(item.id)} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-jade-300 hover:text-jade-700 disabled:opacity-50"><RotateCcw size={13} />Restore</button>
                      <button type="button" disabled={isPending} onClick={() => setDeleting(item)} aria-label={`Delete ${item.title} permanently`} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700 disabled:opacity-50"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        {isPending ? (
          <div className="absolute inset-0 z-10 grid place-items-center" role="status" aria-live="polite">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg">
              <Loader2 className="size-4 animate-spin text-crimson-600" />
              Updating trash…
            </span>
          </div>
        ) : null}
      </div>

      <DeleteConfirmDialog open={Boolean(deleting)} title={deleting?.title || "this post"} mode="permanent" description="This permanently removes the post from the admin workspace. This action cannot be undone." onClose={() => setDeleting(null)} onConfirm={() => deleting && permanentlyDelete(deleting)} />
    </>
  );
}
