"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AdminMultiSelect({ name, options, initialValues = [], placeholder = "Select one or more groups" }: { name: string; options: string[]; initialValues?: string[]; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => [...new Set(initialValues.filter(Boolean))]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function toggle(option: string) {
    setSelected((current) => current.includes(option) ? current.filter((item) => item !== option) : [...current, option]);
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={JSON.stringify(selected)} />
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-haspopup="listbox" className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3.5 text-left text-[13px] font-medium outline-none transition ${open ? "border-jade-500 ring-2 ring-jade-100" : "border-ink-200 hover:border-ink-300"}`}>
        <span className={selected.length ? "text-ink-900" : "text-ink-400"}>{selected.length ? `${selected.length} ${selected.length === 1 ? "group" : "groups"} selected` : placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div role="listbox" aria-multiselectable="true" className="absolute inset-x-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-ink-200 bg-white p-1.5 shadow-xl shadow-ink-950/10">
          {options.map((option) => {
            const active = selected.includes(option);
            return (
              <button key={option} type="button" role="option" aria-selected={active} onClick={() => toggle(option)} className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-medium transition ${active ? "bg-jade-50 text-jade-800" : "text-ink-700 hover:bg-ink-50"}`}>
                <span className={`grid size-4 shrink-0 place-items-center rounded border ${active ? "border-jade-600 bg-jade-600 text-white" : "border-ink-300 bg-white"}`}>{active ? <Check size={11} strokeWidth={3} /> : null}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {selected.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span key={item} className="inline-flex min-h-7 items-center gap-1.5 rounded-lg bg-ink-50 pl-2.5 pr-1.5 text-[10px] font-semibold text-ink-600">
              {item}
              <button type="button" onClick={() => setSelected((current) => current.filter((value) => value !== item))} className="grid size-5 place-items-center rounded-md text-ink-400 transition hover:bg-crimson-50 hover:text-crimson-700" aria-label={`Remove ${item}`}><X size={11} /></button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
