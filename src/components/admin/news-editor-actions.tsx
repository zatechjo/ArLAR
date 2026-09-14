"use client";

import { Save, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { trashNewsAction } from "@/app/(admin)/admin/(panel)/news/actions";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";

export function NewsEditorActions({ articleId, articleTitle = "this post" }: { articleId?: string; articleTitle?: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isMoving, startMoving] = useTransition();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const form = document.getElementById("news-composer-form");
    if (!(form instanceof HTMLFormElement)) return;
    const markDirty = () => setIsDirty(true);
    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("change", markDirty);
    };
  }, []);

  function setPublished(value: boolean) {
    const form = document.getElementById("news-composer-form");
    const published = form?.querySelector<HTMLInputElement>('input[name="published"]');
    if (published) published.checked = value;
  }

  return <>
    <div className="flex flex-wrap items-center gap-2">
      {articleId ? <button type="button" disabled={isMoving} onClick={() => setConfirmOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"><Trash2 size={16} />{isMoving ? "Moving..." : "Move to trash"}</button> : null}
      <button type="submit" form="news-composer-form" name="save_intent" value="save" disabled={!isDirty} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"><Save size={16} />Save</button>
      <button type="submit" form="news-composer-form" name="save_intent" value="publish" onClick={() => setPublished(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-crimson-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-crimson-700"><Send size={16} />Publish</button>
    </div>
    <AdminPendingOverlay visible={isMoving} label="Moving post to trash…" />
    {articleId ? <DeleteConfirmDialog
      open={confirmOpen}
      title={articleTitle}
      heading="Move this post to trash?"
      description="The post will leave the public website immediately. You can restore it later from Trash."
      confirmLabel="Move to trash"
      onClose={() => setConfirmOpen(false)}
      onConfirm={() => startMoving(async () => {
        await trashNewsAction(articleId);
        router.push("/admin/news/trash");
        router.refresh();
      })}
    /> : null}
  </>;
}
