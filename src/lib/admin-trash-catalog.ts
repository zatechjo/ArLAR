import "server-only";

import arlar21Data from "@/data/arlar21-jordan.json";
import arlar23Data from "@/data/arlar23-kuwait.json";
import { arlar27Committee, arlar27Faculty } from "@/data/arlar27";
import collegeData from "@/data/college-events.json";
import { doctorDatabase } from "@/data/doctor-database";
import {
  getTrashedAdminRecords,
  type AdminDeletionScope,
} from "@/lib/admin-deletion-repository";
import { getTrashedCollegeUpcomingEvent } from "@/lib/college-upcoming-event";
import { getAllProfessionalResourceSources } from "@/lib/professional-resources-repository";
import { getManagedSigDirectory } from "@/lib/sig-directory-repository";
import { getManagedMemberCountries } from "@/lib/member-societies-repository";
import { getAllCongressSources } from "@/lib/admin-congress-data";

export type AdminTrashItem = {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  deletedAt: string;
  typeLabel: string;
};

export const recycleBinConfig: Record<AdminDeletionScope, { title: string; description: string; returnHref: string }> = {
  doctors: { title: "Doctor trash", description: "Restore doctor profiles or delete them permanently.", returnHref: "/admin/doctors" },
  "college-events": { title: "College trash", description: "Restore scheduled webinars and archive replays or delete them permanently.", returnHref: "/admin/college" },
  congresses: { title: "Congress trash", description: "Restore congress archives or delete them permanently.", returnHref: "/admin/congresses" },
  "congress-replays": { title: "Replay trash", description: "Restore congress recordings or delete them permanently.", returnHref: "/admin/congresses" },
  sigs: { title: "SIG trash", description: "Restore special interest groups or delete them permanently.", returnHref: "/admin/sigs" },
  "professional-resources": { title: "Resource trash", description: "Restore publications and resources or delete them permanently.", returnHref: "/admin/professionals" },
  "member-countries": { title: "Members trash", description: "Restore member-country records or delete them permanently.", returnHref: "/admin/members" },
  "member-societies": { title: "Societies trash", description: "Restore national societies or delete them permanently.", returnHref: "/admin/members" },
  "arlar27-committee": { title: "Committee trash", description: "Restore ArLAR27 committee placements or delete them permanently.", returnHref: "/admin/arlar27/committee" },
  "arlar27-faculty": { title: "Faculty trash", description: "Restore ArLAR27 faculty placements or delete them permanently.", returnHref: "/admin/arlar27/faculty" },
};

export function isAdminDeletionScope(value: string): value is AdminDeletionScope {
  return Object.hasOwn(recycleBinConfig, value);
}

export function getAdminTrashItems(scope: AdminDeletionScope, context?: string) {
  const trashed = getTrashedAdminRecords(scope);
  const source = getSourceItems(scope);
  const items = source.flatMap((item): AdminTrashItem[] => {
    const deletedAt = trashed.get(item.id);
    if (!deletedAt) return [];
    if (context && scope === "congress-replays" && !item.id.startsWith(`${context}:`)) return [];
    return [{ ...item, deletedAt }];
  });

  if (scope === "college-events") {
    const upcoming = getTrashedCollegeUpcomingEvent();
    if (upcoming) {
      items.push({
        id: "scheduled-webinar",
        title: upcoming.title || "Scheduled webinar",
        subtitle: [upcoming.startsAt, ...upcoming.groups].filter(Boolean).join(" · "),
        image: upcoming.banner,
        deletedAt: upcoming.deletedAt,
        typeLabel: "Scheduled webinar",
      });
    }
  }

  return items.toSorted((left, right) => right.deletedAt.localeCompare(left.deletedAt));
}

function getSourceItems(scope: AdminDeletionScope): Array<Omit<AdminTrashItem, "deletedAt">> {
  if (scope === "doctors") {
    return doctorDatabase.map((doctor) => ({ id: doctor.id, title: doctor.fullName, subtitle: doctor.country, image: doctor.image, typeLabel: "Doctor" }));
  }
  if (scope === "college-events") {
    return collegeData.events.map((event) => ({ id: event.id, title: event.title, subtitle: [event.date, ...event.groups].filter(Boolean).join(" · "), image: `/images/arlar-college-events/${event.image}`, typeLabel: "Webinar replay" }));
  }
  if (scope === "congresses") {
    return getAllCongressSources().map((congress) => ({ id: congress.id, title: congress.title, subtitle: [congress.dateRange, congress.location].filter(Boolean).join(" · "), image: congress.image, typeLabel: "Congress" }));
  }
  if (scope === "congress-replays") {
    return getAllCongressSources().flatMap((congress) => congress.videos.map((video) => ({ id: `${congress.id}:${video.id}`, title: video.title, subtitle: [video.speaker, congress.title].filter(Boolean).join(" · "), image: video.thumbnail || (video.youtubeId ? `https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg` : congress.image), typeLabel: "Congress replay" })));
  }
  if (false && scope === "congresses") {
    return [
      { id: "arlar23", title: "ArLAR23 Kuwait", subtitle: "Congress archive", image: "/images/arlar23/congress-mark.png", typeLabel: "Congress" },
      { id: "arlar21", title: "ArLAR21 Jordan e-Congress", subtitle: "Congress archive", image: "/images/arlar21/page/arlar21-congress-logo.png", typeLabel: "Congress" },
    ];
  }
  if (false && scope === "congress-replays") {
    return [
      ...arlar21Data.videos.map((video) => ({ id: `arlar21:${video.youtubeId}`, title: video.titleFull, subtitle: [video.speaker, "ArLAR21 Jordan"].filter(Boolean).join(" · "), image: `https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`, typeLabel: "Congress replay" })),
      ...arlar23Data.videos.map((video) => ({ id: `arlar23:${video.youtubeId}`, title: video.title, subtitle: [...video.speakers, "ArLAR23 Kuwait"].filter(Boolean).join(" · "), image: `https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`, typeLabel: "Congress replay" })),
    ];
  }
  if (scope === "sigs") {
    return getManagedSigDirectory().map((group) => ({ id: group.slug, title: group.name, subtitle: group.abbreviation, image: group.logo, typeLabel: "Special interest group" }));
  }
  if (scope === "professional-resources") {
    return getAllProfessionalResourceSources()
      .map((resource) => ({ id: resource.id, title: resource.title, subtitle: resource.collection, image: resource.image, typeLabel: resource.kind === "bulletin" ? "E-Bulletin" : resource.kind === "publication" ? "Publication" : resource.kind === "partner" ? "Partner resource" : "Document" }));
  }
  if (scope === "member-countries") {
    return getManagedMemberCountries().map((country) => ({ id: country.slug, title: country.country, subtitle: `${country.societies.length} national societ${country.societies.length === 1 ? "y" : "ies"}`, image: `/Arab Flags/${country.flag}`, typeLabel: "Member country" }));
  }
  if (scope === "member-societies") {
    return getManagedMemberCountries().flatMap((country) => country.societies.map((society) => ({ id: society.id, title: society.name, subtitle: country.country, image: `/Arab Flags/${country.flag}`, typeLabel: "National society" })));
  }

  const placements = scope === "arlar27-committee" ? arlar27Committee : arlar27Faculty;
  return placements.flatMap((placement) => {
    const doctor = doctorDatabase.find((candidate) => candidate.id === placement.doctorId);
    if (!doctor) return [];
    return [{ id: placement.id, title: doctor.fullName, subtitle: `${placement.role} · ${placement.group}`, image: doctor.image, typeLabel: scope === "arlar27-committee" ? "Committee placement" : "Faculty placement" }];
  });
}
