import { Eye, Save } from "lucide-react";

import { Arlar27AdminHeader } from "@/components/admin/arlar27-admin-header";
import { Arlar27StatusControl } from "@/components/admin/arlar27-status";
import { Arlar27PeopleManager } from "@/components/admin/arlar27-people-manager";
import { AdminRecycleBinLink } from "@/components/admin/admin-recycle-bin-link";
import { AdminButton, AdminContent, AdminLink } from "@/components/admin/admin-ui";
import { listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import { filterDeletedAdminRecordsAsync } from "@/lib/admin-deletion-repository";
import { saveArlar27PeopleAction } from "@/app/(admin)/admin/(panel)/arlar27/actions";
import { getArlar27SectionStatusAsync, getManagedArlar27PeopleAsync } from "@/lib/arlar27-admin-repository";

const groups = ["International faculty", "Regional faculty", "Local faculty", "Guest speaker"];

export default async function AdminArlar27FacultyPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const query = await searchParams;
  const [faculty, status, managedDoctors] = await Promise.all([
    getManagedArlar27PeopleAsync("faculty", "admin").then((items) => filterDeletedAdminRecordsAsync("arlar27-faculty", items)),
    getArlar27SectionStatusAsync("faculty", "admin"), listManagedDoctorsAsync(),
  ]);
  const action = saveArlar27PeopleAction.bind(null, "faculty");
  const doctors = managedDoctors.map((doctor) => ({
    id: doctor.id,
    fullName: doctor.fullName,
    image: doctor.image,
    imagePosition: doctor.imagePosition,
    country: doctor.country,
    flagFilename: doctor.flagFilename,
  }));

  return (
    <>
      <Arlar27AdminHeader
        title="Congress faculty"
        description="Manage invited faculty and their congress roles."
        actions={
          <>
            <Arlar27StatusControl section="faculty" initialStatus={status} />
            <AdminRecycleBinLink scope="arlar27-faculty" />
            <AdminLink href="/congresses/arlar27/faculty" variant="secondary"><Eye size={15} />Preview</AdminLink>
            <AdminButton type="submit" form="arlar27-faculty-form"><Save size={15} />Save changes</AdminButton>
          </>
        }
      />
      <AdminContent>
        {query.saved === "1" ? <p className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Congress faculty saved.</p> : null}
        <Arlar27PeopleManager kind="faculty" doctors={doctors} initialMembers={faculty} groups={groups} action={action} formId="arlar27-faculty-form" />
      </AdminContent>
    </>
  );
}
