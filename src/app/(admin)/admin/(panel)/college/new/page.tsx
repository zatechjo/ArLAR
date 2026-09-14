import { CollegeEventEditor } from "@/components/admin/college-event-editor";
import { CollegeEventHeaderActions } from "@/components/admin/college-event-header-actions";
import { AdminContent, AdminPageHeader } from "@/components/admin/admin-ui";
import { saveUpcomingCollegeEventAction } from "@/app/(admin)/admin/(panel)/college/actions";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";
import { getCollegeGroupOptions } from "@/lib/college-groups";
import { getStoredCollegeUpcomingEventAsync } from "@/lib/college-upcoming-event";

export default async function NewCollegeEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const upcomingEvent = await getStoredCollegeUpcomingEventAsync();
  const editorEvent = upcomingEvent ? {
    title: upcomingEvent.title,
    date: upcomingEvent.startsAt,
    groups: upcomingEvent.groups,
    webinarUrl: upcomingEvent.registrationUrl,
    speakers: upcomingEvent.speakers,
    moderators: upcomingEvent.moderators,
    image: upcomingEvent.banner,
  } : undefined;

  return (
    <>
      <AdminPageHeader
        title={upcomingEvent ? "Manage scheduled webinar" : "Schedule webinar"}
        description="Create an upcoming College webinar with its date, time, organisers, registration link, and image."
        actions={<CollegeEventHeaderActions mode="scheduled" formId="college-upcoming-event-form" webinarTitle={upcomingEvent?.title} />}
      />
      <AdminContent className="max-w-[1400px]">
        {error ? (
          <div role="alert" className="mb-5 rounded-2xl border border-crimson-200 bg-crimson-50 px-5 py-4 text-sm font-semibold text-crimson-800">
            {error}
          </div>
        ) : null}
        <CollegeEventEditor
          event={editorEvent}
          media={await getAdminMediaLibraryAsync()}
          groupOptions={getCollegeGroupOptions()}
          mode="scheduled"
          action={saveUpcomingCollegeEventAction}
          formId="college-upcoming-event-form"
        />
      </AdminContent>
    </>
  );
}
