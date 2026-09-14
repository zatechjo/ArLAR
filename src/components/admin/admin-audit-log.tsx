"use client";

import { ClipboardList, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import type { AdminAuditLogEntry } from "@/lib/access-control-types";

export function AdminAuditLog({ entries }: { entries: AdminAuditLogEntry[] }) {
  const [query, setQuery] = useState("");
  const [module, setModule] = useState("all");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const modules = useMemo(() => [...new Set(entries.map((entry) => entry.module).filter(Boolean))].toSorted(), [entries]);
  const filtered = useMemo(() => entries.filter((entry) => {
    const haystack = `${entry.actorEmail} ${entry.action} ${entry.module} ${entry.entityType} ${entry.targetLabel} ${entry.detail}`.toLowerCase();
    return (module === "all" || entry.module === module) && (!deferredQuery || haystack.includes(deferredQuery));
  }), [deferredQuery, entries, module]);

  return <section className="overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white">
    <div className="flex flex-col gap-4 border-b border-[#edf0f2] p-5 lg:flex-row lg:items-center lg:justify-between">
      <div><h2 className="text-base font-semibold tracking-[-0.02em] text-ink-950">Full activity log</h2><p className="mt-1 text-xs text-ink-400">Every recorded admin mutation and authentication event. File contents are never stored here.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row"><label className="relative block"><span className="sr-only">Search activity</span><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activity…" className="h-10 w-full rounded-xl border border-ink-200 bg-white pl-9 pr-3 text-xs outline-none transition focus:border-crimson-400 focus:ring-2 focus:ring-crimson-50 sm:w-64" /></label><label><span className="sr-only">Filter activity by module</span><select value={module} onChange={(event) => setModule(event.target.value)} className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-700 outline-none focus:border-crimson-400 sm:w-40"><option value="all">All modules</option>{modules.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}</select></label></div>
    </div>
    {filtered.length ? <div className="divide-y divide-ink-100">{filtered.map((entry) => <article key={entry.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[44px_minmax(0,1fr)_190px] lg:items-start"><span className="grid size-9 place-items-center rounded-xl bg-ink-50 text-ink-500"><ClipboardList size={16} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-crimson-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-crimson-700">{labelize(entry.module)}</span><h3 className="text-xs font-semibold text-ink-900">{entry.action}</h3>{entry.targetLabel ? <span className="truncate text-xs text-ink-500">· {entry.targetLabel}</span> : null}</div><p className="mt-1 text-xs leading-5 text-ink-500">{entry.detail || `${labelize(entry.entityType)} ${entry.entityId}`}</p><p className="mt-1 text-[10px] text-ink-400">{entry.actorEmail || "Unknown actor"}</p></div><time dateTime={entry.createdAt} className="text-[10px] text-ink-400 lg:text-right">{formatDate(entry.createdAt)}</time></article>)}</div> : <div className="px-6 py-16 text-center"><p className="text-sm font-semibold text-ink-700">No activity matches these filters.</p><p className="mt-2 text-xs text-ink-400">New changes will appear here as they are recorded.</p></div>}
    <div className="border-t border-ink-100 bg-[#fafbfb] px-5 py-3 text-[10px] font-semibold text-ink-400">Showing {filtered.length} of {entries.length} recorded events</div>
  </section>;
}

function labelize(value: string) { return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date); }
