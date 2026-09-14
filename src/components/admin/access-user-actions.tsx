"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { removeAdministratorAction, renewAdministratorInvitationAction } from "@/app/(admin)/admin/(panel)/access/actions";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import { DeleteConfirmDialog, TrashIcon } from "@/components/admin/delete-confirm-dialog";

export function AccessUserActions({ id, name, invited }: { id: string; name: string; invited: boolean }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renewed, setRenewed] = useState(false);
  const [pending, startTransition] = useTransition();
  return <>{invited ? <button type="button" disabled={pending || renewed} onClick={() => startTransition(async () => { await renewAdministratorInvitationAction(id); setRenewed(true); router.refresh(); })} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 transition hover:border-ink-400 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw size={15} />{pending ? "Renewing…" : renewed ? "Invitation renewed" : "Renew invitation"}</button> : null}<button type="button" disabled={pending} onClick={() => setDeleteOpen(true)} aria-label={`Remove access for ${name}`} title="Remove administrator access" className="grid size-10 cursor-pointer place-items-center rounded-xl border border-crimson-200 bg-white text-crimson-700 transition hover:bg-crimson-50 disabled:cursor-wait disabled:opacity-50"><TrashIcon /></button><AdminPendingOverlay visible={pending} label={deleteOpen ? "Removing access…" : "Updating administrator…"} /><DeleteConfirmDialog open={deleteOpen} heading="Remove administrator access?" title={name} description="This account will immediately lose access once Supabase authentication is connected. This action cannot be undone from this screen." confirmLabel={pending ? "Removing…" : "Remove access"} onClose={() => setDeleteOpen(false)} onConfirm={() => startTransition(async () => { await removeAdministratorAction(id); router.push("/admin/access?removed=1"); router.refresh(); })} /></>;
}
