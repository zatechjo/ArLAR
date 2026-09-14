"use client";

import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";

import { deleteAdminRecordAction } from "@/app/(admin)/admin/(panel)/actions";
import { AdminSearchField, AdminSelect, StatusPill } from "@/components/admin/admin-ui";
import { DeleteConfirmDialog, TrashIcon } from "@/components/admin/delete-confirm-dialog";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";

export type AdminCollegeEvent = {
  id: string;
  title: string;
  speakers: string;
  image: string;
  date: string;
  year: number;
  groups: string[];
  status: "published" | "draft";
  href: string;
};

const desktopColumns = "lg:grid-cols-[minmax(340px,1.4fr)_150px_minmax(190px,.8fr)_110px_170px]";

export function CollegeManager({ events }: { events: AdminCollegeEvent[] }) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<AdminCollegeEvent | null>(null);
  const deferredQuery = useDeferredValue(query);
  const years = useMemo(() => [...new Set(events.map((event) => event.year))].sort((a, b) => b - a), [events]);
  const visible = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return events.filter((event) => {
      if (removedIds.includes(event.id)) return false;
      const searchable = `${event.title} ${event.speakers} ${event.groups.join(" ")} ${event.year}`.toLowerCase();
      return (!needle || searchable.includes(needle))
        && (year === "all" || event.year === Number(year))
        && (status === "all" || event.status === status);
    });
  }, [deferredQuery, events, removedIds, status, year]);

  const pageSize = 18;
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const pageItems = visible.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="rounded-2xl border border-[#e1e5e9] bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          <AdminSearchField value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search webinars, speakers, or clinical groups…" />
          <div className="flex flex-wrap gap-2">
            <AdminSelect label="Year" value={year} onChange={(value) => { setYear(value); setPage(1); }}>
              <option value="all">All years</option>
              {years.map((item) => <option key={item} value={item}>{item}</option>)}
            </AdminSelect>
            <AdminSelect label="Status" value={status} onChange={(value) => { setStatus(value); setPage(1); }}>
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </AdminSelect>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f2] pt-4">
          <p className="text-xs font-semibold text-ink-600">{visible.length} of {events.length} webinars</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-400">Click a webinar title to open its editor</p>
        </div>
      </div>

      <div className="relative mt-4">
      <div className={`overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white transition duration-200 ${isDeleting ? "pointer-events-none select-none blur-[2px] opacity-55" : ""}`} aria-busy={isDeleting}>
        <div className={`hidden ${desktopColumns} gap-4 border-b border-[#e5e8eb] bg-[#fafbfb] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400 lg:grid`}>
          <span>Webinar</span>
          <span>Date</span>
          <span>Organised by</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-[#edf0f2]">
          {pageItems.map((event) => {
            const eventDate = new Date(event.date);
            return (
              <div key={event.id} className={`group grid gap-4 px-4 py-4 transition hover:bg-[#fafbfb] sm:grid-cols-[minmax(260px,1fr)_auto] sm:items-center ${desktopColumns} lg:px-5`}>
                <Link href={event.href} className="flex min-w-0 items-center gap-3">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-50 ring-1 ring-ink-100"><Image src={event.image} alt="" fill sizes="64px" className="object-cover" /></div>
                  <div className="min-w-0"><p className="line-clamp-2 text-sm font-semibold leading-5 text-ink-950 transition group-hover:text-crimson-700">{event.title.trim()}</p>{event.speakers ? <p className="mt-1 truncate text-[11px] text-ink-400">{event.speakers.replaceAll(/\s*\n\s*/g, ", ")}</p> : null}</div>
                </Link>

                <div>
                  <p className="text-xs font-semibold text-ink-700">{eventDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {event.groups.slice(0, 2).map((group) => <span key={group} className="max-w-[165px] truncate rounded-md bg-ink-50 px-2 py-1 text-[10px] font-semibold text-ink-600">{group}</span>)}
                  {event.groups.length > 2 ? <span className="rounded-md bg-crimson-50 px-2 py-1 text-[10px] font-semibold text-crimson-700">+{event.groups.length - 2}</span> : null}
                </div>

                <div className="justify-self-start"><StatusPill tone={event.status === "published" ? "green" : "neutral"}>{event.status === "published" ? "Published" : "Draft"}</StatusPill></div>

                <div className="flex items-center justify-end gap-2">
                  <Link href={event.href} className="inline-flex items-center gap-1.5 rounded-lg bg-[#071421] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#142535]"><Pencil size={13} />Edit</Link>
                  <button type="button" onClick={() => setDeleting(event)} aria-label={`Delete ${event.title.trim()}`} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700"><TrashIcon /></button>
                </div>
              </div>
            );
          })}
          {pageItems.length === 0 ? <div className="px-6 py-16 text-center"><p className="text-sm font-semibold text-ink-700">No webinars match these filters</p><p className="mt-2 text-xs text-ink-400">Try another title, year, or status.</p></div> : null}
        </div>

        <div className="flex items-center justify-between border-t border-[#edf0f2] bg-[#fafbfb] px-5 py-3">
          <p className="text-[11px] text-ink-400">Page {page} of {pageCount}</p>
          <div className="flex gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 disabled:opacity-35">Previous</button>
            <button type="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 disabled:opacity-35">Next</button>
          </div>
        </div>
      </div>
      <AdminPendingOverlay visible={isDeleting} label="Moving webinar to trash…" />
      </div>

      <DeleteConfirmDialog open={Boolean(deleting)} title={deleting?.title.trim() || "this webinar"} description="This removes the webinar from the College archive and public listings. You can restore it from Trash." confirmLabel={isDeleting ? "Moving…" : "Move to trash"} onClose={() => setDeleting(null)} onConfirm={() => { if (!deleting) return; const id = deleting.id; startDeleteTransition(async () => { await deleteAdminRecordAction("college-events", id); setRemovedIds((current) => [...current, id]); router.refresh(); }); }} />
    </>
  );
}
