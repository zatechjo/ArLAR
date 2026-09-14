import "server-only";

import aaaaArchive from "@/data/aaaa-video-library.json";
import { listManagedCollegeEventsAsync } from "@/lib/admin-college-repository";
import { getAllCongressesAsync } from "@/lib/admin-congress-data";
import { getDeletedAdminRecordIdsAsync } from "@/lib/admin-deletion-repository";
import { libraryResources, type LibraryResource } from "@/lib/educational-library";
import { getPublishedProfessionalLibraryResourcesAsync } from "@/lib/professional-resources-repository";
import { getManagedSigDirectoryAsync, getManagedSigProfileAsync } from "@/lib/sig-directory-repository";
import { getPublishedSiteContent } from "@/lib/site-content-repository";
import { publicMediaUrl } from "@/lib/media-url";

export async function getManagedEducationalLibrary(): Promise<LibraryResource[]> {
  const [college, congresses, sigDirectory, professional, managedAaaa, deletedCollege, deletedCongresses, deletedReplays] = await Promise.all([
    listManagedCollegeEventsAsync(),
    getAllCongressesAsync(),
    getManagedSigDirectoryAsync(),
    getPublishedProfessionalLibraryResourcesAsync(),
    getPublishedSiteContent("education", "aaaa-video-library", aaaaArchive),
    getDeletedAdminRecordIdsAsync("college-events"),
    getDeletedAdminRecordIdsAsync("congresses"),
    getDeletedAdminRecordIdsAsync("congress-replays"),
  ]);
  const sigProfiles = (await Promise.all(sigDirectory.filter((group) => group.visible).map((group) => getManagedSigProfileAsync(group.slug)))).filter(Boolean);

  const collegeResources: LibraryResource[] = college.filter((event) => event.status !== "draft" && !deletedCollege.has(event.id || "")).map((event) => ({
    id: `college-${event.id || "event"}`, kind: "webinar", title: event.title || "ArLAR College webinar", collection: "ArLAR College", collectionHref: "/college/events", date: event.date, year: event.year,
    speakers: event.speakers ? [event.speakers] : [], topics: event.groups || [], image: event.image ? (event.image.startsWith("/") || event.image.startsWith("http") ? event.image : `/images/arlar-college-events/${event.image}`) : undefined,
    mediaUrl: event.webinarUrl, action: "Watch webinar",
  }));
  const congressResources: LibraryResource[] = congresses.filter((congress) => congress.status === "published" && !deletedCongresses.has(congress.id)).flatMap((congress) => congress.videos.filter((video) => video.status === "published" && !deletedReplays.has(`${congress.id}:${video.id}`)).map((video) => ({
    id: `${congress.id}-${video.id}`, kind: "congress" as const, title: video.title, description: video.description || video.track || `${congress.title} session`, collection: congressCollectionName(congress.id, congress.title),
    collectionHref: congress.publicHref || `/congresses/${congress.id}`, date: video.date, year: Number(video.date?.slice(0, 4)) || undefined, speakers: video.speaker ? [video.speaker] : [],
    topics: [video.track, "Congress replay"].filter(Boolean), image: video.thumbnail || (video.youtubeId ? `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg` : congress.image), mediaUrl: video.watchUrl, action: "Watch replay",
  })));
  const sigResources: LibraryResource[] = sigProfiles.flatMap((profile) => {
    if (!profile) return [];
    const href = `/special-interest-groups/${profile.slug}`;
    return profile.tabs.flatMap((tab): LibraryResource[] => {
      if (tab.kind === "replays") return tab.replays.map((replay, index) => ({ id: `sig-${profile.slug}-replay-${index}`, kind: "webinar" as const, title: replay.title, description: tab.intro || profile.description, collection: profile.name, collectionHref: href, date: replay.date, year: Number(replay.date.match(/\d{4}/)?.[0]) || undefined, speakers: [], topics: [profile.abbreviation, tab.label], image: profile.logo, mediaUrl: replay.href, action: "Watch webinar" }));
      if (tab.kind === "resources") return tab.resources.map((resource, index) => ({ id: `sig-${profile.slug}-${tab.id}-${index}`, kind: "document" as const, title: resource.title, description: resource.description || profile.description, collection: profile.name, collectionHref: href, date: resource.date, year: resource.date ? Number(resource.date.slice(0, 4)) : undefined, speakers: [], topics: [profile.abbreviation, tab.label], image: profile.logo, href: publicMediaUrl(resource.href), action: resource.action }));
      if (tab.kind === "cases") return tab.cases.map((item, index) => ({ id: `sig-${profile.slug}-case-${index}`, kind: "case" as const, title: item.title, description: item.prompt[0], collection: profile.name, collectionHref: href, speakers: [], topics: [profile.abbreviation, "Clinical case"], image: item.images[0] || profile.logo, href: `${href}#${tab.id}`, action: "Explore case" }));
      return [];
    });
  });
  const aaaaResources: LibraryResource[] = managedAaaa.videos.map((video) => {
    const youtubeId = video.videoUrl.match(/[?&]v=([^&]+)/)?.[1];
    return {
      id: `aaaa-${video.id}`,
      kind: "webinar",
      title: video.title,
      collection: "AAAA Group",
      collectionHref: "/special-interest-groups/arab-adult-arthritis-awareness#past-webinars",
      date: video.eventDate,
      year: video.year,
      speakers: video.speakers,
      topics: [
        "Patient education",
        "Arthritis awareness",
        video.type === "qa" ? "Questions and answers" : "Clinical session",
      ],
      image: youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined,
      mediaUrl: video.videoUrl,
      startSeconds: video.startSeconds,
      action: video.type === "qa" ? "Watch Q&A" : "Watch session",
    };
  });
  // Keep the built-in ArLAR21/23 replay entries as a safety net when a legacy
  // Supabase import contains the congress rows but not their child videos.
  const retainedStatic = libraryResources.filter((resource) => !/^(college-|sig-|aaaa-|publication-|bulletin-)/.test(resource.id));
  return deduplicate([...collegeResources, ...aaaaResources, ...congressResources, ...professional, ...sigResources, ...retainedStatic]);
}

function congressCollectionName(id: string, title: string) {
  if (id === "arlar21") return "ArLAR21 Jordan";
  if (id === "arlar23") return "ArLAR23 Kuwait";
  return title;
}

function deduplicate(resources: LibraryResource[]) {
  const seen = new Set<string>();
  return resources.filter((resource) => {
    const key = resource.mediaUrl ? `${normalizeMediaUrl(resource.mediaUrl)}|${resource.startSeconds || 0}` : resource.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeMediaUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
      const id = host === "youtu.be" ? url.pathname.split("/").filter(Boolean)[0] : url.searchParams.get("v");
      if (id) return `youtube:${id}`;
    }
  } catch {
    // Keep non-URL media identifiers unchanged.
  }
  return value;
}
