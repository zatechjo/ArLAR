"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAdminRecordAction } from "@/app/(admin)/admin/(panel)/actions";
import { AdminImageField } from "@/components/admin/admin-image-field";
import { AdminNativeSelect, SectionCard, StatusPill } from "@/components/admin/admin-ui";
import { DeleteConfirmDialog, TrashIcon } from "@/components/admin/delete-confirm-dialog";
import { ExternalLink } from "@/components/icons";
import type { AdminMediaItem } from "@/lib/admin-media";
import type { CongressRecord, CongressVideo } from "@/lib/admin-congress-data";
import { AdminSavingForm } from "@/components/admin/admin-saving-form";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";

export function CongressReplayEditor({ congress, video, media, action, isNew = false }: { congress: CongressRecord; video: CongressVideo; media: AdminMediaItem[]; action: (formData: FormData) => void | Promise<void>; isNew?: boolean }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const thumbnail = video.thumbnail || (video.youtubeId ? `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg` : "");
  return <AdminSavingForm id="congress-replay-form" action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]" label="Saving replay…">
    <AdminPendingOverlay visible={isDeleting} label="Moving replay to trash…" />
    <input type="hidden" name="youtubeId" value={video.youtubeId} />
    <div className="space-y-6"><SectionCard title="Replay details" description="Update archive labels, faculty, day assignment, and video source."><div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7"><Field label="Session title" className="sm:col-span-2"><textarea name="title" defaultValue={video.title} required rows={3} className="admin-textarea text-base font-semibold" /></Field><Field label="Speaker / faculty"><input name="speaker" defaultValue={video.speaker} className="admin-input" /></Field><Field label="Programme day"><input name="day" defaultValue={video.day} className="admin-input" /></Field><Field label="Session date"><input name="date" defaultValue={video.date} className="admin-input" /></Field><Field label="Room"><input name="room" defaultValue={video.room} className="admin-input" /></Field><Field label="Duration"><input name="duration" defaultValue={video.duration} placeholder="45 min" className="admin-input" /></Field><Field label="Scientific track / programme" className="sm:col-span-2"><input name="track" defaultValue={video.track} className="admin-input" /></Field><Field label="YouTube or embed URL" className="sm:col-span-2"><input name="watchUrl" type="url" defaultValue={video.watchUrl} required className="admin-input" /></Field><Field label="Session description" className="sm:col-span-2"><textarea name="description" rows={8} defaultValue={video.description} className="admin-textarea" /></Field></div></SectionCard></div>
    <aside className="space-y-5"><SectionCard title="Current video"><div className="p-5">{thumbnail ? <div className="relative aspect-video overflow-hidden rounded-xl bg-ink-950"><Image src={thumbnail} alt="" fill sizes="350px" className="object-cover" /><div className="absolute inset-0 grid place-items-center"><span className="grid size-12 place-items-center rounded-full border border-white/50 bg-black/50 text-white">▶</span></div></div> : <div className="grid aspect-video place-items-center rounded-xl bg-ink-100 text-xs font-semibold text-ink-400">Add a video URL</div>}<div className="mt-3 flex items-center justify-between"><StatusPill tone={video.status === "published" ? "green" : "neutral"}>{video.status === "published" ? "Published" : "Draft"}</StatusPill><span className="text-[10px] text-ink-400">{video.duration || video.youtubeId}</span></div>{video.watchUrl ? <a href={video.watchUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-crimson-700"><ExternalLink className="h-4 w-4" />Open current video</a> : null}</div></SectionCard><SectionCard title="Custom thumbnail" headerAlign="center"><div className="p-5"><AdminImageField name="thumbnail" value={video.thumbnail} items={media} hint="Optional. Leave empty to keep the YouTube thumbnail." aspect="video" /></div></SectionCard><SectionCard title="Publishing"><div className="grid gap-3 p-5"><AdminNativeSelect name="status" defaultValue={video.status}><option value="published">Published</option><option value="draft">Draft</option></AdminNativeSelect><button type="submit" className="min-h-11 rounded-xl bg-crimson-600 px-4 text-sm font-semibold text-white hover:bg-crimson-700">{isNew ? "Add replay" : "Save replay"}</button></div></SectionCard>{!isNew ? <SectionCard title="Danger zone"><div className="p-5"><button type="button" onClick={() => setDeleteOpen(true)} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-crimson-200 text-xs font-semibold text-crimson-700 hover:bg-crimson-50"><TrashIcon />Move to trash</button></div></SectionCard> : null}</aside>
    <DeleteConfirmDialog open={deleteOpen} title={video.title} confirmLabel={isDeleting ? "Moving…" : "Move to trash"} onClose={() => setDeleteOpen(false)} onConfirm={() => startDeleteTransition(async () => { await deleteAdminRecordAction("congress-replays", `${congress.id}:${video.id}`); router.push(`/admin/congresses/${congress.id}`); router.refresh(); })} />
  </AdminSavingForm>;
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) { return <label className={className}><span className="mb-2 block text-xs font-semibold text-ink-700">{label}</span>{children}</label>; }
