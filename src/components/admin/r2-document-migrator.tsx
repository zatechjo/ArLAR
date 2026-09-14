"use client";

import { useActionState } from "react";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import type { LocalImportSummary } from "@/lib/supabase/local-import";

export function R2DocumentMigrator({ action }: { action: (previous: LocalImportSummary | null, formData: FormData) => Promise<LocalImportSummary> }) {
  const [state, formAction, pending] = useActionState(action, null);

  return <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
    <AdminPendingOverlay visible={pending} label="Moving documents to R2…" />
    <h2 className="text-base font-semibold text-ink-900">Move website documents to Cloudflare R2</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">Streams the existing documents from the local public folder into R2 and updates their Supabase media records. Run this once before removing local document files.</p>
    <form action={formAction} className="mt-5">
      <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ink-950 px-5 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:cursor-wait disabled:opacity-60">{pending ? "Moving documents…" : "Move documents to R2"}</button>
    </form>
    {state?.error ? <p role="alert" className="mt-4 rounded-xl border border-crimson-100 bg-crimson-50 px-4 py-3 text-xs leading-5 text-crimson-800">{state.error}</p> : null}
    {state?.ok ? <p className="mt-4 rounded-xl border border-jade-100 bg-jade-50 px-4 py-3 text-sm font-semibold text-jade-800">Moved {state.counts.documents ?? 0} document{state.counts.documents === 1 ? "" : "s"} to Cloudflare R2.</p> : null}
  </div>;
}
