import { notFound } from "next/navigation";
import { saveCongressAction } from "@/app/(admin)/admin/(panel)/congresses/actions";
import { AdminRecycleBinLink } from "@/components/admin/admin-recycle-bin-link";
import { AdminContent, AdminPageHeader } from "@/components/admin/admin-ui";
import { CongressEditor } from "@/components/admin/congress-editor";
import { getCongressAsync } from "@/lib/admin-congress-data";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";

export default async function AdminCongressPage({ params, searchParams }: PageProps<"/admin/congresses/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const congress = await getCongressAsync(id, "admin");
  if (!congress) notFound();
  const action = saveCongressAction.bind(null, id);
  return <><AdminPageHeader title={congress.title} description="Manage its overview, replays, galleries, faculty, and tracks." actions={<><AdminRecycleBinLink scope="congresses" label="Congress trash" /><AdminRecycleBinLink scope="congress-replays" context={congress.id} label="Replay trash" /></>} /><AdminContent className="max-w-[1500px]">{query.saved === "1" ? <div className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Congress saved.</div> : null}<CongressEditor congress={congress} media={await getAdminMediaLibraryAsync()} action={action} /></AdminContent></>;
}
