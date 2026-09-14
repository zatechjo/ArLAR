"use client";

import { ChevronDown, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteAdminRecordAction } from "@/app/(admin)/admin/(panel)/actions";
import { AdminImageField } from "@/components/admin/admin-image-field";
import { AdminNativeSelect, AdminSearchField, SectionCard, StatusPill } from "@/components/admin/admin-ui";
import { DeleteConfirmDialog, PencilIcon, TrashIcon } from "@/components/admin/delete-confirm-dialog";
import { MediaLibraryDialog } from "@/components/admin/media-library-dialog";
import { ExternalLink } from "@/components/icons";
import type { AdminMediaItem } from "@/lib/admin-media";
import type { CongressRecord, CongressVideo } from "@/lib/admin-congress-data";
import { AdminSavingForm } from "@/components/admin/admin-saving-form";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";

type CongressTab = "overview" | "replays" | "gallery";

export function CongressEditor({ congress, media, action, isNew = false }: { congress: CongressRecord; media: AdminMediaItem[]; action: (formData: FormData) => void | Promise<void>; isNew?: boolean }) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [tab, setTab] = useState<CongressTab>("overview");
  const [query, setQuery] = useState("");
  const [gallery, setGallery] = useState(congress.gallery);
  const [deletingCongress, setDeletingCongress] = useState(false);
  const [deletingReplay, setDeletingReplay] = useState<CongressVideo | null>(null);
  const [removedReplayIds, setRemovedReplayIds] = useState<string[]>([]);
  const filtered = useMemo(() => congress.videos.filter((video) => !removedReplayIds.includes(video.id) && `${video.title} ${video.speaker} ${video.track}`.toLowerCase().includes(query.toLowerCase())), [congress.videos, query, removedReplayIds]);
  const tabs: Array<{ id: CongressTab; label: string }> = isNew ? [{ id: "overview", label: "Overview" }] : [{ id: "overview", label: "Overview" }, { id: "replays", label: `Replays ${congress.videos.length - removedReplayIds.length}` }, { id: "gallery", label: `Gallery ${gallery.length}` }];

  return <AdminSavingForm id="congress-editor-form" action={action} className="" label="Saving congress…">
    <AdminPendingOverlay visible={isDeleting} label="Moving item to trash…" />
    <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
    <input type="hidden" name="speakers" value={JSON.stringify(congress.speakers)} />
    <input type="hidden" name="tracks" value={JSON.stringify(congress.tracks)} />
    <div className="overflow-hidden rounded-3xl bg-[#071421] text-white">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:items-center">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-white"><Image src={congress.image || "/arlar-logo-tight.png"} alt="" fill sizes="180px" className="object-contain p-4" /></div>
        <div><div className="flex items-center gap-2"><StatusPill tone={congress.status === "published" ? "green" : "neutral"}>{congress.status === "published" ? "Published" : "Draft"}</StatusPill><span className="text-[10px] text-slate-400">Congress ID · {congress.id}</span></div><h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">{congress.title}</h2><p className="mt-2 text-sm text-slate-300">{congress.dateRange} · {congress.location}</p></div>
        {congress.publicHref ? <a href={congress.publicHref} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-xs font-semibold hover:bg-white/10"><ExternalLink className="h-4 w-4" />View public archive</a> : null}
      </div>
      <nav className="flex overflow-x-auto border-t border-white/10 px-4 sm:px-7">{tabs.map((item) => <button type="button" key={item.id} onClick={() => setTab(item.id)} className={`shrink-0 border-b-2 px-4 py-4 text-xs font-semibold ${tab === item.id ? "border-crimson-500 text-white" : "border-transparent text-slate-400 hover:text-white"}`}>{item.label}</button>)}</nav>
    </div>

    <div className="mt-6">
      {tab === "overview" ? <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SectionCard title="Congress information" description="Manage the archive identity and public details."><div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7"><Field label="Congress title" className="sm:col-span-2"><input name="title" defaultValue={congress.title} required className="admin-input" /></Field><Field label="Date range"><input name="dateRange" defaultValue={congress.dateRange} className="admin-input" /></Field><Field label="Location"><input name="location" defaultValue={congress.location} className="admin-input" /></Field><Field label="Public archive path or URL" className="sm:col-span-2"><input name="publicHref" defaultValue={congress.publicHref} placeholder="/congresses/…" className="admin-input" /></Field><Field label="Archive introduction" className="sm:col-span-2"><textarea name="introduction" rows={6} defaultValue={congress.introduction} className="admin-textarea" /></Field></div></SectionCard>
        <aside className="space-y-5"><SectionCard title="Congress artwork" headerAlign="center"><div className="p-5"><AdminImageField name="image" value={congress.image} items={media} aspect="video" /></div></SectionCard><SectionCard title="Publishing"><div className="grid gap-3 p-5"><AdminNativeSelect name="status" defaultValue={congress.status}><option value="published">Published</option><option value="draft">Draft</option></AdminNativeSelect><button type="submit" className="min-h-11 rounded-xl bg-crimson-600 px-4 text-sm font-semibold text-white transition hover:bg-crimson-700">{isNew ? "Create congress" : "Save congress"}</button></div></SectionCard>{!isNew ? <SectionCard title="Danger zone"><div className="p-5"><button type="button" onClick={() => setDeletingCongress(true)} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-crimson-200 text-xs font-semibold text-crimson-700 hover:bg-crimson-50"><TrashIcon />Move to trash</button></div></SectionCard> : null}</aside>
      </div> : null}

      {tab === "replays" ? <SectionCard title="Replay library" description="Every replay opens in its own editor." action={<Link href={`/admin/congresses/${congress.id}/replays/new`} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#071421] px-3 text-xs font-semibold text-white"><Plus size={14} />Add replay</Link>}><div className="border-b border-ink-100 p-4"><AdminSearchField value={query} onChange={setQuery} placeholder="Search replay titles, speakers, or tracks…" /></div><div className="divide-y divide-ink-100">{filtered.map((video) => <div key={video.id} className="group grid gap-3 px-5 py-4 sm:grid-cols-[84px_minmax(0,1fr)_160px_74px] sm:items-center"><Link href={`/admin/congresses/${congress.id}/replays/${video.id}`} className="relative aspect-video overflow-hidden rounded-lg bg-ink-950"><Image src={video.thumbnail || `https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`} alt="" fill sizes="84px" className="object-cover" /></Link><Link href={`/admin/congresses/${congress.id}/replays/${video.id}`} className="min-w-0"><p className="line-clamp-1 text-sm font-semibold text-ink-900 group-hover:text-crimson-700">{video.title}</p><p className="mt-1 line-clamp-1 text-[11px] text-ink-400">{video.speaker || "No speaker supplied"}{video.track ? ` · ${video.track}` : ""}</p></Link><div><p className="text-xs font-semibold text-crimson-700">{video.day}</p><p className="mt-1 text-[10px] text-ink-400">{video.date}{video.duration ? ` · ${video.duration}` : ""}</p></div><div className="flex justify-end gap-1"><Link href={`/admin/congresses/${congress.id}/replays/${video.id}`} className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-crimson-700" aria-label={`Edit ${video.title}`}><PencilIcon /></Link><button type="button" onClick={() => setDeletingReplay(video)} className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-crimson-50 hover:text-crimson-700" aria-label={`Delete ${video.title}`}><TrashIcon /></button></div></div>)}{filtered.length === 0 ? <p className="px-5 py-14 text-center text-sm text-ink-400">No replays match this search.</p> : null}</div></SectionCard> : null}

      {tab === "gallery" ? <GalleryManager gallery={gallery} media={media} onChange={setGallery} /> : null}

    </div>

    <DeleteConfirmDialog open={deletingCongress} title={congress.title} confirmLabel={isDeleting ? "Moving…" : "Move to trash"} onClose={() => setDeletingCongress(false)} onConfirm={() => startDeleteTransition(async () => { await deleteAdminRecordAction("congresses", congress.id); router.push("/admin/congresses"); router.refresh(); })} />
    <DeleteConfirmDialog open={Boolean(deletingReplay)} title={deletingReplay?.title || "this replay"} confirmLabel={isDeleting ? "Moving…" : "Move to trash"} onClose={() => setDeletingReplay(null)} onConfirm={() => { if (!deletingReplay) return; const id = deletingReplay.id; startDeleteTransition(async () => { await deleteAdminRecordAction("congress-replays", `${congress.id}:${id}`); setRemovedReplayIds((current) => [...current, id]); setDeletingReplay(null); router.refresh(); }); }} />
  </AdminSavingForm>;
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) { return <label className={className}><span className="mb-2 block text-xs font-semibold text-ink-700">{label}</span>{children}</label>; }
function SaveCollection() { return <div className="border-t border-ink-100 px-5 py-4 text-right"><button type="submit" className="min-h-10 rounded-xl bg-crimson-600 px-5 text-sm font-semibold text-white hover:bg-crimson-700">Save changes</button></div>; }

function GalleryManager({ gallery, media, onChange }: { gallery: CongressRecord["gallery"]; media: AdminMediaItem[]; onChange: React.Dispatch<React.SetStateAction<CongressRecord["gallery"]>> }) {
  const [days, setDays] = useState(() => {
    const populatedDays = [...new Set(gallery.map((item) => Number(item.day) || 1))].toSorted((a, b) => a - b);
    return populatedDays.length > 0 ? populatedDays : [1];
  });
  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(() => {
    const firstDay = [...new Set(gallery.map((item) => Number(item.day) || 1))].toSorted((a, b) => a - b)[0] || 1;
    return new Set([firstDay]);
  });

  const addDay = () => setDays((current) => {
    const day = Math.max(0, ...current) + 1;
    setExpandedDays((expanded) => new Set([...expanded, day]));
    return [...current, day];
  });
  const deleteEmptyDay = (day: number) => setDays((current) => current.filter((candidate) => candidate !== day));
  const moveImage = (index: number, day: number) => onChange((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, day, label: `Day ${day}` } : item));
  const toggleDay = (day: number) => setExpandedDays((current) => {
    const next = new Set(current);
    if (next.has(day)) next.delete(day); else next.add(day);
    return next;
  });
  const focusDay = (day: number) => {
    setExpandedDays((current) => new Set([...current, day]));
    window.requestAnimationFrame(() => document.getElementById(`gallery-day-${day}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const expandAll = () => setExpandedDays(new Set(days));
  const collapseAll = () => setExpandedDays(new Set());

  return <SectionCard title="Photo gallery" action={<button type="button" onClick={addDay} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#071421] px-3 text-xs font-semibold text-white"><Plus size={14} />Add day</button>}>
    <div className="space-y-5 p-5">
      <div className="sticky top-4 z-10 rounded-2xl border border-ink-100 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-ink-900">Jump to a day</p>
            <p className="mt-0.5 text-[11px] text-ink-400">Keep the gallery compact while you work.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={expandAll} className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-ink-500 hover:bg-ink-50 hover:text-crimson-700">Expand all</button>
            <button type="button" onClick={collapseAll} className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-ink-500 hover:bg-ink-50 hover:text-crimson-700">Collapse all</button>
          </div>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-0.5" aria-label="Jump to gallery day">
          {days.map((day) => {
            const count = gallery.filter((item) => (Number(item.day) || 1) === day).length;
            return <button type="button" key={day} onClick={() => focusDay(day)} className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${expandedDays.has(day) ? "border-crimson-200 bg-crimson-50 text-crimson-700" : "border-ink-100 bg-ink-50 text-ink-600 hover:border-crimson-200 hover:text-crimson-700"}`}><span className="block text-[11px] font-semibold">Day {day}</span><span className="mt-0.5 block text-[10px] text-ink-400">{count} {count === 1 ? "image" : "images"}</span></button>;
          })}
        </nav>
      </div>
      {days.map((day) => {
        const images = gallery.map((item, index) => ({ item, index })).filter(({ item }) => (Number(item.day) || 1) === day);
        const isExpanded = expandedDays.has(day);
        return <section id={`gallery-day-${day}`} key={day} className="scroll-mt-28 overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <header className="flex items-center justify-between gap-3 border-b border-ink-100 bg-[#fafbfb] px-4 py-3">
            <button type="button" onClick={() => toggleDay(day)} aria-expanded={isExpanded} className="flex min-w-0 items-center gap-2 text-left"><ChevronDown size={16} className={`shrink-0 text-ink-400 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`} /><h3 className="text-sm font-semibold text-ink-900">Day {day}</h3><span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-ink-400">{images.length}</span></button>
            <div className="flex items-center gap-2">{images.length === 0 ? <button type="button" onClick={() => deleteEmptyDay(day)} className="grid size-8 place-items-center rounded-lg border border-crimson-100 bg-white text-crimson-600 hover:border-crimson-200 hover:bg-crimson-50" aria-label={`Delete empty Day ${day}`} title="Delete empty day"><Trash2 size={13} /></button> : null}<button type="button" onClick={() => setPickerDay(day)} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-[11px] font-semibold text-ink-700 hover:border-crimson-300 hover:text-crimson-700"><Plus size={13} />Add images</button></div>
          </header>
          {isExpanded ? images.length > 0 ? <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{images.map(({ item, index }) => <article key={`${item.src}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-ink-100 bg-ink-50"><Image src={item.src || "/arlar-logo-tight.png"} alt={item.alt || ""} fill sizes="(max-width: 640px) 50vw, 220px" className="object-cover" /><label className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"><span className="sr-only">Move image to another day</span><select aria-label={`Move image ${index + 1} to another day`} value={day} onChange={(event) => moveImage(index, Number(event.target.value))} className="h-8 cursor-pointer rounded-lg border border-white/40 bg-ink-950/80 px-2 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm outline-none">{days.map((option) => <option key={option} value={option}>Day {option}</option>)}</select></label></article>)}</div> : <button type="button" onClick={() => setPickerDay(day)} className="grid min-h-32 w-full place-items-center text-xs font-semibold text-ink-400 hover:bg-ink-50 hover:text-crimson-700">Add images to Day {day}</button> : images.length > 0 ? <button type="button" onClick={() => toggleDay(day)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-ink-50"><div className="flex -space-x-2">{images.slice(0, 4).map(({ item, index }) => <span key={`${item.src}-${index}`} className="relative size-10 overflow-hidden rounded-lg border-2 border-white bg-ink-50"><Image src={item.src || "/arlar-logo-tight.png"} alt="" fill sizes="40px" className="object-cover" /></span>)}</div><span className="text-xs font-semibold text-ink-500">{images.length} images collapsed · click to expand</span></button> : <button type="button" onClick={() => setPickerDay(day)} className="grid min-h-20 w-full place-items-center text-xs font-semibold text-ink-400 hover:bg-ink-50 hover:text-crimson-700">Add images to Day {day}</button>}
        </section>;
      })}
    </div>
    <SaveCollection />
    {pickerDay !== null ? <MediaLibraryDialog open items={media} selectKind="image" multiple title={`Add images to Day ${pickerDay}`} filter={(item) => item.kind === "image"} onClose={() => setPickerDay(null)} onSelect={() => undefined} onSelectMany={(selectedItems) => onChange((current) => { const existing = new Set(current.map((item) => item.src)); const additions = selectedItems.filter((item) => !existing.has(item.src)).map((item) => ({ day: pickerDay, label: `Day ${pickerDay}`, src: item.src, alt: item.name })); return [...current, ...additions]; })} /> : null}
  </SectionCard>;
}
