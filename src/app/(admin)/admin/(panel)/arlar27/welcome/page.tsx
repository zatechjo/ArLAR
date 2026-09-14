import { Eye, Save } from "lucide-react";

import { Arlar27AdminHeader } from "@/components/admin/arlar27-admin-header";
import { Arlar27StatusControl } from "@/components/admin/arlar27-status";
import { Arlar27WelcomeEditor } from "@/components/admin/arlar27-welcome-editor";
import { AdminButton, AdminContent, AdminLink } from "@/components/admin/admin-ui";
import { listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import { saveArlar27WelcomeAction } from "@/app/(admin)/admin/(panel)/arlar27/actions";
import { getArlar27SectionStatusAsync, getManagedArlar27WelcomeAsync } from "@/lib/arlar27-admin-repository";

export default async function AdminArlar27WelcomePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const query = await searchParams;
  const [content, status, managedDoctors] = await Promise.all([getManagedArlar27WelcomeAsync("admin"), getArlar27SectionStatusAsync("welcome", "admin"), listManagedDoctorsAsync()]);
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
        title="Welcome message"
        description="Edit the English, Arabic, and French messages and connect the author to the doctor directory."
        actions={
          <>
            <Arlar27StatusControl section="welcome" initialStatus={status} />
            <AdminLink href="/congresses/arlar27/welcome" variant="secondary"><Eye size={15} />Preview</AdminLink>
            <AdminButton type="submit" className="" form="arlar27-welcome-form"><Save size={15} />Save changes</AdminButton>
          </>
        }
      />
      <AdminContent>
        {query.saved === "1" ? <SavedNotice /> : null}
        <Arlar27WelcomeEditor content={content} doctors={doctors} action={saveArlar27WelcomeAction} formId="arlar27-welcome-form" />
      </AdminContent>
    </>
  );
}

function SavedNotice() { return <p className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Welcome message saved.</p>; }
