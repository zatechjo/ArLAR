"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState, useTransition } from "react";

import { deleteAdminRecordAction } from "@/app/(admin)/admin/(panel)/actions";
import { setSigOrderAction, setSigVisibilityAction } from "@/app/(admin)/admin/(panel)/sigs/actions";
import { AdminSearchField, StatusPill } from "@/components/admin/admin-ui";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";

export type AdminSigDirectoryItem = {
  slug: string;
  name: string;
  abbreviation: string;
  logo: string;
  visible: boolean;
  people: number;
};

export function SigDirectoryManager({ initialItems }: { initialItems: AdminSigDirectoryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<AdminSigDirectoryItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const visibleItems = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return items.filter((item) => !needle || `${item.name} ${item.abbreviation}`.toLowerCase().includes(needle));
  }, [deferredQuery, items]);

  function toggleVisibility(item: AdminSigDirectoryItem) {
    const visible = !item.visible;
    setItems((current) => current.map((candidate) => candidate.slug === item.slug ? { ...candidate, visible } : candidate));
    startTransition(async () => { await setSigVisibilityAction(item.slug, visible); });
  }

  function move(slug: string, direction: -1 | 1) {
    const currentIndex = items.findIndex((item) => item.slug === slug);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
    setItems(next);
    startTransition(async () => { await setSigOrderAction(next.map((item) => item.slug)); });
  }

  function moveToRecycleBin(item: AdminSigDirectoryItem) {
    setItems((current) => current.filter((candidate) => candidate.slug !== item.slug));
    startTransition(async () => { await deleteAdminRecordAction("sigs", item.slug); });
  }

  return (
    <>
      <div className="rounded-2xl border border-[#e1e5e9] bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdminSearchField value={query} onChange={setQuery} placeholder="Search groups or abbreviations…" />
          <span className="shrink-0 text-xs font-semibold text-ink-500">{visibleItems.length} of {items.length} groups</span>
        </div>
      </div>

      <div className="relative mt-4">
      <div className={`overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white transition duration-200 ${isPending ? "pointer-events-none select-none blur-[2px] opacity-55" : ""}`} aria-busy={isPending}>
        <div className="hidden grid-cols-[96px_minmax(0,1fr)_130px_130px_140px] gap-4 border-b border-[#e5e8eb] bg-[#fafbfb] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400 lg:grid">
          <span>Order</span><span>Group</span><span>Short name</span><span>Visibility</span><span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-[#edf0f2]">
          {visibleItems.map((item) => {
            const absoluteIndex = items.findIndex((candidate) => candidate.slug === item.slug);
            return (
              <article key={item.slug} className="group relative grid gap-4 px-4 py-4 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center lg:grid-cols-[96px_minmax(0,1fr)_130px_130px_140px] lg:px-5">
                <Link href={`/admin/sigs/${item.slug}`} aria-label={`Manage ${item.name}`} className="absolute inset-0 z-0" />
                <div className="relative z-10 flex gap-1 pointer-events-none">
                  <button type="button" disabled={isPending || absoluteIndex === 0} onClick={() => move(item.slug, -1)} aria-label={`Move ${item.name} up`} className="pointer-events-auto grid size-8 place-items-center rounded-lg border border-ink-200 text-ink-500 transition hover:border-jade-300 hover:bg-jade-50 hover:text-jade-800 disabled:opacity-30"><ArrowUp size={13} /></button>
                  <button type="button" disabled={isPending || absoluteIndex === items.length - 1} onClick={() => move(item.slug, 1)} aria-label={`Move ${item.name} down`} className="pointer-events-auto grid size-8 place-items-center rounded-lg border border-ink-200 text-ink-500 transition hover:border-jade-300 hover:bg-jade-50 hover:text-jade-800 disabled:opacity-30"><ArrowDown size={13} /></button>
                </div>
                <div className="pointer-events-none relative z-10 flex min-w-0 items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-ink-50"><Image src={item.logo} alt="" fill sizes="56px" className="object-contain p-1.5" /></div>
                  <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-ink-950 group-hover:text-crimson-700">{item.name}</h2><p className="mt-1 text-[11px] text-ink-400">{item.people} linked {item.people === 1 ? "person" : "people"}</p></div>
                </div>
                <span className="pointer-events-none relative z-10 w-fit rounded-lg bg-ink-50 px-2.5 py-1.5 text-xs font-semibold text-ink-700">{item.abbreviation}</span>
                <button type="button" disabled={isPending} onClick={() => toggleVisibility(item)} className="relative z-10 w-fit" aria-label={`${item.visible ? "Hide" : "Show"} ${item.name}`}><StatusPill tone={item.visible ? "green" : "neutral"}>{item.visible ? "Public" : "Hidden"}</StatusPill></button>
                <div className="relative z-10 flex justify-end gap-1.5">
                  <Link href={`/admin/sigs/${item.slug}`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#071421] px-3 text-xs font-semibold text-white transition hover:bg-[#142535]"><Pencil size={13} />Edit</Link>
                  <a href={`/special-interest-groups/${item.slug}`} target="_blank" aria-label={`Open ${item.name} public page`} className="grid size-9 place-items-center rounded-lg border border-ink-200 text-ink-400 transition hover:border-jade-300 hover:bg-jade-50 hover:text-jade-700"><Eye size={14} /></a>
                  <button type="button" onClick={() => setDeleting(item)} aria-label={`Move ${item.name} to trash`} className="grid size-9 place-items-center rounded-lg border border-ink-200 text-ink-400 transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700"><Trash2 size={14} /></button>
                </div>
              </article>
            );
          })}
          {visibleItems.length === 0 ? <div className="px-6 py-16 text-center"><EyeOff className="mx-auto size-6 text-ink-300" /><p className="mt-3 text-sm font-semibold text-ink-700">No SIGs match this search</p></div> : null}
        </div>
      </div>
      <AdminPendingOverlay visible={isPending} label="Updating groups…" />
      </div>

      <DeleteConfirmDialog open={Boolean(deleting)} title={deleting?.name || "this group"} onClose={() => setDeleting(null)} onConfirm={() => deleting && moveToRecycleBin(deleting)} />
    </>
  );
}
