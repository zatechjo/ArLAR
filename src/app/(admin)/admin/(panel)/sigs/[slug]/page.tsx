import { ArrowLeft, Check, ExternalLink, Save } from "lucide-react";
import { notFound } from "next/navigation";

import { saveSigIdentityAction } from "@/app/(admin)/admin/(panel)/sigs/actions";
import { AdminImageField } from "@/components/admin/admin-image-field";
import { AdminRecycleBinLink } from "@/components/admin/admin-recycle-bin-link";
import { AdminSavingForm } from "@/components/admin/admin-saving-form";
import { SigDoctorPicker } from "@/components/admin/sig-doctor-picker";
import { SigLinkedPeopleManager } from "@/components/admin/sig-linked-people-manager";
import { AdminContent, AdminLink, AdminPageHeader, SectionCard, StatusPill } from "@/components/admin/admin-ui";
import { filterDeletedAdminRecordsAsync, isAdminRecordDeletedAsync } from "@/lib/admin-deletion-repository";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";
import { listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import { getManagedSigAsync, getManagedSigProfileAsync } from "@/lib/sig-directory-repository";

export default async function AdminSigEditorPage({ params, searchParams }: PageProps<"/admin/sigs/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [group, profile, deleted, doctors] = await Promise.all([getManagedSigAsync(slug, "admin"), getManagedSigProfileAsync(slug, "admin"), isAdminRecordDeletedAsync("sigs", slug), listManagedDoctorsAsync()]);
  if (!group || deleted) notFound();
  const activeDoctors = await filterDeletedAdminRecordsAsync("doctors", doctors);
  const publicPath = `/special-interest-groups/${slug}`;
  const linkedPeople = activeDoctors.flatMap((doctor) => doctor.appearances
    .filter((appearance) => appearance.path === publicPath)
    .map((appearance) => ({ doctor, appearance })));
  const placementOrder = new Map<string, number>();
  for (const section of [...new Set(linkedPeople.map(({ appearance }) => appearance.section))]) {
    const sectionPeople = linkedPeople.filter(({ appearance }) => appearance.section === section);
    const hasCompleteOrder = sectionPeople.every(({ appearance }) => appearance.sortOrderVersion === 1 && Number.isFinite(appearance.sortOrder));
    sectionPeople
      .toSorted((a, b) => (hasCompleteOrder ? (a.appearance.sortOrder ?? 0) - (b.appearance.sortOrder ?? 0) : 0) || a.doctor.fullName.localeCompare(b.doctor.fullName))
      .forEach(({ doctor, appearance }, index) => placementOrder.set(`${doctor.id}\u0000${appearance.id}`, index + 1));
  }
  const profileSections = profile?.tabs.filter((tab) => tab.kind === "people").map((tab) => tab.label) || [];
  const sigSections = slug === "arab-adult-arthritis-awareness"
    ? ["Group Board", "Members"]
    : [...new Set(profileSections.length > 0 ? profileSections : ["Members"])];
  const staticSectionCount = profile?.tabs.length || (slug === "arab-adult-arthritis-awareness" ? 5 : 0);
  const saveAction = saveSigIdentityAction.bind(null, slug);
  const saved = query.saved === "1";

  return (
    <>
      <AdminPageHeader
        title={group.name}
        description="Manage this group's directory identity and public visibility."
        actions={
          <>
            <AdminLink href="/admin/sigs" variant="secondary"><ArrowLeft size={15} />Back</AdminLink>
            <AdminRecycleBinLink scope="sigs" />
            <AdminLink href={`/special-interest-groups/${slug}`} variant="secondary"><ExternalLink size={15} />Public page</AdminLink>
            <button type="submit" form="sig-identity-form" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-crimson-600 bg-crimson-600 px-4 text-sm font-semibold text-white transition hover:border-crimson-700 hover:bg-crimson-700"><Save size={15} />Save changes</button>
          </>
        }
      />
      <AdminContent className="max-w-[1300px]">
        {saved ? <div className="mb-5 flex items-center gap-2 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800"><Check size={15} />SIG directory settings saved.</div> : null}
        <AdminSavingForm id="sig-identity-form" action={saveAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" label="Saving SIG…">
          <div className="space-y-6">
            <SectionCard title="Directory identity" description="These details appear on the SIG directory and public group page.">
              <div className="grid gap-5 p-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-7">
                <label className="block"><span className="mb-2 block text-xs font-semibold text-ink-700">Abbreviation</span><input name="abbreviation" defaultValue={group.abbreviation} maxLength={24} required className="admin-input" /></label>
                <label className="block"><span className="mb-2 block text-xs font-semibold text-ink-700">Group name</span><input name="name" defaultValue={group.name} maxLength={140} required className="admin-input" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-semibold text-ink-700">Permanent page address</span><div className="flex min-h-11 items-center rounded-xl border border-ink-100 bg-ink-50 px-3.5 text-xs text-ink-500">/special-interest-groups/{group.slug}</div></label>
              </div>
            </SectionCard>

            <SectionCard title="Connected profile" description="Public profile content is kept static in the codebase; linked people remain manageable through Doctor records.">
              <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-7">
                <Summary label="Static sections" value={staticSectionCount} />
                <Summary label="Directory order" value={String(group.order).padStart(2, "0")} />
                <Summary label="Public status" value={group.visible ? "Visible" : "Hidden"} />
              </div>
            </SectionCard>

            <SectionCard title="Linked people" description="The row number is the doctor’s position on the public website. Drag rows into place, then save the order." action={<SigDoctorPicker slug={slug} groupName={group.name} doctors={activeDoctors.map((doctor) => ({ id: doctor.id, fullName: doctor.fullName, country: doctor.country, image: doctor.image, imagePosition: doctor.imagePosition }))} linkedPlacements={linkedPeople.map(({ doctor, appearance }) => ({ doctorId: doctor.id, section: appearance.section }))} sections={sigSections} />}>
              <SigLinkedPeopleManager key={linkedPeople.map(({ doctor, appearance }) => `${doctor.id}:${appearance.id}:${appearance.sortOrderVersion === 1 ? appearance.sortOrder || 0 : 0}`).join("|")} slug={slug} sections={sigSections} initialPeople={linkedPeople.map(({ doctor, appearance }) => ({ doctorId: doctor.id, appearanceId: appearance.id, fullName: doctor.fullName, country: doctor.country, credentials: doctor.credentials, image: doctor.image, imagePosition: doctor.imagePosition, role: appearance.role, section: appearance.section, sortOrder: placementOrder.get(`${doctor.id}\u0000${appearance.id}`) || 1 }))} />
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <SectionCard title="Group logo" headerAlign="center">
              <div className="p-5"><AdminImageField name="logo" value={group.logo} items={await getAdminMediaLibraryAsync()} aspect="square" fit="contain" /></div>
            </SectionCard>
            <SectionCard title="Visibility">
              <div className="p-5">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 bg-white p-4">
                  <input name="visible" type="checkbox" defaultChecked={group.visible} className="mt-0.5 size-4 accent-[#00953b]" />
                  <span><span className="block text-sm font-semibold text-ink-900">Show on the website</span><span className="mt-1 block text-xs leading-5 text-ink-500">Hidden groups remain saved in the admin directory.</span></span>
                </label>
                <div className="mt-4"><StatusPill tone={group.visible ? "green" : "neutral"}>{group.visible ? "Public" : "Hidden"}</StatusPill></div>
              </div>
            </SectionCard>
          </aside>
        </AdminSavingForm>
      </AdminContent>
    </>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-ink-100 bg-ink-50 p-4"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-400">{label}</p><p className="mt-2 text-lg font-semibold text-ink-950">{value}</p></div>;
}
