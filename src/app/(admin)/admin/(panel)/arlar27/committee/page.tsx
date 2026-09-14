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

const groups = ["Congress leadership", "Scientific committee", "Organising committee"];

export default async function AdminArlar27CommitteePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const query = await searchParams;
  const [committee, status, managedDoctors] = await Promise.all([
    getManagedArlar27PeopleAsync("committee", "admin").then((items) => filterDeletedAdminRecordsAsync("arlar27-committee", items)),
    getArlar27SectionStatusAsync("committee", "admin"), listManagedDoctorsAsync(),
  ]);
  const action = saveArlar27PeopleAction.bind(null, "committee");
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
        title="Congress committee"
        description="Build the committee from existing doctor profiles or add a new doctor."
        actions={
          <>
            <Arlar27StatusControl section="committee" initialStatus={status} />
            <AdminRecycleBinLink scope="arlar27-committee" />
            <AdminLink href="/congresses/arlar27/committee" variant="secondary"><Eye size={15} />Preview</AdminLink>
            <AdminButton type="submit" form="arlar27-committee-form"><Save size={15} />Save changes</AdminButton>
          </>
        }
      />
      <AdminContent>
        {query.saved === "1" ? <p className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Congress committee saved.</p> : null}
        <Arlar27PeopleManager kind="committee" doctors={doctors} initialMembers={committee} groups={groups} action={action} formId="arlar27-committee-form" />
      </AdminContent>
    </>
  );
}
