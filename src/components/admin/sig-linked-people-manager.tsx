"use client";

import { GripVertical, Save } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { setSigDoctorOrderAction } from "@/app/(admin)/admin/(panel)/sigs/actions";
import { DoctorAvatar } from "@/components/about/doctor-avatar";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";

export type SigLinkedPerson = {
  doctorId: string;
  appearanceId: string;
  fullName: string;
  country: string;
  credentials: string;
  image: string;
  imagePosition?: string;
  role: string;
  section: string;
  sortOrder: number;
};

function orderedSections(sections: string[]) {
  return [...new Set(sections)].toSorted((a, b) => {
    const rank = (section: string) => section.toLowerCase().includes("board") ? 0 : section.toLowerCase().includes("member") ? 1 : 2;
    return rank(a) - rank(b) || a.localeCompare(b);
  });
}

function tabLabel(section: string) {
  return section.toLowerCase().includes("board") ? "Board" : section;
}

function placementKey(person: Pick<SigLinkedPerson, "doctorId" | "appearanceId">) {
  return `${person.doctorId}\u0000${person.appearanceId}`;
}

export function SigLinkedPeopleManager({ slug, initialPeople, sections }: { slug: string; initialPeople: SigLinkedPerson[]; sections: string[] }) {
  const router = useRouter();
  const [people, setPeople] = useState(initialPeople);
  const [activeSection, setActiveSection] = useState(() => orderedSections(sections)[0] || "");
  const [dirtySections, setDirtySections] = useState<string[]>([]);
  const [draggedPlacement, setDraggedPlacement] = useState("");
  const [dragTarget, setDragTarget] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const displaySections = useMemo(() => orderedSections(sections), [sections]);
  const visiblePeople = useMemo(() => people
    .filter((person) => !activeSection || person.section === activeSection)
    .toSorted((a, b) => a.sortOrder - b.sortOrder || a.fullName.localeCompare(b.fullName)), [activeSection, people]);

  function reorderPlacement(sourceKey: string, targetKey: string) {
    if (!sourceKey || sourceKey === targetKey) return;
    const source = people.find((person) => placementKey(person) === sourceKey);
    const target = people.find((person) => placementKey(person) === targetKey);
    if (!source || !target || source.section !== target.section) return;

    setPeople((current) => {
      const sectionPeople = current
        .filter((person) => person.section === source.section)
        .toSorted((a, b) => a.sortOrder - b.sortOrder || a.fullName.localeCompare(b.fullName));
      const sourceIndex = sectionPeople.findIndex((person) => placementKey(person) === sourceKey);
      const targetIndex = sectionPeople.findIndex((person) => placementKey(person) === targetKey);
      if (sourceIndex < 0 || targetIndex < 0) return current;

      const reordered = [...sectionPeople];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      const order = new Map(reordered.map((person, index) => [placementKey(person), index + 1]));
      return current.map((person) => ({ ...person, sortOrder: order.get(placementKey(person)) ?? person.sortOrder }));
    });
    setDirtySections((current) => current.includes(source.section) ? current : [...current, source.section]);
    setError("");
  }

  function moveWithKeyboard(person: SigLinkedPerson, direction: -1 | 1) {
    const sectionPeople = people
      .filter((item) => item.section === person.section)
      .toSorted((a, b) => a.sortOrder - b.sortOrder || a.fullName.localeCompare(b.fullName));
    const index = sectionPeople.findIndex((item) => placementKey(item) === placementKey(person));
    const target = sectionPeople[index + direction];
    if (target) reorderPlacement(placementKey(person), placementKey(target));
  }

  function saveOrder() {
    if (dirtySections.length === 0) return;
    const sectionOrders = dirtySections.map((section) => ({
      section,
      orderedPlacements: people
        .filter((person) => person.section === section)
        .toSorted((a, b) => a.sortOrder - b.sortOrder || a.fullName.localeCompare(b.fullName))
        .map((person) => ({ doctorId: person.doctorId, appearanceId: person.appearanceId })),
    }));
    setError("");
    startTransition(async () => {
      try {
        await setSigDoctorOrderAction(slug, sectionOrders);
        setDirtySections([]);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "The public order could not be updated.");
      }
    });
  }

  return (
    <div className="relative">
      <div className="flex flex-col gap-3 border-b border-ink-100 bg-ink-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        {displaySections.length > 1 ? (
          <div className="flex gap-1" role="tablist" aria-label="SIG people sections">
            {displaySections.map((section) => {
              const active = section === activeSection;
              const count = people.filter((person) => person.section === section).length;
              return <button key={section} type="button" role="tab" aria-selected={active} onClick={() => setActiveSection(section)} className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition ${active ? "bg-white text-crimson-700 shadow-sm ring-1 ring-ink-100" : "text-ink-500 hover:text-ink-900"}`}>{tabLabel(section)} <span className="ml-1 text-[10px] opacity-60">{count}</span></button>;
            })}
          </div>
        ) : <p className="text-xs font-semibold text-ink-500">Arrange the public website order</p>}
        <div className="flex items-center gap-3 sm:justify-end">
          {dirtySections.length > 0 ? <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">Unsaved order changes</span> : <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">Order saved</span>}
          <button type="button" onClick={saveOrder} disabled={dirtySections.length === 0 || isPending} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#071421] px-3 text-xs font-semibold text-white transition hover:bg-[#142535] disabled:cursor-not-allowed disabled:opacity-35"><Save size={14} />{isPending ? "Saving..." : "Save order"}</button>
        </div>
      </div>

      <div className={`transition duration-200 ${isPending ? "pointer-events-none select-none blur-[2px] opacity-55" : ""}`} aria-busy={isPending}>
        {visiblePeople.length > 0 ? <div className="hidden grid-cols-[64px_minmax(240px,1fr)_minmax(180px,0.8fr)_72px] gap-4 border-b border-ink-100 bg-[#fafbfb] px-7 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400 md:grid"><span>Order</span><span>Doctor</span><span>Title</span><span className="text-right">Drag</span></div> : null}
        <div className="divide-y divide-ink-100">
          {visiblePeople.map((person) => {
            const key = placementKey(person);
            const isDragged = draggedPlacement === key;
            const isDragTarget = dragTarget === key && !isDragged;
            return (
            <article
              key={key}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragTarget(key);
                reorderPlacement(draggedPlacement, key);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDraggedPlacement("");
                setDragTarget("");
              }}
              className={`grid gap-3 px-5 py-4 transition sm:px-7 md:grid-cols-[64px_minmax(240px,1fr)_minmax(180px,0.8fr)_72px] md:items-center md:gap-4 ${isDragged ? "bg-ink-50 opacity-45" : "bg-white"} ${isDragTarget ? "shadow-[inset_0_2px_0_#009867]" : ""}`}
            >
              <div className="font-display text-lg font-semibold tabular-nums text-ink-300">{String(person.sortOrder).padStart(2, "0")}</div>
              <Link href={`/admin/doctors/${person.doctorId}`} className="flex min-w-0 items-center gap-3 rounded-xl outline-none transition hover:text-crimson-700 focus-visible:ring-2 focus-visible:ring-crimson-500">
                <DoctorAvatar imageSrc={person.image} name={person.fullName} imagePosition={person.imagePosition || "center top"} sizes="44px" className="size-11 shrink-0 rounded-xl" fallbackClassName="bg-[#071421] text-white" initialsClassName="text-xs font-semibold" />
                <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink-950">{person.fullName}</span><span className="mt-1 block truncate text-[11px] text-ink-400">{person.country}{person.credentials ? ` · ${person.credentials}` : ""}</span></span>
              </Link>
              <div><p className="text-xs font-semibold text-crimson-700">{person.role || "SIG member"}</p><p className="mt-1 text-[10px] text-ink-400 md:hidden">{tabLabel(person.section)}</p></div>
              <div className="flex md:justify-end">
                <button
                  type="button"
                  draggable={!isPending}
                  disabled={isPending}
                  aria-label={`Drag ${person.fullName} to reorder. Use Alt and arrow keys for keyboard reordering.`}
                  title="Drag to reorder"
                  onDragStart={(event) => {
                    setDraggedPlacement(key);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", key);
                  }}
                  onDragEnd={() => {
                    setDraggedPlacement("");
                    setDragTarget("");
                  }}
                  onKeyDown={(event) => {
                    if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
                    event.preventDefault();
                    moveWithKeyboard(person, event.key === "ArrowUp" ? -1 : 1);
                  }}
                  className="grid size-10 cursor-grab place-items-center rounded-xl border border-ink-200 bg-white text-ink-400 transition hover:border-jade-300 hover:bg-jade-50 hover:text-jade-800 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <GripVertical size={17} />
                </button>
              </div>
            </article>
          )})}
          {visiblePeople.length === 0 ? <div className="px-5 py-12 text-center sm:px-7"><p className="text-sm font-semibold text-ink-700">No doctors are linked yet</p><p className="mt-2 text-xs text-ink-400">Add a doctor from the unified directory to publish them in this SIG.</p></div> : null}
        </div>
      </div>
      {error ? <p role="alert" className="m-4 rounded-xl border border-crimson-200 bg-crimson-50 px-3 py-2 text-xs text-crimson-800">{error}</p> : null}
      <AdminPendingOverlay visible={isPending} label="Saving public order..." />
    </div>
  );
}
