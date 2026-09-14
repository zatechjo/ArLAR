"use client";

import { FileArchive, FileSpreadsheet, FileText, Film, Presentation, Upload } from "lucide-react";
import Image from "next/image";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { AdminNativeSelect } from "@/components/admin/admin-ui";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import { createAdminMediaUploadUrlsAction, deleteAdminMediaUploadsAction, finalizeAdminMediaUploadsAction } from "@/app/(admin)/admin/(panel)/media-actions";
import type { AdminMediaItem } from "@/lib/admin-media";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

type MediaKindFilter = "all" | AdminMediaItem["kind"];

const ACCEPTED_FILES = [
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".csv", ".txt", ".zip",
  ".mp4", ".webm", ".mov", ".m4v",
].join(",");

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v"]);

export function MediaLibraryDialog({
  open,
  items,
  value,
  title = "Choose media",
  filter,
  selectKind,
  multiple = false,
  onClose,
  onSelect,
  onSelectMany,
}: {
  open: boolean;
  items: AdminMediaItem[];
  value?: string;
  title?: string;
  filter?: (item: AdminMediaItem) => boolean;
  selectKind?: AdminMediaItem["kind"];
  multiple?: boolean;
  onClose: () => void;
  onSelect: (src: string, item: AdminMediaItem) => void;
  onSelectMany?: (items: AdminMediaItem[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [kind, setKind] = useState<MediaKindFilter>("all");
  const [selected, setSelected] = useState(value || "");
  const [selectedMany, setSelectedMany] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState<AdminMediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [tab, setTab] = useState<"library" | "upload">("library");
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useModalAccessibility<HTMLDivElement>({ open, onClose });

  const source = useMemo(
    () => [...uploaded, ...items].filter((item) => !filter || filter(item)).toSorted((a, b) => b.modifiedAt - a.modifiedAt || a.name.localeCompare(b.name)),
    [filter, items, uploaded],
  );
  const folders = useMemo(() => [...new Set(source.map((item) => item.folder))].toSorted(), [source]);
  const counts = useMemo(() => ({
    all: source.length,
    image: source.filter((item) => item.kind === "image").length,
    document: source.filter((item) => item.kind === "document").length,
    video: source.filter((item) => item.kind === "video").length,
  }), [source]);
  const visible = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return source.filter((item) => (
      (folder === "all" || item.folder === folder)
      && (kind === "all" || item.kind === kind)
      && (!needle || `${item.name} ${item.filename} ${item.folder} ${item.extension}`.toLowerCase().includes(needle))
    ));
  }, [deferredQuery, folder, kind, source]);
  const selectedItem = useMemo(() => source.find((item) => item.src === selected), [selected, source]);
  const canSelect = Boolean(selectedItem && (!selectKind || selectedItem.kind === selectKind));
  const selectedItems = useMemo(() => selectedMany.map((src) => source.find((item) => item.src === src)).filter((item): item is AdminMediaItem => Boolean(item)), [selectedMany, source]);
  const canSelectMany = selectedItems.length > 0 && selectedItems.every((item) => !selectKind || item.kind === selectKind);

  if (!open) return null;

  const receiveFiles = async (files: FileList | null) => {
    const acceptedFiles = Array.from(files ?? []).filter((file) => {
      const itemKind = kindFromExtension(file.name.split(".").pop()?.toLowerCase() || "");
      return Boolean(itemKind && (!selectKind || itemKind === selectKind));
    });
    if (acceptedFiles.length === 0) return;
    setUploadError("");
    setIsUploading(true);
    let accepted: AdminMediaItem[] = [];
    try {
      const descriptors = await createAdminMediaUploadUrlsAction(acceptedFiles.map((file) => ({ name: file.name, type: file.type, size: file.size })));
      try {
        await Promise.all(descriptors.map(async (descriptor, index) => {
          const response = await fetch(descriptor.uploadUrl, { method: "PUT", headers: { "Content-Type": descriptor.contentType }, body: acceptedFiles[index] });
          if (!response.ok) throw new Error(`${descriptor.filename} could not be uploaded to Cloudflare R2.`);
        }));
      } catch (error) {
        await deleteAdminMediaUploadsAction(descriptors.map((descriptor) => descriptor.key)).catch(() => undefined);
        throw error;
      }
      accepted = await finalizeAdminMediaUploadsAction(descriptors.map(({ key, name, filename, kind, extension, size, contentType }) => ({ key, name, filename, kind, extension, size, contentType })));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "The files could not be uploaded.");
    } finally {
      setIsUploading(false);
    }
    if (accepted.length === 0) return;
    setUploaded((current) => [...accepted, ...current]);
    if (multiple) setSelectedMany((current) => [...new Set([...accepted.map((item) => item.src), ...current])]);
    else setSelected(accepted[0].src);
    setKind(accepted[0].kind);
    setTab("library");
    setFolder("all");
  };

  const selectedIsWrongKind = Boolean(selectedItem && selectKind && selectedItem.kind !== selectKind);
  const selectionPrompt = selectedIsWrongKind
    ? `This field requires an ${selectKind}. You can still browse and manage other files here.`
    : selectedItem
      ? `Selected: ${selectedItem.filename}`
      : "Select a file to continue";
  const selectLabel = selectKind === "image"
    ? "Use selected image"
    : selectKind === "document"
      ? "Use selected document"
    : "Use selected file";
  const multiSelectionPrompt = selectedItems.length > 0 ? `${selectedItems.length} ${selectedItems.length === 1 ? "image" : "images"} selected` : "Select one or more images";

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#03101c]/70 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <AdminPendingOverlay visible={isUploading} label="Uploading media…" />
      <div ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_35px_120px_rgba(0,0,0,.35)]">
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4 sm:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-crimson-600">Website media</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-ink-950">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-xl bg-ink-50 text-lg text-ink-600 hover:bg-ink-100" aria-label="Close">×</button>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="border-b border-ink-100 bg-[#f8faf9] p-4 lg:border-b-0 lg:border-r">
            <div className="grid grid-cols-2 rounded-xl border border-ink-200 bg-white p-1 lg:grid-cols-1">
              <button type="button" onClick={() => setTab("library")} className={`rounded-lg px-3 py-2.5 text-left text-xs font-semibold ${tab === "library" ? "bg-ink-950 text-white" : "text-ink-500"}`}>Media library <span className="opacity-60">{source.length}</span></button>
              <button type="button" onClick={() => setTab("upload")} className={`rounded-lg px-3 py-2.5 text-left text-xs font-semibold ${tab === "upload" ? "bg-ink-950 text-white" : "text-ink-500"}`}>Upload files</button>
            </div>
            {tab === "library" ? (
              <div className="mt-5 hidden lg:block">
                <p className="px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-ink-400">Folders</p>
                <div className="mt-2 max-h-[52vh] space-y-0.5 overflow-y-auto pr-1">
                  <FolderButton active={folder === "all"} label="All media" count={source.length} onClick={() => setFolder("all")} />
                  {folders.map((item) => <FolderButton key={item} active={folder === item} label={item} count={source.filter((media) => media.folder === item).length} onClick={() => setFolder(item)} />)}
                </div>
              </div>
            ) : null}
          </aside>

          <main className="flex min-h-0 flex-col">
            {tab === "library" ? (
              <>
                <div className="border-b border-ink-100 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
                      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search filenames, types, and folders…" className="h-11 w-full rounded-xl border border-ink-200 pl-10 pr-3 text-sm outline-none focus:border-crimson-400" />
                    </div>
                    <div className="lg:hidden">
                      <AdminNativeSelect aria-label="Media folder" value={folder} onChange={(event) => setFolder(event.target.value)}>
                        <option value="all">All folders</option>
                        {folders.map((item) => <option key={item} value={item}>{item}</option>)}
                      </AdminNativeSelect>
                    </div>
                    <button type="button" disabled={isUploading} onClick={() => inputRef.current?.click()} className="h-11 rounded-xl border border-ink-200 bg-white px-4 text-xs font-semibold text-ink-700 hover:border-crimson-300 hover:text-crimson-700 disabled:cursor-wait disabled:opacity-60">{isUploading ? "Uploading…" : multiple ? "Upload images" : "Upload files"}</button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2" aria-label="Filter media by file type">
                    <KindButton active={kind === "all"} label="All" count={counts.all} onClick={() => setKind("all")} />
                    <KindButton active={kind === "image"} label="Images" count={counts.image} onClick={() => setKind("image")} />
                    <KindButton active={kind === "document"} label="Documents" count={counts.document} onClick={() => setKind("document")} />
                    {counts.video > 0 ? <KindButton active={kind === "video"} label="Videos" count={counts.video} onClick={() => setKind("video")} /> : null}
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                  <p className="mb-3 text-[10px] font-semibold text-ink-400">{visible.length} {visible.length === 1 ? "asset" : "assets"}</p>
                  {visible.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                      {visible.map((item, index) => <MediaCard key={`${item.src}-${index}`} item={item} selected={multiple ? selectedMany.includes(item.src) : selected === item.src} onSelect={() => multiple ? setSelectedMany((current) => current.includes(item.src) ? current.filter((src) => src !== item.src) : [...current, item.src]) : setSelected(item.src)} />)}
                    </div>
                  ) : (
                    <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-ink-200 bg-[#fafbfb] text-center">
                      <div><p className="text-sm font-semibold text-ink-700">No matching files</p><p className="mt-1 text-xs text-ink-400">Try another folder, file type, or search.</p></div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="grid min-h-[420px] place-items-center p-6">
                <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); receiveFiles(event.dataTransfer.files); }} className="flex w-full max-w-xl flex-col items-center rounded-3xl border border-dashed border-ink-300 bg-[#f8faf9] px-6 py-16 text-center hover:border-crimson-300">
                  <span className="grid size-14 place-items-center rounded-2xl bg-white text-crimson-700 shadow-sm"><Upload size={22} /></span>
                  <strong className="mt-5 text-base text-ink-900">{isUploading ? "Uploading…" : "Drop files here"}</strong>
                  <span className="mt-2 max-w-md text-xs leading-5 text-ink-500">Images, PDFs, Word documents, spreadsheets, presentations, archives, text files, and videos are supported.</span>
                  <span className="mt-5 rounded-xl bg-crimson-700 px-4 py-2.5 text-xs font-semibold text-white">Browse files</span>
                </button>
              </div>
            )}
          </main>
        </div>

        <footer className="flex flex-col items-stretch justify-between gap-3 border-t border-ink-100 bg-[#fafbfb] px-5 py-4 sm:flex-row sm:items-center sm:px-7">
          <p className={`truncate text-[11px] ${uploadError || selectedIsWrongKind ? "font-semibold text-amber-700" : "text-ink-500"}`}>{uploadError || (multiple ? multiSelectionPrompt : selectionPrompt)}</p>
          <div className="flex shrink-0 justify-end gap-2">
            <button type="button" onClick={onClose} className="h-10 rounded-xl border border-ink-200 bg-white px-4 text-xs font-semibold text-ink-700">Cancel</button>
            <button type="button" disabled={multiple ? !canSelectMany : !canSelect} onClick={() => { if (multiple && canSelectMany) onSelectMany?.(selectedItems); else if (selectedItem && canSelect) onSelect(selectedItem.src, selectedItem); onClose(); }} className="h-10 rounded-xl bg-crimson-700 px-5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-35">{multiple ? `Add ${selectedItems.length || ""} ${selectedItems.length === 1 ? "image" : "images"}` : selectLabel}</button>
          </div>
        </footer>
        <input ref={inputRef} type="file" accept={selectKind === "image" ? ".jpg,.jpeg,.png,.webp,.gif,.svg,.avif" : ACCEPTED_FILES} multiple className="hidden" disabled={isUploading} onChange={(event) => { void receiveFiles(event.target.files); event.target.value = ""; }} />
      </div>
    </div>
  );
}

