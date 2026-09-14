"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { setArlar27SectionStatusAction } from "@/app/(admin)/admin/(panel)/arlar27/actions";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import { StatusPill } from "@/components/admin/admin-ui";

export type Arlar27SectionStatus = "ready" | "waiting";

export function Arlar27StatusControl({ section, initialStatus }: { section: string; initialStatus: Arlar27SectionStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  function update(next: Arlar27SectionStatus) {
    const previous = status;
    setStatus(next);
    startTransition(async () => {
      try { await setArlar27SectionStatusAction(section, next); }
      catch { setStatus(previous); }
    });
  }

  return (
    <><div className="inline-flex h-10 items-center rounded-xl border border-ink-200 bg-white p-1" aria-label="Page status">
      <button type="button" disabled={pending} onClick={() => update("ready")} aria-pressed={status === "ready"} className={`h-8 rounded-lg px-3 text-xs font-semibold transition ${status === "ready" ? "bg-jade-50 text-jade-700" : "text-ink-400 hover:bg-ink-50 hover:text-ink-700"}`}>Ready</button>
      <button type="button" disabled={pending} onClick={() => update("waiting")} aria-pressed={status === "waiting"} className={`h-8 rounded-lg px-3 text-xs font-semibold transition ${status === "waiting" ? "bg-amber-50 text-amber-700" : "text-ink-400 hover:bg-ink-50 hover:text-ink-700"}`}>Waiting</button>
    </div><AdminPendingOverlay visible={pending} label="Updating page status…" /></>
  );
}

export type Arlar27SectionRow = {
  key: string;
  index: string;
  title: string;
  description: string;
  href: string;
  initialStatus: Arlar27SectionStatus;
};

export function Arlar27SectionList({ sections }: { sections: Arlar27SectionRow[] }) {
  return (
    <div className="divide-y divide-[#edf0f2]">
      {sections.map((section) => <Arlar27SectionLink key={section.key} section={section} />)}
    </div>
  );
}

function Arlar27SectionLink({ section }: { section: Arlar27SectionRow }) {
  const status = section.initialStatus;
  return (
    <Link
      href={section.href}
      className="group grid gap-3 px-5 py-4 outline-none transition-colors hover:bg-[#fafbfb] focus-visible:bg-crimson-50/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crimson-300 sm:grid-cols-[36px_minmax(0,1fr)_auto_auto] sm:items-center sm:px-6"
    >
      <span className="text-xs font-semibold text-ink-300 transition-colors group-hover:text-crimson-500">{section.index}</span>
      <div><p className="text-sm font-semibold text-ink-900">{section.title}</p><p className="mt-1 line-clamp-1 text-[11px] text-ink-400">{section.description}</p></div>
      <span className="justify-self-start"><StatusPill tone={status === "ready" ? "green" : "amber"}>{status === "ready" ? "Ready" : "Waiting"}</StatusPill></span>
      <span className="inline-flex items-center gap-1.5 justify-self-start text-xs font-semibold text-crimson-600 transition group-hover:gap-2.5 group-hover:text-crimson-800 sm:justify-self-end">Manage <ArrowRight size={14} /></span>
    </Link>
  );
}
