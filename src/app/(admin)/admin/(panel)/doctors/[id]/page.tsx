import { notFound } from "next/navigation";

import { AdminContent, AdminPageHeader } from "@/components/admin/admin-ui";
import { DoctorEditor } from "@/components/admin/doctor-editor";
import { DoctorHeaderActions } from "@/components/admin/doctor-header-actions";
import { DuplicateDoctorMergeNotice } from "@/components/admin/duplicate-doctor-merge-notice";
import { isAdminRecordDeletedAsync } from "@/lib/admin-deletion-repository";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";
import { findManagedDoctorByName, getManagedDoctorAsync, getStoredManagedDoctorAsync } from "@/lib/admin-doctor-repository";
import { saveDoctorAction } from "@/app/(admin)/admin/(panel)/doctors/actions";
import arabicSuggestions from "@/data/doctor-arabic-unmatched.json";
import frenchSuggestions from "@/data/doctor-french-unmatched.json";
import { availablePlacements } from "@/data/doctor-database";

export default async function AdminDoctorEditorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; duplicate?: string; duplicateId?: string; merged?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const [doctor, deleted, rawDuplicate] = await Promise.all([
    getManagedDoctorAsync(id),
    isAdminRecordDeletedAsync("doctors", id),
    query.duplicateId ? getStoredManagedDoctorAsync(query.duplicateId) : Promise.resolve(undefined),
  ]);
  if (!doctor || deleted) notFound();
  const duplicate = rawDuplicate && findManagedDoctorByName([doctor], rawDuplicate.fullName || rawDuplicate.name) ? rawDuplicate : undefined;

  return (
    <>
      <AdminPageHeader
        eyebrow="People database · Profile"
        title={doctor.fullName}
        description="Manage this doctor’s canonical identity, biography, artwork, flag, and every public website placement."
        actions={<DoctorHeaderActions doctorId={doctor.id} doctorName={doctor.fullName} formId="doctor-editor-form" />}
        sticky
      />
      <AdminContent className="max-w-[1400px]">
        {query.saved === "1" ? <p className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Doctor profile saved.</p> : null}
        {query.merged === "1" ? <p className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Duplicate doctor merged. This canonical profile and its placements were preserved.</p> : null}
        {query.duplicate === "1" ? <p className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">A doctor with that name already exists, so the existing profile was opened instead of creating a duplicate.</p> : null}
        {duplicate && query.duplicateId ? <DuplicateDoctorMergeNotice canonicalId={doctor.id} duplicateId={query.duplicateId} doctorName={doctor.fullName} /> : null}
        <DoctorEditor doctor={doctor} media={await getAdminMediaLibraryAsync()} action={saveDoctorAction.bind(null, doctor.id)} formId="doctor-editor-form" arabicSuggestions={doctor.nameAr ? [] : arabicSuggestions} frenchSuggestions={doctor.biographyFr?.length ? [] : frenchSuggestions} placements={availablePlacements} />
      </AdminContent>
    </>
  );
}
