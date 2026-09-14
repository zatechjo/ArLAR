"use client";

import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";

import { deleteAdminRecordAction } from "@/app/(admin)/admin/(panel)/actions";
import { AdminButton, AdminNativeSelect, AdminSearchField, AdminSelect, StatusPill } from "@/components/admin/admin-ui";
import { DoctorAvatar } from "@/components/about/doctor-avatar";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import type { Arlar27PersonPlacement } from "@/data/arlar27";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";
import { AdminSavingForm } from "@/components/admin/admin-saving-form";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";

export type Arlar27DirectoryDoctor = {
  id: string;
  fullName: string;
  image: string;
  imagePosition?: string;
  country: string;
  flagFilename: string;
};

const columns = "lg:grid-cols-[minmax(220px,1.2fr)_minmax(180px,1fr)_170px_100px_190px]";

export function Arlar27PeopleManager({ kind, doctors, initialMembers, groups, action, formId }: { kind: "committee" | "faculty"; doctors: Arlar27DirectoryDoctor[]; initialMembers: Arlar27PersonPlacement[]; groups: string[]; action: (formData: FormData) => void | Promise<void>; formId: string }) {
  const router = useRouter();
  const [isRemoving, startRemoveTransition] = useTransition();
  const [members, setMembers] = useState<Arlar27PersonPlacement[]>(() => [...initialMembers]);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [newRole, setNewRole] = useState(kind === "committee" ? "Committee member" : "Faculty member");
  const [newGroup, setNewGroup] = useState(groups[0] || "General");
  const [removing, setRemoving] = useState<Arlar27PersonPlacement | null>(null);
  const deferredQuery = useDeferredValue(query);
  const deferredDirectoryQuery = useDeferredValue(directoryQuery);
  const doctorMap = useMemo(() => new Map(doctors.map((doctor) => [doctor.id, doctor])), [doctors]);
  const pickerModalRef = useModalAccessibility<HTMLDivElement>({ open: pickerOpen, onClose: () => setPickerOpen(false) });

  const visibleMembers = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return members.filter((member) => {
      const doctor = doctorMap.get(member.doctorId);
      const searchable = `${doctor?.fullName || ""} ${doctor?.country || ""} ${member.role} ${member.group}`.toLowerCase();
      return (!needle || searchable.includes(needle)) && (groupFilter === "all" || member.group === groupFilter);
    });
  }, [deferredQuery, doctorMap, groupFilter, members]);

  const directoryDoctors = useMemo(() => {
    const needle = deferredDirectoryQuery.trim().toLowerCase();
    return doctors.filter((doctor) => !needle || `${doctor.fullName} ${doctor.country}`.toLowerCase().includes(needle));
  }, [deferredDirectoryQuery, doctors]);

  const selectedDoctor = doctorMap.get(selectedDoctorId);
  const sectionLabel = kind === "committee" ? "committee" : "faculty";

  /**
   * The rows on screen are a filtered view, so "move up" is only meaningful
   * while the full list is showing — otherwise a person would jump past rows
   * the administrator cannot see. Reordering is disabled under a filter.
   */
  const isFiltered = deferredQuery.trim() !== "" || groupFilter !== "all";

  function moveMember(id: string, direction: -1 | 1) {
    setMembers((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addMember() {
    if (!selectedDoctor || !newRole.trim() || !newGroup) return;
    setMembers((current) => [...current, {
      id: `${selectedDoctor.id}-${newGroup.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      doctorId: selectedDoctor.id,
      role: newRole.trim(),
      group: newGroup,
      published: true,
    }]);
    setPickerOpen(false);
    setDirectoryQuery("");
    setSelectedDoctorId("");
  }

  return (
    <AdminSavingForm id={formId} action={action} className="" label="Saving changes…">
      <AdminPendingOverlay visible={isRemoving} label="Moving placement to trash…" />
      <input type="hidden" name={`arlar27_${kind}`} value={JSON.stringify(members)} />
      <div className="rounded-2xl border border-[#e1e5e9] bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <AdminSearchField value={query} onChange={setQuery} placeholder={`Search ${sectionLabel} by doctor, country, role, or group…`} />
          <AdminSelect label="Group" value={groupFilter} onChange={setGroupFilter}>
            <option value="all">All groups</option>
            {groups.map((group) => <option key={group}>{group}</option>)}
          </AdminSelect>
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/doctors/new?return=/admin/arlar27/${kind}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-xs font-semibold text-ink-800 transition hover:border-ink-400 hover:bg-ink-50"><Plus size={15} />New doctor</Link>
            <AdminButton onClick={() => setPickerOpen(true)}><Plus size={15} />Select from directory</AdminButton>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f2] pt-4">
          <p className="text-xs font-semibold text-ink-600">{visibleMembers.length} of {members.length} {sectionLabel} records</p>
          {isFiltered ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600">Clear the filters to reorder</p>
          ) : (
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-400">Numbered order is the order shown on the public page</p>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white">
        <div className={`hidden ${columns} gap-4 border-b border-[#e5e8eb] bg-[#fafbfb] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400 lg:grid`}>
          <span>Order &amp; doctor</span><span>Congress role</span><span>Group</span><span>Status</span><span className="text-right">Reorder &amp; actions</span>
        </div>
        <div className="divide-y divide-[#edf0f2]">
          {visibleMembers.map((member) => {
            const doctor = doctorMap.get(member.doctorId);
            if (!doctor) return null;
            // Position in the full list — the public page renders in this order.
            const orderIndex = members.findIndex((item) => item.id === member.id);
            return (
              <div key={member.id} className={`grid gap-4 px-4 py-4 sm:grid-cols-[minmax(240px,1fr)_auto] sm:items-center ${columns} lg:px-5`}>
                <Link href={`/admin/doctors/${doctor.id}`} className="flex min-w-0 items-center gap-3">
                  <span className="w-5 shrink-0 text-right text-[11px] font-bold tabular-nums text-ink-300">{orderIndex + 1}</span>
                  <DoctorAvatar imageSrc={doctor.image} name={doctor.fullName} imagePosition={doctor.imagePosition || "center top"} sizes="52px" className="size-13 shrink-0 rounded-xl" fallbackClassName="bg-[#071421] text-white" initialsClassName="font-display text-sm font-semibold tracking-[-0.04em]" />
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-ink-950">{doctor.fullName}</p><p className="mt-1 text-[11px] text-ink-400">{doctor.country}</p></div>
                </Link>
                <input value={member.role} onChange={(event) => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, role: event.target.value } : item))} aria-label={`Congress role for ${doctor.fullName}`} className="admin-input h-10 text-xs" />
                <AdminNativeSelect compact value={member.group} onChange={(event) => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, group: event.target.value } : item))} aria-label={`Group for ${doctor.fullName}`}>
                  {groups.map((group) => <option key={group}>{group}</option>)}
                </AdminNativeSelect>
                <button type="button" onClick={() => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, published: !item.published } : item))} className="w-fit" aria-label={`${member.published ? "Hide" : "Publish"} ${doctor.fullName}`}><StatusPill tone={member.published ? "green" : "neutral"}>{member.published ? "Public" : "Hidden"}</StatusPill></button>
                <div className="flex items-center justify-end gap-2">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => moveMember(member.id, -1)}
                      disabled={isFiltered || orderIndex === 0}
                      title={isFiltered ? "Clear the search and group filter to reorder" : "Move up"}
                      aria-label={`Move ${doctor.fullName} up`}
                      className="grid size-8 place-items-center rounded-s-lg border border-e-0 border-slate-200 text-slate-400 transition hover:border-ink-400 hover:bg-ink-50 hover:text-ink-800 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveMember(member.id, 1)}
                      disabled={isFiltered || orderIndex === members.length - 1}
                      title={isFiltered ? "Clear the search and group filter to reorder" : "Move down"}
                      aria-label={`Move ${doctor.fullName} down`}
                      className="grid size-8 place-items-center rounded-e-lg border border-slate-200 text-slate-400 transition hover:border-ink-400 hover:bg-ink-50 hover:text-ink-800 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <Link href={`/admin/doctors/${doctor.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#071421] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#142535]"><Pencil size={13} />Edit</Link>
                  <button type="button" onClick={() => setRemoving(member)} aria-label={`Remove ${doctor.fullName} from ${sectionLabel}`} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
          {visibleMembers.length === 0 ? <div className="px-6 py-16 text-center"><p className="text-sm font-semibold text-ink-700">No {sectionLabel} records yet</p><p className="mt-2 text-xs text-ink-400">Select a doctor from the unified directory to begin.</p></div> : null}
        </div>
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-[250] grid place-items-center bg-[#03101c]/65 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setPickerOpen(false); }}>
          <div ref={pickerModalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="directory-picker-title" className="flex max-h-[min(780px,92vh)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,.3)]">
            <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
              <div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-crimson-600">Doctor directory</p><h2 id="directory-picker-title" className="mt-1 text-xl font-semibold text-ink-950">Add to ArLAR27 {sectionLabel}</h2></div>
              <button type="button" onClick={() => setPickerOpen(false)} className="grid size-9 place-items-center rounded-xl bg-ink-50 text-ink-500 hover:bg-ink-100" aria-label="Close doctor picker"><X size={17} /></button>
            </div>
            <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_310px]">
              <div className="flex min-h-0 flex-col border-b border-ink-100 p-5 lg:border-b-0 lg:border-r">
                <div className="shrink-0">
                  <AdminSearchField value={directoryQuery} onChange={setDirectoryQuery} placeholder="Search the doctor directory…" />
                </div>
                {/* auto-rows-min + content-start stop a short result set from
                    stretching: grid rows default to `stretch`, so a single
                    match filled the whole column and centred the name in it.
                    max-h keeps long lists scrollable without a fixed height. */}
                <div className="mt-4 grid max-h-[min(52vh,26rem)] min-h-0 auto-rows-min content-start gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {directoryDoctors.map((doctor) => {
                    const selected = selectedDoctorId === doctor.id;
                    return <button key={doctor.id} type="button" onClick={() => setSelectedDoctorId(doctor.id)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selected ? "border-crimson-300 bg-crimson-50 ring-1 ring-crimson-100" : "border-ink-100 hover:border-ink-300"}`}><DoctorAvatar imageSrc={doctor.image} name={doctor.fullName} imagePosition={doctor.imagePosition || "center top"} sizes="44px" className="size-11 shrink-0 rounded-xl" fallbackClassName="bg-[#071421] text-white" initialsClassName="font-display text-xs font-semibold tracking-[-0.04em]" /><span className="min-w-0"><span className="block truncate text-xs font-semibold text-ink-900">{doctor.fullName}</span><span className="mt-1 block text-[10px] text-ink-400">{doctor.country}</span></span></button>;
                  })}
                </div>
              </div>
              <div className="bg-[#fafbfb] p-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-400">Placement details</p>
                {selectedDoctor ? <div className="mt-4 flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-3"><DoctorAvatar imageSrc={selectedDoctor.image} name={selectedDoctor.fullName} imagePosition={selectedDoctor.imagePosition || "center top"} sizes="48px" className="size-12 shrink-0 rounded-xl" fallbackClassName="bg-[#071421] text-white" initialsClassName="font-display text-sm font-semibold tracking-[-0.04em]" /><div className="min-w-0"><p className="truncate text-xs font-semibold text-ink-900">{selectedDoctor.fullName}</p><p className="mt-1 text-[10px] text-ink-400">{selectedDoctor.country}</p></div></div> : <div className="mt-4 rounded-xl border border-dashed border-ink-200 px-4 py-8 text-center text-xs text-ink-400">Choose a doctor from the list.</div>}
                <div className="mt-5 grid gap-4">
                  <label className="block"><span className="mb-2 block text-xs font-semibold text-ink-700">Congress role</span><input value={newRole} onChange={(event) => setNewRole(event.target.value)} placeholder="Enter the congress role" className="admin-input" /></label>
                  <label className="block"><span className="mb-2 block text-xs font-semibold text-ink-700">Group</span><AdminNativeSelect value={newGroup} onChange={(event) => setNewGroup(event.target.value)}>{groups.map((group) => <option key={group}>{group}</option>)}</AdminNativeSelect></label>
                </div>
                <button type="button" onClick={addMember} disabled={!selectedDoctor || !newRole.trim()} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-crimson-600 px-4 text-xs font-semibold text-white transition hover:bg-crimson-700 disabled:cursor-not-allowed disabled:opacity-40"><Plus size={15} />Add to {sectionLabel}</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <DeleteConfirmDialog
        open={Boolean(removing)}
        title={doctorMap.get(removing?.doctorId || "")?.fullName || "this doctor"}
        heading={`Move placement to ${sectionLabel} trash?`}
        description="Only this ArLAR27 placement will leave the website. The unified doctor profile remains untouched, and the placement can be restored from Trash."
        confirmLabel={isRemoving ? "Removing…" : `Remove from ${sectionLabel}`}
        cancelLabel="Keep placement"
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (!removing) return;
          const id = removing.id;
          const scope = kind === "committee" ? "arlar27-committee" : "arlar27-faculty";
          setMembers((current) => current.filter((item) => item.id !== id));
          startRemoveTransition(async () => {
            await deleteAdminRecordAction(scope, id);
            router.refresh();
          });
        }}
      />
    </AdminSavingForm>
  );
}
