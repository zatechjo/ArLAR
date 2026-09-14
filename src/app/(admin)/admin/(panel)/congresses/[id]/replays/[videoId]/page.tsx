import { notFound } from "next/navigation";
import { saveCongressReplayAction } from "@/app/(admin)/admin/(panel)/congresses/actions";
import { AdminRecycleBinLink } from "@/components/admin/admin-recycle-bin-link";
import { AdminContent, AdminPageHeader } from "@/components/admin/admin-ui";
import { CongressReplayEditor } from "@/components/admin/congress-replay-editor";
import { getCongressAsync, type CongressVideo } from "@/lib/admin-congress-data";
import { getAdminMediaLibraryAsync } from "@/lib/admin-media";

export default async function AdminReplayPage({ params, searchParams }: {
  params: Promise<{ id: string; videoId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id, videoId }, query] = await Promise.all([params, searchParams]);
  const congress = await getCongressAsync(id, "admin");
  if (!congress) notFound();
  const isNew = videoId === "new";
  const video = isNew ? emptyReplay() : congress.videos.find((item) => item.id === videoId);
  if (!video) notFound();
  const action = saveCongressReplayAction.bind(null, id, videoId);
  return <><AdminPageHeader title={isNew ? "Add session replay" : "Edit session replay"} description={isNew ? `Add a replay to ${congress.title}.` : "Manage the recording, programme placement, faculty, thumbnail, and video source."} actions={<AdminRecycleBinLink scope="congress-replays" context={congress.id} label="Replay trash" />} /><AdminContent className="max-w-[1400px]">{query.saved === "1" ? <div className="mb-5 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-xs font-semibold text-jade-800">Replay saved.</div> : null}<CongressReplayEditor congress={congress} video={video} media={await getAdminMediaLibraryAsync()} action={action} isNew={isNew} /></AdminContent></>;
}

function emptyReplay(): CongressVideo { return { id: "new", title: "", speaker: "", date: "", day: "", track: "", room: "", youtubeId: "", watchUrl: "", duration: "", description: "", thumbnail: "", status: "draft" }; }
