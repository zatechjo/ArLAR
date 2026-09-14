"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Check, ChevronDown } from "@/components/icons";

export type SelectOption = {
  value: string;
  label: string;
  meta?: string;
};

type CustomSelectProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  tone?: "jade" | "purple" | "crimson";
};

export function CustomSelect({
  label,
  value,
  options,
  onChange,
  tone = "jade",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labelId = useId();
  const listboxId = useId();
  const selectedOption = options[selectedIndex];

  const accent =
    tone === "purple"
      ? {
          focus: "focus:border-[#9c69b8] focus:outline-[#c9a9dc]",
          option: "bg-[#f1e7f5] text-[#5a197e]",
          icon: "text-[#7a2aad]",
        }
      : tone === "crimson"
        ? {
            focus: "focus:border-crimson-500 focus:outline-crimson-200",
            option: "bg-crimson-50 text-crimson-800",
            icon: "text-crimson-600",
          }
      : {
          focus: "focus:border-jade-500 focus:outline-jade-200",
          option: "bg-jade-50 text-jade-800",
          icon: "text-jade-700",
        };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    rootRef.current
      ?.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const chooseOption = (index: number) => {
    const option = options[index];
    if (!option) return;

    onChange(option.value);
    setActiveIndex(index);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const openMenu = () => {
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  return (
    <div ref={rootRef} className="relative">
      <span
        id={labelId}
        className="mb-2 block font-display text-[10px] font-semibold tracking-[0.14em] text-ink-400 uppercase"
      >
        {label}
      </span>

      <button
        ref={triggerRef}
        type="button"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!open) openMenu();
            else
              setActiveIndex((current) =>
                Math.min(current + 1, options.length - 1),
              );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) openMenu();
            else setActiveIndex((current) => Math.max(current - 1, 0));
          } else if (event.key === "Home" && open) {
            event.preventDefault();
            setActiveIndex(0);
          } else if (event.key === "End" && open) {
            event.preventDefault();
            setActiveIndex(options.length - 1);
          } else if ((event.key === "Enter" || event.key === " ") && open) {
            event.preventDefault();
            chooseOption(activeIndex);
          } else if (event.key === "Escape" && open) {
            event.preventDefault();
            setOpen(false);
          }
        }}
        className={
          "flex h-12 w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-ink-200 bg-white px-4 text-left outline-2 outline-transparent transition-[border-color,outline-color,background-color] hover:border-ink-300 " +
          accent.focus
        }
      >
        <span className="min-w-0 truncate font-display text-[13px] font-semibold text-ink-800">
          {selectedOption?.label}
        </span>
        <ChevronDown
          className={
            "size-4 shrink-0 transition-transform duration-300 " +
            accent.icon +
            (open ? " rotate-180" : "")
          }
        />
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-ink-200 bg-white p-1.5 shadow-xl shadow-ink-950/10"
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            const active = index === activeIndex;

            return (
              <button
                key={option.value}
                id={`${listboxId}-option-${index}`}
                data-option-index={index}
                type="button"
                role="option"
                aria-selected={selected}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => chooseOption(index)}
                className={
                  "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 text-left transition-colors " +
                  (selected
                    ? accent.option
                    : active
                      ? "bg-ink-50 text-ink-950"
                      : "text-ink-600")
                }
              >
                <span className="min-w-0">
                  <span className="block font-display text-[12px] font-semibold leading-5">
                    {option.label}
                  </span>
                  {option.meta ? (
                    <span className="mt-0.5 block text-[10px] leading-4 text-ink-400">
                      {option.meta}
                    </span>
                  ) : null}
                </span>
                {selected ? (
                  <Check className={"size-4 shrink-0 " + accent.icon} />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
