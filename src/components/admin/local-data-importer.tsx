"use client";

import { useActionState } from "react";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import type { LocalImportSummary } from "@/lib/supabase/local-import";

export function LocalDataImporter({ action }: { action: (previous: LocalImportSummary | null, formData: FormData) => Promise<LocalImportSummary> }) {
  const [state, formAction, pending] = useActionState(action, null);
  return <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
    <AdminPendingOverlay visible={pending} label="Importing records…" />
    <h2 className="text-base font-semibold text-ink-900">Import local records</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">Copies the current local admin records into Supabase. Matching records are overwritten; media is recorded as metadata and remains outside Supabase storage.</p>
    <form action={formAction} className="mt-5">
      <label className="mb-4 flex max-w-2xl cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
        <input type="checkbox" name="confirmImport" required className="mt-0.5 size-4 shrink-0 accent-amber-700" />
        <span>I understand that this imports local data into Supabase and overwrites matching database records.</span>
      </label>
      <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-crimson-600 px-5 text-sm font-semibold text-white transition hover:bg-crimson-700 disabled:cursor-wait disabled:opacity-60">{pending ? "Importing records…" : "Start import"}</button>
    </form>
    {state?.error ? <p role="alert" className="mt-4 rounded-xl border border-crimson-100 bg-crimson-50 px-4 py-3 text-xs leading-5 text-crimson-800">{state.error}</p> : null}
    {state?.ok ? <div className="mt-5 rounded-xl border border-jade-100 bg-jade-50 p-4"><p className="text-sm font-semibold text-jade-800">Import completed successfully.</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{Object.entries(state.counts).map(([label, count]) => <div key={label} className="rounded-lg bg-white/70 px-3 py-2"><p className="text-[10px] uppercase tracking-[0.08em] text-ink-400">{label.replaceAll("_", " ")}</p><p className="mt-1 text-lg font-semibold text-ink-900">{count}</p></div>)}</div></div> : null}
  </div>;
}
