"use client";

import { GitMerge } from "lucide-react";
import { useState, useTransition } from "react";

import { mergeDuplicateDoctorAction } from "@/app/(admin)/admin/(panel)/doctors/actions";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";

export function DuplicateDoctorMergeNotice({
  canonicalId,
  duplicateId,
  doctorName,
}: {
  canonicalId: string;
  duplicateId: string;
  doctorName: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-amber-950">A redundant duplicate record was found.</p>
          <p className="mt-1 text-[11px] leading-5 text-amber-800">Merge <span className="font-semibold">{duplicateId}</span> into this canonical profile. Existing website placements will be preserved.</p>
        </div>
        <button type="button" disabled={pending} onClick={() => setDialogOpen(true)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#071421] px-4 text-xs font-semibold text-white transition hover:bg-[#142535] disabled:cursor-wait disabled:opacity-50">
          <GitMerge size={15} />
          Merge duplicate
        </button>
      </div>
      <AdminPendingOverlay visible={pending} label="Merging duplicate doctor…" />
      <DeleteConfirmDialog
        open={dialogOpen}
        mode="permanent"
        heading="Merge and remove the duplicate?"
        title={doctorName}
        description={`The canonical ${doctorName} profile and its placements will be kept. Only the redundant ${duplicateId} database row will be permanently removed.`}
        confirmLabel={pending ? "Merging…" : "Merge duplicate"}
        cancelLabel="Keep both records"
        onClose={() => setDialogOpen(false)}
        onConfirm={() => startTransition(() => mergeDuplicateDoctorAction(canonicalId, duplicateId))}
      />
    </>
  );
}
