import { createCongressAction } from "@/app/(admin)/admin/(panel)/congresses/actions";
import { AdminContent, AdminPageHeader } from "@/components/admin/admin-ui";
import { CongressEditor } from "@/components/admin/congress-editor";
import type { CongressRecord } from "@/lib/admin-congress-data";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";

const emptyCongress: CongressRecord = { id: "new", title: "New ArLAR Congress", dateRange: "", location: "", image: "", publicHref: "", introduction: "", status: "draft", videos: [], gallery: [], speakers: [], tracks: [] };

export default async function NewCongressPage() {
  return <><AdminPageHeader title="Add congress" description="Create a new congress archive." /><AdminContent className="max-w-[1500px]"><CongressEditor congress={emptyCongress} media={await getAdminMediaLibraryAsync()} action={createCongressAction} isNew /></AdminContent></>;
}
