"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteUpcomingCollegeEventAction } from "@/app/(admin)/admin/(panel)/college/actions";
import { deleteAdminRecordAction } from "@/app/(admin)/admin/(panel)/actions";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import { DeleteConfirmDialog, TrashIcon } from "@/components/admin/delete-confirm-dialog";
import { Check, ExternalLink } from "@/components/icons";

export function CollegeEventHeaderActions({
  webinarTitle,
  eventId,
  replayUrl,
  mode = "archive",
  formId,
}: {
  webinarTitle?: string;
  eventId?: string;
  replayUrl?: string;
  mode?: "archive" | "scheduled";
  formId: string;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const isEdit = Boolean(webinarTitle);

  return (
    <>
      {replayUrl ? (
        <a
          href={replayUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-800 transition hover:border-ink-400 hover:bg-ink-50"
        >
          <ExternalLink className="h-4 w-4" />
          Open replay
        </a>
      ) : null}
      <>
          <button type="submit" form={formId} formNoValidate name="intent" value="draft" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-800 transition hover:border-ink-400 hover:bg-ink-50">
            Save draft
          </button>
          <button type="submit" form={formId} name="intent" value="publish" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-crimson-600 bg-crimson-600 px-4 text-sm font-semibold text-white transition hover:border-crimson-700 hover:bg-crimson-700">
            <Check className="h-4 w-4" />
            {isEdit ? "Save webinar" : mode === "scheduled" ? "Schedule webinar" : "Create webinar"}
          </button>
      </>
      {isEdit ? (
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => setDeleteOpen(true)}
          aria-label={`Move ${webinarTitle} to trash`}
          title="Move to trash"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-crimson-300 hover:bg-crimson-50 hover:text-crimson-700 disabled:cursor-wait disabled:opacity-50"
        >
          <TrashIcon />
          Move to trash
        </button>
      ) : null}
      <AdminPendingOverlay visible={isDeleting} label="Moving webinar to trash…" />
      <DeleteConfirmDialog
        open={deleteOpen}
        title={webinarTitle || "this webinar"}
        heading="Move webinar to trash?"
        description={mode === "scheduled" ? "The upcoming webinar will be hidden immediately and can be restored from College Trash." : "The webinar will leave the College archive and can be restored from College Trash."}
        confirmLabel={isDeleting ? "Moving…" : "Move to trash"}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          if (mode === "scheduled") {
            startDeleteTransition(async () => {
              await deleteUpcomingCollegeEventAction();
              router.push("/admin/college");
              router.refresh();
            });
            return;
          }
          if (!eventId) return;
          startDeleteTransition(async () => {
            await deleteAdminRecordAction("college-events", eventId);
            router.push("/admin/college");
            router.refresh();
          });
        }}
      />
    </>
  );
}
