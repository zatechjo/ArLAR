"use client";

import { Loader2, RotateCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";

import {
  permanentlyDeleteAdminRecordAction,
  restoreAdminRecordAction,
} from "@/app/(admin)/admin/(panel)/actions";
import { AdminSearchField } from "@/components/admin/admin-ui";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import type { AdminDeletionScope } from "@/lib/admin-deletion-repository";
import type { AdminTrashItem } from "@/lib/admin-trash-catalog";

export function RecycleBinManager({ scope, initialItems }: { scope: AdminDeletionScope; initialItems: AdminTrashItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [permanentTarget, setPermanentTarget] = useState<AdminTrashItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const items = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    const hidden = new Set(hiddenIds);
    return initialItems.filter((item) => !hidden.has(item.id) && (!needle || `${item.title} ${item.subtitle} ${item.typeLabel}`.toLowerCase().includes(needle)));
  }, [deferredQuery, hiddenIds, initialItems]);

  function restore(item: AdminTrashItem) {
    setHiddenIds((current) => [...current, item.id]);
    startTransition(async () => {
      await restoreAdminRecordAction(scope, item.id);
      router.refresh();
    });
  }

  function permanentlyDelete(item: AdminTrashItem) {
    setHiddenIds((current) => [...current, item.id]);
    startTransition(async () => {
      await permanentlyDeleteAdminRecordAction(scope, item.id);
      router.refresh();
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-[#e1e5e9] bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdminSearchField value={query} onChange={setQuery} placeholder="Search deleted records…" />
          <span className="shrink-0 text-xs font-semibold text-ink-500">{items.length} deleted {items.length === 1 ? "record" : "records"}</span>
        </div>
      </div>

      <div className="relative mt-4">
      <div className={`overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white transition duration-200 ${isPending ? "pointer-events-none select-none blur-[2px] opacity-55" : ""}`} aria-busy={isPending}>
        <div className="hidden grid-cols-[64px_minmax(0,1fr)_160px_150px_150px] gap-4 border-b border-[#e5e8eb] bg-[#fafbfb] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400 lg:grid">
          <span>Media</span><span>Record</span><span>Type</span><span>Deleted</span><span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-[#edf0f2]">
          {items.map((item) => (
            <article key={item.id} className="grid gap-4 px-4 py-4 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center lg:grid-cols-[64px_minmax(0,1fr)_160px_150px_150px] lg:px-5">
              <div className="relative size-14 overflow-hidden rounded-xl bg-ink-50">
                {item.image ? <Image src={item.image} alt="" fill sizes="56px" className="object-cover" /> : <span className="grid h-full place-items-center text-xs font-bold text-ink-300">{item.title.slice(0, 2)}</span>}
              </div>
              <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-ink-950">{item.title}</h2><p className="mt-1 truncate text-[11px] text-ink-400">{item.subtitle}</p></div>
              <span className="w-fit rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1 text-[10px] font-semibold text-ink-600">{item.typeLabel}</span>
              <time dateTime={item.deletedAt} className="text-xs text-ink-500">{formatDeletedDate(item.deletedAt)}</time>
              <div className="flex justify-end gap-1.5">
                <button type="button" disabled={isPending} onClick={() => restore(item)} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-700 transition hover:border-jade-300 hover:bg-jade-50 hover:text-jade-800 disabled:opacity-45"><RotateCcw size={13} />Restore</button>
                <button type="button" disabled={isPending} onClick={() => setPermanentTarget(item)} aria-label={`Delete ${item.title} permanently`} className="grid size-9 place-items-center rounded-lg border border-ink-200 text-ink-400 transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700 disabled:opacity-45"><Trash2 size={14} /></button>
              </div>
            </article>
          ))}
          {items.length === 0 ? <div className="px-6 py-20 text-center"><p className="text-sm font-semibold text-ink-700">Trash is empty</p><p className="mt-2 text-xs text-ink-400">Deleted records from this section will appear here.</p></div> : null}
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

      <DeleteConfirmDialog
        open={Boolean(permanentTarget)}
        mode="permanent"
        title={permanentTarget?.title || "this record"}
        heading="Delete permanently?"
        description="This record will be removed from Trash and cannot be restored."
        confirmLabel={isPending ? "Deleting…" : "Delete permanently"}
        cancelLabel="Keep in Trash"
        onClose={() => setPermanentTarget(null)}
        onConfirm={() => permanentTarget && permanentlyDelete(permanentTarget)}
      />
    </>
  );
}

function formatDeletedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}
