"use client";

import { ArrowRight, Check, Copy, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";

import { AdminSearchField, AdminSelect, StatusPill } from "@/components/admin/admin-ui";
import type { InboxRecord, InboxRecordKind, InboxRecordStatus } from "@/lib/inbox-repository";

const tabs: { id: InboxRecordKind; label: string }[] = [
  { id: "contact", label: "Contact enquiries" },
  { id: "question", label: "Public questions" },
  { id: "subscriber", label: "Subscribers" },
];

export function InboxManager({ records }: { records: InboxRecord[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<InboxRecordKind>("contact");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [copyFeedback, setCopyFeedback] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const current = useMemo(() => records.filter((record) => {
    if (record.kind !== tab || (status !== "all" && record.status !== status)) return false;
    return !deferredQuery || [record.name, record.email, record.subject, record.message, record.enquiryType, record.organisation]
      .join(" ").toLowerCase().includes(deferredQuery);
  }), [deferredQuery, records, status, tab]);
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(current.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageItems = current.slice((safePage - 1) * pageSize, safePage * pageSize);

  function openRecord(id: string) { router.push(`/admin/inbox/${encodeURIComponent(id)}`); }

  function exportCsv() {
    const headings = ["ID", "Type", "Status", "Received", "Name", "Email", "Phone", "Country", "Role", "Organisation", "Enquiry type", "Subject", "Message", "Source"];
    const rows = current.map((record) => [record.id, record.kind, record.status, record.createdAt, record.name, record.email, record.phone, record.country, record.role, record.organisation, record.enquiryType, record.subject, record.message, record.source]);
    const csv = [headings, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `arlar-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copySubscriberEmails() {
    const emails = [...new Set(current.map((record) => record.email.trim().toLowerCase()).filter(Boolean))];
    if (emails.length === 0) return;
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setCopyFeedback(`${emails.length} ${emails.length === 1 ? "email" : "emails"} copied`);
    } catch {
      setCopyFeedback("Could not copy emails. Use Export CSV instead.");
    }
  }

  const statuses = tab === "subscriber"
    ? [{ value: "all", label: "All subscribers" }, { value: "active", label: "Active" }, { value: "unsubscribed", label: "Unsubscribed" }, { value: "archived", label: "Archived" }]
    : [{ value: "all", label: "All statuses" }, { value: "unread", label: "Unread" }, { value: "read", label: "Read" }, { value: "resolved", label: "Resolved" }, { value: "archived", label: "Archived" }];

  return (
    <>
      <div className="flex flex-wrap gap-2 border-b border-[#e1e5e9]">
        {tabs.map((item) => {
          const count = records.filter((record) => record.kind === item.id).length;
          return <button key={item.id} type="button" onClick={() => { setTab(item.id); setStatus("all"); setPage(1); }} className={`relative inline-flex min-h-11 cursor-pointer items-center gap-2 px-3 text-xs font-semibold transition ${tab === item.id ? "text-crimson-700" : "text-ink-500 hover:text-ink-900"}`}><span>{item.label}</span><span className={`rounded-full px-2 py-0.5 text-[10px] ${tab === item.id ? "bg-crimson-50 text-crimson-700" : "bg-ink-100 text-ink-400"}`}>{count}</span>{tab === item.id ? <span className="absolute inset-x-1 -bottom-px h-0.5 bg-crimson-600" /> : null}</button>;
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#e1e5e9] bg-white p-4 lg:flex-row">
        <AdminSearchField value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search names, emails, subjects, or message text…" />
        <AdminSelect label="Submission status" value={status} onChange={(value) => { setStatus(value); setPage(1); }}>{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</AdminSelect>
        {tab === "subscriber" ? <button type="button" onClick={() => void copySubscriberEmails()} disabled={current.length === 0} className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-xs font-semibold text-ink-700 transition hover:border-ink-400 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40">{copyFeedback.endsWith("copied") ? <Check size={14} /> : <Copy size={14} />}Copy emails</button> : null}
        <button type="button" onClick={exportCsv} disabled={current.length === 0} className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-xs font-semibold text-ink-700 transition hover:border-ink-400 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"><Download size={14} />Export CSV</button>
      </div>
      {tab === "subscriber" && copyFeedback ? <p className="mt-2 px-1 text-xs font-medium text-ink-500" role="status" aria-live="polite">{copyFeedback}</p> : null}

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              <tr><th className="w-8 px-4 py-3" /><th className="w-56 px-4 py-3">{tab === "subscriber" ? "Subscriber" : "Sender"}</th><th className="px-4 py-3">{tab === "contact" ? "Enquiry" : tab === "question" ? "Question" : "Subscription"}</th><th className="w-36 px-4 py-3">Received</th><th className="w-32 px-4 py-3">Status</th><th className="w-28 px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.map((record) => (
                <tr key={record.id} onClick={() => openRecord(record.id)} className="cursor-pointer transition hover:bg-slate-50/60">
                  <td className="px-4 py-4"><span className={`block size-2 rounded-full ${record.status === "unread" ? "bg-crimson-600" : "bg-slate-200"}`} /></td>
                  <td className="px-4 py-4"><p className="truncate font-semibold text-slate-800">{displayName(record)}</p><p className="mt-1 truncate text-xs text-slate-400">{record.email || "No email supplied"}</p></td>
                  <td className="px-4 py-4"><p className="truncate font-semibold text-slate-700">{record.subject}</p><p className="mt-1 max-w-2xl truncate text-xs text-slate-400">{record.message}</p></td>
                  <td className="px-4 py-4 text-xs text-slate-500">{formatDate(record.createdAt)}</td>
                  <td className="px-4 py-4"><RecordStatus status={record.status} /></td>
                  <td className="px-4 py-4"><div className="flex justify-end"><button type="button" onClick={(event) => { event.stopPropagation(); openRecord(record.id); }} className="inline-flex items-center gap-1.5 rounded-lg bg-[#071421] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#142535]">View<ArrowRight size={13} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {current.length === 0 ? <div className="px-6 py-20 text-center"><p className="text-sm font-semibold text-ink-700">No records found</p><p className="mt-2 text-xs text-ink-400">New submissions from the website will appear here.</p></div> : null}
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] text-slate-400"><span>{current.length} {current.length === 1 ? "record" : "records"}</span>{pageCount > 1 ? <div className="flex items-center gap-2"><span>Page {safePage} of {pageCount}</span><button type="button" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="cursor-pointer rounded-lg border border-ink-200 bg-white px-3 py-1.5 font-semibold text-ink-600 disabled:cursor-not-allowed disabled:opacity-35">Previous</button><button type="button" disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="cursor-pointer rounded-lg border border-ink-200 bg-white px-3 py-1.5 font-semibold text-ink-600 disabled:cursor-not-allowed disabled:opacity-35">Next</button></div> : null}</div>
      </div>
    </>
  );
}

export function RecordStatus({ status }: { status: InboxRecordStatus }) {
  const tone = status === "unread" ? "red" : status === "resolved" || status === "active" ? "green" : status === "read" ? "blue" : "neutral";
  return <StatusPill tone={tone}>{status.charAt(0).toUpperCase() + status.slice(1)}</StatusPill>;
}

function displayName(record: InboxRecord) { return record.name || (record.kind === "subscriber" ? record.email : "Anonymous visitor"); }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date); }
function csvCell(value: string) { return `"${String(value || "").replaceAll('"', '""')}"`; }
