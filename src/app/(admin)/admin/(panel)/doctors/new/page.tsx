import { AdminContent, AdminPageHeader } from "@/components/admin/admin-ui";
import { DoctorEditor } from "@/components/admin/doctor-editor";
import { DoctorHeaderActions } from "@/components/admin/doctor-header-actions";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import { listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import { availablePlacements } from "@/data/doctor-database";
import { saveDoctorAction } from "@/app/(admin)/admin/(panel)/doctors/actions";

export default async function NewDoctorPage() {
  const [media, allDoctors] = await Promise.all([
    getAdminMediaLibraryAsync(),
    listManagedDoctorsAsync(),
  ]);
  const doctors = await filterDeletedAdminRecordsAsync("doctors", allDoctors);

  return (
    <>
      <AdminPageHeader
        eyebrow="People database"
        title="Add a doctor"
        description="Create one canonical identity, then choose every website section where the profile should appear."
        actions={<DoctorHeaderActions formId="doctor-editor-form" />}
        sticky
      />
      <AdminContent className="max-w-[1400px]"><DoctorEditor media={media} action={saveDoctorAction.bind(null, "new")} formId="doctor-editor-form" placements={availablePlacements} duplicateCandidates={doctors.map(({ id, name, fullName, country }) => ({ id, name, fullName, country }))} /></AdminContent>
    </>
  );
}
