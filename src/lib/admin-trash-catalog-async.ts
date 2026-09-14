import "server-only";

import type { AdminTrashItem } from "@/lib/admin-trash-catalog";
import { getTrashedAdminRecordsAsync, type AdminDeletionScope } from "@/lib/admin-deletion-repository";
import { listManagedDoctorsAsync } from "@/lib/admin-doctor-repository";
import { listManagedCollegeEventsAsync } from "@/lib/admin-college-repository";
import { getAllCongressSourcesAsync } from "@/lib/admin-congress-data";
import { getManagedSigDirectoryAsync } from "@/lib/sig-directory-repository";
import { getAllProfessionalResourceSourcesAsync } from "@/lib/professional-resources-repository";
import { getManagedMemberCountriesAsync } from "@/lib/member-societies-repository";
import { getManagedArlar27PeopleAsync } from "@/lib/arlar27-admin-repository";
import { getStoredCollegeUpcomingEventSourceAsync } from "@/lib/college-upcoming-event";

export async function getAdminTrashItemsAsync(scope: AdminDeletionScope, context?: string) {
  const [trashed, source] = await Promise.all([getTrashedAdminRecordsAsync(scope), getSourceItems(scope)]);
  return source.flatMap((item): AdminTrashItem[] => {
    const deletedAt = trashed.get(item.id);
    if (!deletedAt || (context && scope === "congress-replays" && !item.id.startsWith(`${context}:`))) return [];
    return [{ ...item, deletedAt }];
  }).toSorted((left, right) => right.deletedAt.localeCompare(left.deletedAt));
}

async function getSourceItems(scope: AdminDeletionScope): Promise<Array<Omit<AdminTrashItem, "deletedAt">>> {
  if (scope === "doctors") return (await listManagedDoctorsAsync()).map((doctor) => ({ id: doctor.id, title: doctor.fullName, subtitle: doctor.country, image: doctor.image, typeLabel: "Doctor" }));
  if (scope === "college-events") {
    const [events, upcoming] = await Promise.all([
      listManagedCollegeEventsAsync("admin"),
      getStoredCollegeUpcomingEventSourceAsync(),
    ]);
    return [
      ...events.filter((event) => event.id).map((event) => ({ id: event.id!, title: event.title || "Webinar", subtitle: [event.date, ...(event.groups || [])].filter(Boolean).join(" · "), image: event.image, typeLabel: "Webinar replay" })),
      ...(upcoming ? [{ id: "scheduled-webinar", title: upcoming.title || "Scheduled webinar", subtitle: [upcoming.startsAt, ...upcoming.groups].filter(Boolean).join(" · "), image: upcoming.banner, typeLabel: "Scheduled webinar" }] : []),
    ];
  }
  if (scope === "congresses") return (await getAllCongressSourcesAsync("admin")).map((congress) => ({ id: congress.id, title: congress.title, subtitle: [congress.dateRange, congress.location].filter(Boolean).join(" · "), image: congress.image, typeLabel: "Congress" }));
  if (scope === "congress-replays") return (await getAllCongressSourcesAsync("admin")).flatMap((congress) => congress.videos.map((video) => ({ id: `${congress.id}:${video.id}`, title: video.title, subtitle: [video.speaker, congress.title].filter(Boolean).join(" · "), image: video.thumbnail || (video.youtubeId ? `https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg` : congress.image), typeLabel: "Congress replay" })));
  if (scope === "sigs") return (await getManagedSigDirectoryAsync("admin")).map((group) => ({ id: group.slug, title: group.name, subtitle: group.abbreviation, image: group.logo, typeLabel: "Special interest group" }));
  if (scope === "professional-resources") return (await getAllProfessionalResourceSourcesAsync("admin")).map((resource) => ({ id: resource.id, title: resource.title, subtitle: resource.collection, image: resource.image, typeLabel: resource.kind === "bulletin" ? "E-Bulletin" : resource.kind === "publication" ? "Publication" : resource.kind === "partner" ? "Partner resource" : "Document" }));
  const countries = await getManagedMemberCountriesAsync();
  if (scope === "member-countries") return countries.map((country) => ({ id: country.slug, title: country.country, subtitle: `${country.societies.length} national societies`, image: `/Arab Flags/${country.flag}`, typeLabel: "Member country" }));
  if (scope === "member-societies") return countries.flatMap((country) => country.societies.map((society) => ({ id: society.id, title: society.name, subtitle: country.country, image: `/Arab Flags/${country.flag}`, typeLabel: "National society" })));
  const [placements, doctors] = await Promise.all([getManagedArlar27PeopleAsync(scope === "arlar27-committee" ? "committee" : "faculty", "admin"), listManagedDoctorsAsync()]);
  return placements.flatMap((placement) => {
    const doctor = doctors.find((candidate) => candidate.id === placement.doctorId);
    return doctor ? [{ id: placement.id, title: doctor.fullName, subtitle: `${placement.role} · ${placement.group}`, image: doctor.image, typeLabel: scope === "arlar27-committee" ? "Committee placement" : "Faculty placement" }] : [];
  });
}
