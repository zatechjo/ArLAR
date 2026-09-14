"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteAdminRecordAction } from "@/app/(admin)/admin/(panel)/actions";
import { AdminButton } from "@/components/admin/admin-ui";
import { DeleteConfirmDialog, TrashIcon } from "@/components/admin/delete-confirm-dialog";
import { Check } from "@/components/icons";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";

export function DoctorHeaderActions({ doctorId, doctorName, formId }: { doctorId?: string; doctorName?: string; formId: string }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const isEdit = Boolean(doctorName);

  return (
    <>
      <AdminButton type="submit" form={formId} disabled={isDeleting}><Check className="h-4 w-4" />{isEdit ? "Save doctor" : "Create doctor"}</AdminButton>
      {isEdit ? (
        <button type="button" onClick={() => setDeleteOpen(true)} aria-label={`Move ${doctorName} to trash`} title="Move to trash" className="grid size-10 place-items-center rounded-xl border border-[#071421] bg-[#071421] text-white transition hover:border-[#162737] hover:bg-[#162737]"><TrashIcon /></button>
      ) : null}
      <DeleteConfirmDialog open={deleteOpen} title={doctorName || "this doctor"} description="This removes the unified profile and its placements across the website. You can restore it from Trash." confirmLabel={isDeleting ? "Moving…" : "Move to trash"} onClose={() => setDeleteOpen(false)} onConfirm={() => { if (!doctorId) return; startDeleteTransition(async () => { await deleteAdminRecordAction("doctors", doctorId); router.push("/admin/doctors"); router.refresh(); }); }} />
      <AdminPendingOverlay visible={isDeleting} label="Moving doctor to trash…" />
    </>
  );
}
