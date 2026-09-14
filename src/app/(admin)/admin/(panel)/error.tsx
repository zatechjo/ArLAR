"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AdminPanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main className="grid min-h-[70vh] place-items-center p-6">
      <section className="w-full max-w-lg rounded-3xl border border-crimson-100 bg-white p-8 text-center shadow-[0_24px_80px_rgba(7,20,33,.08)]">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-crimson-50 text-crimson-700"><AlertTriangle size={21} /></span>
        <h1 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-ink-950">This admin page could not be loaded</h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">Your work on other pages is safe. Try this page again; if the problem continues, keep the reference below for support.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-crimson-600 px-4 text-sm font-semibold text-white hover:bg-crimson-700"><RotateCcw size={15} />Try again</button>
          <Link href="/admin/dashboard" className="inline-flex min-h-11 items-center rounded-xl border border-ink-200 px-4 text-sm font-semibold text-ink-700 hover:bg-ink-50">Return to dashboard</Link>
        </div>
        {error.digest ? <p className="mt-6 text-[10px] uppercase tracking-[0.12em] text-ink-300">Reference {error.digest}</p> : null}
      </section>
    </main>
  );
}