function MediaCard({ item, selected, onSelect }: { item: AdminMediaItem; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className={`group overflow-hidden rounded-xl border bg-white text-left transition ${selected ? "border-crimson-600 ring-2 ring-crimson-100" : "border-ink-100 hover:border-ink-300"}`}>
      <div className="relative aspect-square overflow-hidden bg-[#f4f6f5]">
        {item.kind === "image" ? (
          <Image src={item.src} alt="" fill unoptimized={item.src.startsWith("blob:")} className="object-contain p-2 transition duration-300 group-hover:scale-[1.03]" />
        ) : (
          <FilePreview item={item} />
        )}
        <span className="absolute left-2 top-2 rounded-md bg-ink-950/80 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">{item.extension || item.kind}</span>
      </div>
      <div className="border-t border-ink-100 px-2.5 py-2">
        <p className="truncate text-[10px] font-semibold text-ink-700" title={item.filename}>{item.name}</p>
        <div className="mt-0.5 flex items-center justify-between gap-2 text-[9px] text-ink-400"><span className="truncate">{item.folder}</span><span className="shrink-0">{formatBytes(item.size)}</span></div>
      </div>
    </button>
  );
}

function FilePreview({ item }: { item: AdminMediaItem }) {
  const iconClass = "h-10 w-10";
  const icon = item.kind === "video"
    ? <Film className={iconClass} />
    : item.extension === "zip"
      ? <FileArchive className={iconClass} />
      : ["xls", "xlsx", "csv"].includes(item.extension)
        ? <FileSpreadsheet className={iconClass} />
        : ["ppt", "pptx"].includes(item.extension)
          ? <Presentation className={iconClass} />
          : <FileText className={iconClass} />;
  return <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_top,#ffffff_0%,#f1f4f3_72%)] text-ink-500"><div className="text-center"><span className="mx-auto grid size-20 place-items-center rounded-2xl border border-white bg-white/80 text-crimson-700">{icon}</span><p className="mt-3 text-[9px] font-bold uppercase tracking-[0.16em] text-ink-400">{item.kind}</p></div></div>;
}

function KindButton({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold transition ${active ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 bg-white text-ink-500 hover:border-ink-300"}`}>{label} <span className="ml-1 opacity-55">{count}</span></button>;
}

function FolderButton({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[10px] font-medium ${active ? "bg-white text-crimson-700 shadow-sm" : "text-ink-500 hover:bg-white/70"}`}><span className="truncate">{label}</span><span className="ml-2 text-ink-300">{count}</span></button>;
}

function kindFromExtension(extension: string): AdminMediaItem["kind"] | null {
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "txt", "zip"].includes(extension)) return "document";
  return null;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(bytes >= 10 * 1024 ** 2 ? 0 : 1)} MB`;
}
