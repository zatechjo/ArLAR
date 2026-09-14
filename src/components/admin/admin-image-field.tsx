"use client";

import { Crop, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { MediaLibraryDialog } from "@/components/admin/media-library-dialog";
import type { AdminMediaItem } from "@/lib/admin-media";

type CropPosition = { x: number; y: number };

export function AdminImageField({
  label,
  name,
  value: initialValue,
  items,
  hint,
  filter,
  aspect = "video",
  shape = "rounded",
  fit = "contain",
  enableCrop = false,
  initialObjectPosition,
  onChange,
}: {
  label?: string;
  name?: string;
  value?: string;
  items: AdminMediaItem[];
  hint?: string;
  filter?: (item: AdminMediaItem) => boolean;
  aspect?: "video" | "flag" | "square" | "portrait";
  shape?: "rounded" | "circle";
  fit?: "cover" | "contain";
  enableCrop?: boolean;
  initialObjectPosition?: string;
  onChange?: (value: string) => void;
}) {
  const initialCrop = parseObjectPosition(initialObjectPosition);
  const [value, setValue] = useState(initialValue || "");
  const [open, setOpen] = useState(false);
  const [crop, setCrop] = useState<CropPosition>(initialCrop);
  const [cropDirty, setCropDirty] = useState(false);
  const [cropActive, setCropActive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<({ clientX: number; clientY: number } & CropPosition) | null>(null);
  const fieldName = name || label?.toLowerCase().replaceAll(" ", "-") || "image";
  const aspectClass = aspect === "square" ? "aspect-square" : aspect === "portrait" ? "aspect-[4/5]" : aspect === "flag" ? "aspect-[3/2]" : "aspect-video";
  const previewWidth = shape === "circle" ? "max-w-40" : aspect === "flag" ? "max-w-28" : aspect === "portrait" ? "max-w-[13rem]" : "max-w-[15rem]";
  const controlsWidth = "max-w-[13rem]";
  const frameRadius = shape === "circle" ? "rounded-full" : "rounded-xl";

  function update(next: string) {
    setValue(next);
    onChange?.(next);
  }

  function selectImage(next: string) {
    update(next);
    if (enableCrop && next !== value) {
      setCrop({ x: 50, y: 20 });
      setCropDirty(true);
      setCropActive(false);
    }
  }

  function adjustCrop(dx: number, dy: number) {
    setCrop((current) => ({ x: clamp(current.x + dx), y: clamp(current.y + dy) }));
    setCropDirty(true);
  }

  return (
    <div>
      {label || hint ? (
        <div className="mb-3">
          {label ? <p className="text-xs font-semibold text-ink-700">{label}</p> : null}
          {hint ? <p className="mt-1 text-[10px] leading-5 text-ink-400">{hint}</p> : null}
        </div>
      ) : null}

      <input type="hidden" name={fieldName} value={value} />
      {enableCrop ? (
        <>
          <input type="hidden" name={`${fieldName}_crop_x`} value={crop.x} />
          <input type="hidden" name={`${fieldName}_crop_y`} value={crop.y} />
          <input type="hidden" name={`${fieldName}_crop_dirty`} value={cropDirty ? "true" : "false"} />
        </>
      ) : null}

      {value ? (
        <div>
          <div className={`${previewWidth} mx-auto`}>
            <div
            role={enableCrop && cropActive ? "group" : undefined}
            tabIndex={enableCrop && cropActive ? 0 : undefined}
            aria-label={enableCrop && cropActive ? "Image crop. Drag the image or use the arrow keys to adjust its framing." : undefined}
            onPointerDown={enableCrop && cropActive ? (event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              dragStart.current = { clientX: event.clientX, clientY: event.clientY, ...crop };
              setDragging(true);
            } : undefined}
            onPointerMove={enableCrop && cropActive ? (event) => {
              if (!dragStart.current) return;
              const bounds = event.currentTarget.getBoundingClientRect();
              setCrop({
                x: clamp(dragStart.current.x - ((event.clientX - dragStart.current.clientX) / bounds.width) * 100),
                y: clamp(dragStart.current.y - ((event.clientY - dragStart.current.clientY) / bounds.height) * 100),
              });
              setCropDirty(true);
            } : undefined}
            onPointerUp={enableCrop && cropActive ? (event) => {
              event.currentTarget.releasePointerCapture(event.pointerId);
              dragStart.current = null;
              setDragging(false);
            } : undefined}
            onPointerCancel={enableCrop && cropActive ? () => {
              dragStart.current = null;
              setDragging(false);
            } : undefined}
            onKeyDown={enableCrop && cropActive ? (event) => {
              const step = event.shiftKey ? 10 : 2;
              if (event.key === "ArrowLeft") adjustCrop(-step, 0);
              else if (event.key === "ArrowRight") adjustCrop(step, 0);
              else if (event.key === "ArrowUp") adjustCrop(0, -step);
              else if (event.key === "ArrowDown") adjustCrop(0, step);
              else return;
              event.preventDefault();
            } : undefined}
              className={`relative w-full overflow-hidden border border-ink-200 bg-[#f7f9f8] outline-none focus:border-jade-500 focus:ring-2 focus:ring-jade-100 ${frameRadius} ${aspectClass} ${enableCrop && cropActive ? `touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}` : ""}`}
            >
              <Image
                src={value}
                alt=""
                fill
                sizes={shape === "circle" ? "160px" : aspect === "flag" ? "112px" : aspect === "portrait" ? "208px" : "240px"}
                unoptimized={value.startsWith("data:")}
                draggable={false}
                className={`pointer-events-none select-none ${fit === "cover" || enableCrop ? "object-cover" : "object-contain p-1.5"}`}
                style={enableCrop ? { objectPosition: `${crop.x}% ${crop.y}%` } : undefined}
              />
              {enableCrop && cropActive ? <CropGrid /> : null}
            </div>
          </div>

          <div className={`${controlsWidth} mx-auto mt-5 grid w-full grid-cols-2 gap-3`}>
            <button type="button" onClick={() => setOpen(true)} className="min-h-11 rounded-xl bg-[#071421] px-3 text-xs font-semibold text-white transition hover:bg-[#142535]">Change</button>
            <button type="button" onClick={() => { setCropActive(false); setCropDirty(false); update(""); }} className="min-h-11 rounded-xl border border-ink-200 bg-white px-3 text-xs font-semibold text-crimson-700 transition hover:border-crimson-200 hover:bg-crimson-50">Remove</button>
          </div>

          {enableCrop ? (
            <div className={`${controlsWidth} mx-auto mt-3 flex min-h-11 w-full items-center gap-2 rounded-xl border border-ink-100 bg-ink-50 p-1.5`}>
              <button
                type="button"
                aria-pressed={cropActive}
                onClick={() => setCropActive((current) => !current)}
                className={`inline-flex min-h-8 flex-1 items-center justify-center gap-2 rounded-lg px-2 text-[10px] font-semibold transition ${cropActive ? "bg-white text-jade-700 shadow-sm" : "text-ink-500 hover:bg-white hover:text-jade-700"}`}
              >
                <Crop size={14} />
                {cropActive ? "Done repositioning" : "Drag to reposition"}
              </button>
              <button type="button" onClick={() => { setCrop({ x: 50, y: 20 }); setCropDirty(true); }} className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-white hover:text-jade-700" aria-label="Reset crop" title="Reset crop"><RotateCcw size={14} /></button>
            </div>
          ) : null}
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={`${previewWidth} ${aspectClass} ${frameRadius} mx-auto grid w-full place-items-center border border-dashed border-ink-300 bg-[#f7f9f8] text-xs font-semibold text-ink-500 transition hover:border-crimson-300 hover:text-crimson-700`}>Choose image</button>
      )}

      {open ? <MediaLibraryDialog open items={items} value={value} filter={filter} selectKind="image" title={label ? `Select ${label.toLowerCase()}` : "Select image"} onClose={() => setOpen(false)} onSelect={selectImage} /> : null}
    </div>
  );
}

function CropGrid() {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-white/65 shadow-[0_0_1px_rgba(15,23,42,0.8)]" />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-white/65 shadow-[0_0_1px_rgba(15,23,42,0.8)]" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-white/65 shadow-[0_0_1px_rgba(15,23,42,0.8)]" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-white/65 shadow-[0_0_1px_rgba(15,23,42,0.8)]" />
    </>
  );
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function parseObjectPosition(position?: string): CropPosition {
  if (!position) return { x: 50, y: 20 };
  const [horizontal = "center", vertical = "20%"] = position.trim().toLowerCase().split(/\s+/);
  return { x: positionValue(horizontal, "x"), y: positionValue(vertical, "y") };
}

function positionValue(value: string, axis: "x" | "y") {
  if (value.endsWith("%")) return clamp(Number.parseFloat(value) || 0);
  if (value === "center") return 50;
  if ((axis === "x" && value === "right") || (axis === "y" && value === "bottom")) return 100;
  return 0;
}
