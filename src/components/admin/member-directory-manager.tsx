"use client";

import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState, useTransition } from "react";

import { deleteAdminRecordAction } from "@/app/(admin)/admin/(panel)/actions";
import { AdminSearchField } from "@/components/admin/admin-ui";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";

export type MemberDirectoryItem = {
  slug: string;
  country: string;
  countryCode: string;
  flagSrc: string;
  societies: number;
  websites: number;
  socialLinks: number;
};

export function MemberDirectoryManager({ initialItems }: { initialItems: MemberDirectoryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<MemberDirectoryItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return items.filter((item) => !needle || `${item.country} ${item.countryCode}`.toLowerCase().includes(needle));
  }, [deferredQuery, items]);

  function removeCountry(item: MemberDirectoryItem) {
    setItems((current) => current.filter((candidate) => candidate.slug !== item.slug));
    startTransition(async () => { await deleteAdminRecordAction("member-countries", item.slug); });
  }

  return (
    <>
      <div className="rounded-2xl border border-[#e1e5e9] bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdminSearchField value={query} onChange={setQuery} placeholder="Search countries or country codes…" />
          <span className="shrink-0 text-xs font-semibold text-ink-500">{filtered.length} of {items.length} countries</span>
        </div>
      </div>

      <div className="relative mt-4">
      <div className={`overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white transition duration-200 ${isPending ? "pointer-events-none select-none blur-[2px] opacity-55" : ""}`} aria-busy={isPending}>
        <div className="hidden grid-cols-[70px_minmax(0,1fr)_130px_130px_130px_140px] gap-4 border-b border-[#e5e8eb] bg-[#fafbfb] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400 lg:grid">
          <span>Flag</span><span>Country</span><span>Societies</span><span>Websites</span><span>Social links</span><span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-[#edf0f2]">
          {filtered.map((item) => (
            <article key={item.slug} className="group relative grid gap-4 px-4 py-4 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center lg:grid-cols-[70px_minmax(0,1fr)_130px_130px_130px_140px] lg:px-5">
              <Link href={`/admin/members/${item.slug}`} aria-label={`Manage ${item.country}`} className="absolute inset-0 z-0" />
              <div className="pointer-events-none relative z-10 flex h-10 w-14 items-center overflow-hidden rounded-md border border-ink-200 bg-ink-50">
                <Image src={item.flagSrc} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="pointer-events-none relative z-10 min-w-0">
                <h2 className="truncate text-sm font-semibold text-ink-950 group-hover:text-crimson-700">{item.country}</h2>
                <p className="mt-1 text-[11px] font-semibold text-ink-400">{item.countryCode}</p>
              </div>
              <span className="pointer-events-none relative z-10 text-xs text-ink-600">{item.societies}</span>
              <span className="pointer-events-none relative z-10 text-xs text-ink-600">{item.websites}</span>
              <span className="pointer-events-none relative z-10 text-xs text-ink-600">{item.socialLinks}</span>
              <div className="relative z-10 flex justify-end gap-1.5">
                <Link href={`/admin/members/${item.slug}`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#071421] px-3 text-xs font-semibold text-white transition hover:bg-[#142535]"><Pencil size={13} />Edit</Link>
                <a href={`/members#${item.slug}`} target="_blank" rel="noreferrer" aria-label={`Open ${item.country} publicly`} className="grid size-9 place-items-center rounded-lg border border-ink-200 text-ink-400 transition hover:border-jade-300 hover:bg-jade-50 hover:text-jade-700"><ExternalLink size={14} /></a>
                <button type="button" disabled={isPending} onClick={() => setDeleting(item)} aria-label={`Move ${item.country} to trash`} className="grid size-9 place-items-center rounded-lg border border-ink-200 text-ink-400 transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700 disabled:opacity-45"><Trash2 size={14} /></button>
              </div>
            </article>
          ))}
          {filtered.length === 0 ? <p className="px-6 py-16 text-center text-sm font-semibold text-ink-600">No member countries match this search.</p> : null}
        </div>
      </div>
      <AdminPendingOverlay visible={isPending} label="Updating members…" />
      </div>

      <DeleteConfirmDialog open={Boolean(deleting)} title={deleting?.country || "this member country"} onClose={() => setDeleting(null)} onConfirm={() => deleting && removeCountry(deleting)} />
    </>
  );
}
