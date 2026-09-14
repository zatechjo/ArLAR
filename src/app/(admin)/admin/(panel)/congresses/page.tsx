import { AdminRecycleBinLink } from "@/components/admin/admin-recycle-bin-link";
import { AdminContent, AdminLink, AdminPageHeader, MetricCard } from "@/components/admin/admin-ui";
import { CollectionManager } from "@/components/admin/collection-manager";
import { CalendarDays, Users, Video } from "@/components/icons";
import { getAllCongressesAsync } from "@/lib/admin-congress-data";

export default async function AdminCongressesPage() {
  const congresses = await getAllCongressesAsync("admin");
  const items = congresses.map((congress) => ({ id: congress.id, title: congress.title, subtitle: congress.introduction || `${congress.dateRange} · ${congress.location}`, image: congress.image, meta: `${congress.videos.length} videos`, tags: [congress.location, `${congress.gallery.length} gallery items`].filter(Boolean), status: congress.status, href: `/admin/congresses/${congress.id}` }));
  const replayCount = congresses.reduce((total, congress) => total + congress.videos.length, 0);
  const facultyCount = congresses.reduce((total, congress) => total + congress.speakers.length, 0);
  return <><AdminPageHeader title="Past congresses" description="Manage congress archives and replay libraries." actions={<><AdminRecycleBinLink scope="congresses" /><AdminLink href="/admin/congresses/new">+ Add congress</AdminLink></>} /><AdminContent><div className="grid gap-4 sm:grid-cols-3"><MetricCard label="Archived congresses" value={items.length} note="Full experiences online" icon={<CalendarDays className="h-5 w-5" />} tone="dark" /><MetricCard label="Replay entries" value={replayCount} note="Across available archives" icon={<Video className="h-5 w-5" />} tone="light" /><MetricCard label="Faculty records" value={facultyCount} note="Across congress archives" icon={<Users className="h-5 w-5" />} tone="green" /></div><div className="mt-6"><CollectionManager items={items} deletionScope="congresses" view="grid" searchPlaceholder="Search congress archives…" /></div></AdminContent></>;
}
