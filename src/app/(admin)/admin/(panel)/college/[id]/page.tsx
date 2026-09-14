import { notFound } from "next/navigation";

import { CollegeEventEditor } from "@/components/admin/college-event-editor";
import { CollegeEventHeaderActions } from "@/components/admin/college-event-header-actions";
import { AdminContent, AdminPageHeader } from "@/components/admin/admin-ui";
import { isAdminRecordDeletedAsync } from "@/lib/admin-deletion-repository";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";
import { getCollegeGroupOptions } from "@/lib/college-groups";
import { getManagedCollegeEventAsync } from "@/lib/admin-college-repository";
import { saveCollegeArchiveEventAction } from "@/app/(admin)/admin/(panel)/college/actions";

export default async function AdminCollegeEventPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const [event, deleted] = await Promise.all([getManagedCollegeEventAsync(id, "admin"), isAdminRecordDeletedAsync("college-events", id)]);
  if (!event || deleted) notFound();

  return (
    <>
      <AdminPageHeader
        title="Edit webinar"
        description="Update the complete session record, organising groups, image, and replay link."
        actions={<CollegeEventHeaderActions eventId={event.id} webinarTitle={event.title} replayUrl={event.webinarUrl} formId="college-event-form" />}
      />
      <AdminContent className="max-w-[1400px]">
        {query.saved === "1" ? <p className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Webinar saved.</p> : null}
        <CollegeEventEditor event={event} media={await getAdminMediaLibraryAsync()} groupOptions={getCollegeGroupOptions()} action={saveCollegeArchiveEventAction.bind(null, id)} />
      </AdminContent>
    </>
  );
}
