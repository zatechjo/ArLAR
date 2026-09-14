"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { MediaLibraryDialog } from "@/components/admin/media-library-dialog";
import type { AdminMediaItem } from "@/lib/admin-media";

export function NewsImageUploader({
  name,
  value,
  media,
  onChange,
  label = "Image",
}: {
  name: string;
  value: string;
  media: AdminMediaItem[];
  onChange: (url: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {label ? <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label> : null}
      <input type="hidden" name={name} value={value} />
      {value ? (
        <div className="space-y-3">
          <div className="relative inline-block">
            <Image src={value} alt="" width={220} height={150} unoptimized={value.startsWith("blob:") || value.startsWith("data:")} className="h-32 w-auto max-w-full rounded-xl border border-slate-200 object-cover" />
            <button type="button" onClick={() => onChange("")} className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/85 text-white shadow transition hover:bg-slate-950" aria-label="Remove image" title="Remove image"><X size={14} /></button>
          </div>
          <button type="button" onClick={() => setOpen(true)} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-crimson-300 hover:text-crimson-700"><ImagePlus size={16} />Change using Website Media</button>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-crimson-400 hover:text-crimson-600">
          <ImagePlus size={21} />
          <span className="text-xs font-semibold">Choose from Website Media</span>
          <span className="text-[10px] text-slate-400">Browse existing files or upload a new one</span>
        </button>
      )}
      {open ? <MediaLibraryDialog open items={media} value={value} selectKind="image" title="Select news cover image" onClose={() => setOpen(false)} onSelect={onChange} /> : null}
    </div>
  );
}
