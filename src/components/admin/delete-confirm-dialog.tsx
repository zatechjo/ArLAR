"use client";

import { useId } from "react";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

export function DeleteConfirmDialog({ open, title, heading, description, confirmLabel, cancelLabel = "Keep record", mode = "trash", onClose, onConfirm }: { open: boolean; title: string; heading?: string; description?: string; confirmLabel?: string; cancelLabel?: string; mode?: "trash" | "permanent"; onClose: () => void; onConfirm: () => void }) {
  const titleId = useId();
  const modalRef = useModalAccessibility<HTMLDivElement>({ open, onClose });
  if (!open) return null;
  const resolvedHeading = heading || (mode === "permanent" ? `Delete ${title} permanently?` : `Move ${title} to trash?`);
  const resolvedDescription = description || (mode === "permanent" ? "This record cannot be restored after permanent deletion." : "The record will leave the website now and can be restored from Trash.");
  const resolvedConfirmLabel = mode === "permanent"
    ? (confirmLabel || "Delete permanently")
    : (confirmLabel || "Move to trash");
  return <div className="fixed inset-0 z-[260] grid place-items-center bg-[#03101c]/65 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div ref={modalRef} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,.3)]"><div className="border-b border-ink-100 p-6"><div className="grid size-11 place-items-center rounded-2xl bg-crimson-50 text-crimson-700"><TrashIcon /></div><h2 id={titleId} className="mt-5 text-xl font-semibold tracking-[-0.025em] text-ink-950">{resolvedHeading}</h2><p className="mt-2 text-sm leading-6 text-ink-500">{resolvedDescription}</p></div><div className="flex justify-end gap-2 bg-[#fafbfb] p-4"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-ink-200 bg-white px-4 text-xs font-semibold text-ink-700 hover:bg-ink-50">{cancelLabel}</button><button type="button" onClick={() => { onConfirm(); onClose(); }} className="h-10 rounded-xl bg-crimson-700 px-4 text-xs font-semibold text-white hover:bg-crimson-800">{resolvedConfirmLabel}</button></div></div></div>;
}

export function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function PencilIcon({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden><path d="m4 20 4.2-1 10.6-10.6a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" strokeLinecap="round" strokeLinejoin="round" /><path d="m14.5 6.7 2.8 2.8" /></svg>;
}
