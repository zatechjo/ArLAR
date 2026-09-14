"use client";

import { useActionState } from "react";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import type { LocalImportSummary } from "@/lib/supabase/local-import";

export function R2ImageMigrator({ action }: { action: (previous: LocalImportSummary | null, formData: FormData) => Promise<LocalImportSummary> }) {
  const [state, formAction, pending] = useActionState(action, null);

  return <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
    <AdminPendingOverlay visible={pending} label="Finalizing image records…" />
    <h2 className="text-base font-semibold text-ink-900">Finalize image URLs in Supabase</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">Verifies the uploaded image objects in R2 and changes every local media record to its matching R2 URL. This does not delete local files.</p>
    <form action={formAction} className="mt-5">
      <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ink-950 px-5 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:cursor-wait disabled:opacity-60">{pending ? "Finalizing image records…" : "Finalize image records"}</button>
    </form>
    {state?.error ? <p role="alert" className="mt-4 rounded-xl border border-crimson-100 bg-crimson-50 px-4 py-3 text-xs leading-5 text-crimson-800">{state.error}</p> : null}
    {state?.ok ? <p className="mt-4 rounded-xl border border-jade-100 bg-jade-50 px-4 py-3 text-sm font-semibold text-jade-800">Updated {state.counts.images ?? 0} image record{state.counts.images === 1 ? "" : "s"} to R2.</p> : null}
  </div>;
}
