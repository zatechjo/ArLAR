"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addDoctorToSigAction } from "@/app/(admin)/admin/(panel)/sigs/actions";
import { DoctorAvatar } from "@/components/about/doctor-avatar";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import { AdminNativeSelect, AdminSearchField } from "@/components/admin/admin-ui";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

export type SigDirectoryDoctor = { id: string; fullName: string; country: string; image: string; imagePosition?: string };

export function SigDoctorPicker({ slug, groupName, doctors, linkedPlacements, sections }: { slug: string; groupName: string; doctors: SigDirectoryDoctor[]; linkedPlacements: { doctorId: string; section: string }[]; sections: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [section, setSection] = useState(sections[0] || "Members");
  const [role, setRole] = useState("SIG member");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const modalRef = useModalAccessibility<HTMLDivElement>({ open, onClose: () => !isPending && setOpen(false) });
  const linked = useMemo(() => new Set(linkedPlacements.map((item) => `${item.doctorId}\u0000${item.section.toLowerCase()}`)), [linkedPlacements]);
  const available = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return doctors.filter((doctor) => !linked.has(`${doctor.id}\u0000${section.toLowerCase()}`) && (!needle || `${doctor.fullName} ${doctor.country}`.toLowerCase().includes(needle)));
  }, [deferredQuery, doctors, linked, section]);
  const selected = doctors.find((doctor) => doctor.id === doctorId);

  function addDoctor() {
    if (!doctorId) return;
    setError("");
    const data = new FormData();
    data.set("doctor_id", doctorId);
    data.set("section", section);
    data.set("role", role);
    startTransition(async () => {
      try {
        await addDoctorToSigAction(slug, data);
        setOpen(false);
        setQuery("");
        setDoctorId("");
        setRole("SIG member");
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "The doctor could not be linked.");
      }
    });
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#071421] px-3 text-xs font-semibold text-white transition hover:bg-[#142535]"><Plus size={14} />Add doctor to SIG</button>
    <AdminPendingOverlay visible={isPending} label="Adding doctor to SIG…" />
    {open ? <div className="fixed inset-0 z-[250] grid place-items-center bg-[#03101c]/65 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !isPending) setOpen(false); }}>
      <div ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="sig-doctor-picker-title" className="flex max-h-[min(780px,92vh)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,.3)]">
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-crimson-600">Doctor directory</p><h2 id="sig-doctor-picker-title" className="mt-1 text-xl font-semibold text-ink-950">Add doctor to {groupName}</h2></div><button type="button" disabled={isPending} onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-xl bg-ink-50 text-ink-500 hover:bg-ink-100 disabled:opacity-40" aria-label="Close doctor picker"><X size={17} /></button></div>
        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="flex min-h-0 flex-col border-b border-ink-100 p-5 lg:border-b-0 lg:border-r"><AdminSearchField value={query} onChange={setQuery} placeholder="Search the doctor directory…" /><div className="mt-4 grid max-h-[min(52vh,26rem)] min-h-0 auto-rows-min content-start gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {available.map((doctor) => { const active = doctorId === doctor.id; return <button key={doctor.id} type="button" onClick={() => setDoctorId(doctor.id)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${active ? "border-crimson-300 bg-crimson-50 ring-1 ring-crimson-100" : "border-ink-100 hover:border-ink-300"}`}><DoctorAvatar imageSrc={doctor.image} name={doctor.fullName} imagePosition={doctor.imagePosition || "center top"} sizes="44px" className="size-11 shrink-0 rounded-xl" fallbackClassName="bg-[#071421] text-white" initialsClassName="text-xs font-semibold" /><span className="min-w-0"><span className="block truncate text-xs font-semibold text-ink-900">{doctor.fullName}</span><span className="mt-1 block text-[10px] text-ink-400">{doctor.country}</span></span></button>; })}
            {available.length === 0 ? <p className="col-span-full rounded-xl border border-dashed border-ink-200 px-4 py-10 text-center text-xs text-ink-400">No unlinked doctors match this search.</p> : null}
          </div></div>
          <div className="bg-[#fafbfb] p-5"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-400">Placement details</p>{selected ? <div className="mt-4 flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-3"><DoctorAvatar imageSrc={selected.image} name={selected.fullName} imagePosition={selected.imagePosition || "center top"} sizes="48px" className="size-12 shrink-0 rounded-xl" fallbackClassName="bg-[#071421] text-white" initialsClassName="text-sm font-semibold" /><div className="min-w-0"><p className="truncate text-xs font-semibold text-ink-900">{selected.fullName}</p><p className="mt-1 text-[10px] text-ink-400">{selected.country}</p></div></div> : <div className="mt-4 rounded-xl border border-dashed border-ink-200 px-4 py-8 text-center text-xs text-ink-400">Choose a doctor from the directory.</div>}
            <div className="mt-5 grid gap-4">{sections.length > 1 ? <label><span className="mb-2 block text-xs font-semibold text-ink-700">SIG section</span><AdminNativeSelect value={section} onChange={(event) => { setSection(event.target.value); setDoctorId(""); }}>{sections.map((item) => <option key={item}>{item}</option>)}</AdminNativeSelect></label> : null}<label><span className="mb-2 block text-xs font-semibold text-ink-700">Role</span><input value={role} onChange={(event) => setRole(event.target.value)} placeholder="SIG member" className="admin-input" /></label></div>
            {error ? <p role="alert" className="mt-4 rounded-xl border border-crimson-200 bg-crimson-50 px-3 py-2 text-xs text-crimson-800">{error}</p> : null}
            <button type="button" onClick={addDoctor} disabled={!selected || isPending} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-crimson-600 px-4 text-xs font-semibold text-white transition hover:bg-crimson-700 disabled:cursor-not-allowed disabled:opacity-40">{isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}{isPending ? "Adding doctor…" : "Add to SIG"}</button>
          </div>
        </div>
      </div>
    </div> : null}
  </>;
}
