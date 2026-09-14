"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteAdminRecordAction } from "@/app/(admin)/admin/(panel)/actions";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import { DeleteConfirmDialog, TrashIcon } from "@/components/admin/delete-confirm-dialog";

export function ProfessionalResourceDeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  return <><button type="button" disabled={isPending} onClick={() => setOpen(true)} aria-label={`Delete ${title}`} title="Move to trash" className="grid size-10 place-items-center rounded-xl border border-crimson-200 bg-white text-crimson-700 transition hover:bg-crimson-50 disabled:cursor-wait disabled:opacity-50"><TrashIcon /></button><AdminPendingOverlay visible={isPending} label="Moving resource to trash…" /><DeleteConfirmDialog open={open} title={title} confirmLabel={isPending ? "Moving…" : "Move to trash"} onClose={() => setOpen(false)} onConfirm={() => startTransition(async () => { await deleteAdminRecordAction("professional-resources", id); router.push("/admin/professionals"); router.refresh(); })} /></>;
}
