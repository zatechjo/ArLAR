"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { Pencil } from "lucide-react";

import { deleteAdminRecordAction } from "@/app/(admin)/admin/(panel)/actions";
import { AdminSearchField, AdminSelect, StatusPill } from "@/components/admin/admin-ui";
import { DeleteConfirmDialog, TrashIcon } from "@/components/admin/delete-confirm-dialog";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import type { ProfessionalResource, ProfessionalResourceKind } from "@/lib/professional-resources-repository";

const kindLabels: Record<ProfessionalResourceKind, string> = { publication: "Publication", bulletin: "E-Bulletin", document: "Document", partner: "Partner resource" };

export function ProfessionalResourcesManager({ resources }: { resources: ProfessionalResource[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<ProfessionalResource | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    const removed = new Set(removedIds);
    return resources.filter((resource) => !removed.has(resource.id)
      && (kind === "all" || resource.kind === kind)
      && (status === "all" || resource.status === status)
      && (!needle || `${resource.title} ${resource.description} ${resource.collection} ${resource.authors.join(" ")} ${resource.topics.join(" ")}`.toLowerCase().includes(needle)));
  }, [deferredQuery, kind, removedIds, resources, status]);

  function openResource(id: string) { router.push(`/admin/professionals/${id}`); }

  return <>
    <div className="flex flex-col gap-3 rounded-2xl border border-[#e1e5e9] bg-white p-4 lg:flex-row">
      <AdminSearchField value={query} onChange={setQuery} placeholder="Search titles, authors, collections, or topics…" />
      <AdminSelect label="Resource type" value={kind} onChange={setKind}><option value="all">All resource types</option>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</AdminSelect>
      <AdminSelect label="Status" value={status} onChange={setStatus}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></AdminSelect>
    </div>

    <div className="relative mt-4">
    <div className={`overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white transition duration-200 ${isDeleting ? "pointer-events-none select-none blur-[2px] opacity-55" : ""}`} aria-busy={isDeleting}>
      <div className="hidden grid-cols-[64px_minmax(0,1fr)_150px_120px_115px_132px] gap-4 border-b border-[#e5e8eb] bg-[#fafbfb] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400 lg:grid">
        <span>Media</span><span>Resource</span><span>Type</span><span>Date</span><span>Status</span><span className="text-right">Actions</span>
      </div>
      <div className="divide-y divide-[#edf0f2]">
        {filtered.map((resource) => <article key={resource.id} role="link" tabIndex={0} onClick={() => openResource(resource.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openResource(resource.id); } }} className="group grid cursor-pointer gap-4 px-4 py-4 outline-none transition hover:bg-[#fbfcfc] focus-visible:bg-crimson-50/40 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center lg:grid-cols-[64px_minmax(0,1fr)_150px_120px_115px_132px] lg:px-5">
          <div className="relative size-14 overflow-hidden rounded-xl border border-ink-100 bg-ink-50">{resource.image ? <Image src={resource.image} alt="" fill sizes="56px" className="object-cover" /> : <span className="grid h-full place-items-center text-xs font-bold text-ink-300">{resource.title.slice(0, 2)}</span>}</div>
          <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-ink-950 transition group-hover:text-crimson-700">{resource.title}</h2><p className="mt-1 truncate text-[11px] text-ink-400">{resource.collection || "No collection"}{resource.authors.length > 0 ? ` · ${resource.authors.join(", ")}` : ""}</p></div>
          <span className="w-fit rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1 text-[10px] font-semibold text-ink-600">{kindLabels[resource.kind]}</span>
          <time dateTime={resource.date} className="text-xs text-ink-500">{formatDate(resource.date)}</time>
          <StatusPill tone={resource.status === "published" ? "green" : "neutral"}>{resource.status === "published" ? "Published" : "Draft"}</StatusPill>
          <div className="relative z-10 flex items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => openResource(resource.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#071421] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#142535]" aria-label={`Edit ${resource.title}`}><Pencil size={13} />Edit</button>
            <button type="button" disabled={isDeleting} onClick={() => setDeleting(resource)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700 disabled:opacity-50" aria-label={`Delete ${resource.title}`}><TrashIcon /></button>
          </div>
        </article>)}
        {filtered.length === 0 ? <div className="px-6 py-20 text-center"><p className="text-sm font-semibold text-ink-700">No resources match these filters</p><p className="mt-2 text-xs text-ink-400">Try another search, type, or publishing status.</p></div> : null}
      </div>
    </div>
    <AdminPendingOverlay visible={isDeleting} label="Moving resource to trash…" />
    </div>

    <DeleteConfirmDialog open={Boolean(deleting)} title={deleting?.title || "this resource"} confirmLabel={isDeleting ? "Moving…" : "Move to trash"} onClose={() => setDeleting(null)} onConfirm={() => { if (!deleting) return; const id = deleting.id; startDeleteTransition(async () => { await deleteAdminRecordAction("professional-resources", id); setRemovedIds((current) => [...current, id]); router.refresh(); }); }} />
  </>;
}

function formatDate(value: string) {
  if (!value) return "Not dated";
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}
