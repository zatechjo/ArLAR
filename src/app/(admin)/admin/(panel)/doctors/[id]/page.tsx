import { notFound } from "next/navigation";

import { AdminContent, AdminPageHeader } from "@/components/admin/admin-ui";
import { DoctorEditor } from "@/components/admin/doctor-editor";
import { DoctorHeaderActions } from "@/components/admin/doctor-header-actions";
import { isAdminRecordDeletedAsync } from "@/lib/admin-deletion-repository";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";
import { getManagedDoctorAsync } from "@/lib/admin-doctor-repository";
import { saveDoctorAction } from "@/app/(admin)/admin/(panel)/doctors/actions";
import arabicSuggestions from "@/data/doctor-arabic-unmatched.json";
import frenchSuggestions from "@/data/doctor-french-unmatched.json";
import { availablePlacements } from "@/data/doctor-database";

export default async function AdminDoctorEditorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const [doctor, deleted] = await Promise.all([getManagedDoctorAsync(id), isAdminRecordDeletedAsync("doctors", id)]);
  if (!doctor || deleted) notFound();

  return (
    <>
      <AdminPageHeader
        eyebrow="People database · Profile"
        title={doctor.fullName}
        description="Manage this doctor’s canonical identity, biography, artwork, flag, and every public website placement."
        actions={<DoctorHeaderActions doctorId={doctor.id} doctorName={doctor.fullName} formId="doctor-editor-form" />}
      />
      <AdminContent className="max-w-[1400px]">{query.saved === "1" ? <p className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Doctor profile saved.</p> : null}<DoctorEditor doctor={doctor} media={await getAdminMediaLibraryAsync()} action={saveDoctorAction.bind(null, doctor.id)} formId="doctor-editor-form" arabicSuggestions={doctor.nameAr ? [] : arabicSuggestions} frenchSuggestions={doctor.biographyFr?.length ? [] : frenchSuggestions} placements={availablePlacements} /></AdminContent>
    </>
  );
}
