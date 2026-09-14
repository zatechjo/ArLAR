import aaaaArchive from "@/data/aaaa-video-library.json";
import arlar21 from "@/data/arlar21-jordan.json";
import arlar23 from "@/data/arlar23-kuwait.json";
import archPublications from "@/data/arch-publications";
import collegeArchive from "@/data/college-events.json";
import { sigProfiles } from "@/data/sig-profiles";
import { publicMediaUrl } from "@/lib/media-url";

export type LibraryResourceKind =
  | "webinar"
  | "congress"
  | "publication"
  | "bulletin"
  | "case"
  | "document";

export type LibraryResource = {
  id: string;
  kind: LibraryResourceKind;
  title: string;
  description?: string;
  collection: string;
  collectionHref: string;
  date?: string;
  year?: number;
  speakers: string[];
  topics: string[];
  image?: string;
  mediaUrl?: string;
  startSeconds?: number;
  href?: string;
  action: string;
};

export type LibraryCollection = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  href: string;
  image: string;
  accent: "jade" | "crimson" | "purple" | "blue";
};

const publications: LibraryResource[] = [
  {
    id: "publication-covid-practice",
    kind: "publication",
    title:
      "The impact of COVID-19 pandemic on rheumatology practice: a cross-sectional multinational study",
    description: "Published in Clinical Rheumatology.",
    collection: "ArLAR Publications",
    collectionHref: "/professionals/publications",
    date: "2020-09-01",
    year: 2020,
    speakers: [],
    topics: ["Research", "COVID-19", "Rheumatology practice"],
    image: "/images/publications/covid-practice-study-cover.jpg",
    href: publicMediaUrl("/documents/publications/covid-19-rheumatology-practice-study.pdf"),
    action: "Read study",
  },
  {
    id: "publication-covid-patients",
    kind: "publication",
    title:
      "Impact of the COVID-19 pandemic on patients with chronic rheumatic diseases: A study in 15 Arab countries",
    description: "Published in the International Journal of Rheumatic Diseases.",
    collection: "ArLAR Publications",
    collectionHref: "/professionals/publications",
    date: "2020-10-01",
    year: 2020,
    speakers: [],
    topics: ["Research", "COVID-19", "Chronic rheumatic diseases"],
    image: "/images/publications/chronic-diseases-study-cover.jpg",
    href: publicMediaUrl("/documents/publications/covid-19-chronic-rheumatic-diseases-study.pdf"),
    action: "Read study",
  },
  ...archPublications.map((publication) => ({
    id: publication.id,
    kind: "publication" as const,
    title: publication.title,
    description: `Published in ${publication.journal}.`,
    collection: "ArLAR Research Group (ARCH)",
    collectionHref: "/professionals/publications",
    date: `${publication.year}-01-01`,
    year: Number(publication.year),
    speakers: publication.authors,
    topics: ["Research", "ARCH", "ArLAR publication"],
    href: publication.href,
    action: "Open publication",
  })),
];

const bulletins: LibraryResource[] = [
  ["05", "Fifth issue", "2026-01-01", "January 2026", "jpg"],
  ["04", "Fourth issue", "2024-08-01", "August 2024", "jpg"],
  ["03", "Third issue", "2024-01-01", "January 2024", "png"],
  ["02", "Second issue", "2023-10-01", "October 2023", "jpg"],
  ["01", "First issue", "2022-01-01", "January 2022", "jpg"],
].map(([issue, label, date, dateLabel, extension]) => ({
  id: `bulletin-${issue}`,
  kind: "bulletin" as const,
  title: `ArLAR E-Bulletin — ${label}`,
  description: `${dateLabel} issue with news, activities, and updates from the ArLAR community.`,
  collection: "ArLAR E-Bulletin",
  collectionHref: "/professionals/e-bulletin",
  date,
  year: Number(date.slice(0, 4)),
  speakers: [],
  topics: ["Community", "News", "Rheumatology"],
  image: `/images/e-bulletin/issue-${issue}-cover.${extension}`,
  href: publicMediaUrl(`/documents/e-bulletin/arlar-e-bulletin-issue-${issue}.pdf`),
  action: "Open issue",
}));

const collegeResources: LibraryResource[] = collegeArchive.events.map((event) => ({
  id: `college-${event.id}`,
  kind: "webinar",
  title: event.title,
  collection: "ArLAR College",
  collectionHref: "/college/events",
  date: event.date,
  year: event.year,
  speakers: event.speakers ? [event.speakers] : [],
  topics: event.groups,
  image: `/images/arlar-college-events/${event.image}`,
  mediaUrl: event.webinarUrl,
  action: "Watch webinar",
}));

const aaaaResources: LibraryResource[] = aaaaArchive.videos.map((video) => {
  const event = aaaaArchive.events.find(
    (candidate) => candidate.eventOrder === video.eventOrder,
  );
  const youtubeId = video.videoUrl.match(/[?&]v=([^&]+)/)?.[1];

  return {
    id: `aaaa-${video.id}`,
    kind: "webinar",
    title: video.title,
    description: event?.heading,
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

const arlar21Resources: LibraryResource[] = arlar21.videos.map((video) => ({
  id: `arlar21-${video.order}`,
  kind: "congress",
  title: video.titleFull,
  description: video.trackNormalized || "ArLAR21 Jordan e-Congress session",
  collection: "ArLAR21 Jordan",
  collectionHref: "/congresses/arlar21-replay",
  date: "2021-03-03",
  year: 2021,
  speakers: video.speaker ? [video.speaker] : [],
  topics: video.trackNormalized ? [video.trackNormalized] : ["Congress replay"],
  image: `/images/arlar21/videos/${String(video.order).padStart(3, "0")}-${video.youtubeId}.jpg`,
  mediaUrl: video.watchUrl,
  action: "Watch replay",
}));

const arlar23Resources: LibraryResource[] = arlar23.videos.map((video) => ({
  id: `arlar23-${video.order}`,
  kind: "congress",
  title: video.title,
  description: [video.program, video.room].filter(Boolean).join(" · "),
  collection: "ArLAR23 Kuwait",
  collectionHref: "/congresses/arlar23-replay",
  date: video.date,
  year: 2023,
  speakers: video.speakers,
  topics: [video.program, "Congress replay"],
  image: `/images/arlar23/videos/${video.youtubeId}.jpg`,
  mediaUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
  action: "Watch replay",
}));

const sigResources: LibraryResource[] = sigProfiles.flatMap((profile) => {
  const collectionHref = `/special-interest-groups/${profile.slug}`;
  const resources: LibraryResource[] = [];

  if (profile.document) {
    resources.push({
      id: `sig-${profile.slug}-document`,
      kind: "document",
      title: profile.document.title,
      description: profile.description,
      collection: profile.name,
      collectionHref,
      speakers: [],
      topics: [profile.abbreviation, "Group document"],
      image: profile.logo,
      href: profile.document.href,
      action: profile.document.action,
    });
  }

  profile.tabs.forEach((tab) => {
    if (tab.kind === "replays") {
      tab.replays.forEach((replay, index) => {
        const parsedDate = new Date(replay.date);
        const validDate = Number.isNaN(parsedDate.valueOf())
          ? undefined
          : parsedDate.toISOString();
        resources.push({
          id: `sig-${profile.slug}-replay-${index}`,
          kind: "webinar",
          title: replay.title,
          description: tab.intro || profile.description,
          collection: profile.name,
          collectionHref,
          date: validDate,
          year: validDate ? parsedDate.getUTCFullYear() : undefined,
          speakers: [],
          topics: [profile.abbreviation, tab.label],
          image: profile.logo,
          mediaUrl: replay.href,
          action: "Watch webinar",
        });
      });
    }

    if (tab.kind === "resources") {
      tab.resources.forEach((resource, index) => {
        resources.push({
          id: `sig-${profile.slug}-${tab.id}-${index}`,
          kind: resource.action.toLowerCase().includes("publication")
            ? "publication"
            : "document",
          title: resource.title,
          description: resource.description || profile.description,
          collection: profile.name,
          collectionHref,
          date: resource.date,
          year: resource.date ? Number(resource.date.slice(0, 4)) : undefined,
          speakers: [],
          topics: [profile.abbreviation, tab.label],
          image: profile.logo,
          href: resource.href,
          action: resource.action,
        });
      });
    }

    if (tab.kind === "cases") {
      tab.cases.forEach((clinicalCase, index) => {
        resources.push({
          id: `sig-${profile.slug}-case-${index}`,
          kind: "case",
          title: clinicalCase.title,
          description: clinicalCase.prompt[0],
          collection: profile.name,
          collectionHref,
          speakers: [],
          topics: [profile.abbreviation, "Clinical case"],
          image: clinicalCase.images[0] || profile.logo,
          href: `${collectionHref}#${tab.id}`,
          action: "Explore case",
        });
      });
    }
  });

  return resources;
});

function deduplicate(resources: LibraryResource[]) {
  const seenMedia = new Set<string>();

  return resources.filter((resource) => {
    if (!resource.mediaUrl) return true;
    const key = `${resource.mediaUrl}|${resource.startSeconds ?? 0}`;
    if (seenMedia.has(key)) return false;
    seenMedia.add(key);
    return true;
  });
}

export const libraryResources = deduplicate([
  ...collegeResources,
  ...aaaaResources,
  ...arlar21Resources,
  ...arlar23Resources,
  ...publications,
  ...bulletins,
  ...sigResources,
]);

export const libraryCollections: LibraryCollection[] = [
  {
    id: "ArLAR College",
    shortName: "College",
    name: "ArLAR College Replays",
    description: "Current expert-led webinars from ArLAR and its clinical groups.",
    href: "/college/events",
    image: collegeResources[0]?.image || "/images/arlar-college-learning-laptop.png",
    accent: "jade",
  },
  {
    id: "AAAA Group",
    shortName: "AAAA",
    name: "Arthritis Awareness Archive",
    description: "Patient-focused sessions, practical education, and live Q&A.",
    href: "/special-interest-groups/arab-adult-arthritis-awareness#past-webinars",
    image: "/images/special-interest-groups/aaaa.png",
    accent: "crimson",
  },
  {
    id: "ArLAR21 Jordan",
    shortName: "ArLAR21",
    name: "ArLAR21 Congress Replays",
    description: "The complete Jordan e-Congress scientific programme on demand.",
    href: "/congresses/arlar21-replay",
    image: "/images/arlar21/page/arlar21-replay.png",
    accent: "purple",
  },
  {
    id: "ArLAR23 Kuwait",
    shortName: "ArLAR23",
    name: "ArLAR23 Kuwait Replays",
    description: "The complete available three-day Kuwait Congress replay archive.",
    href: "/congresses/arlar23-replay",
    image: "/images/arlar23/congress-mark.png",
    accent: "jade",
  },
  {
    id: "ArLAR Publications",
    shortName: "Research",
    name: "Research & Publications",
    description: "Peer-reviewed ArLAR studies ready to read or download.",
    href: "/professionals/publications",
    image: "/images/publications/covid-practice-study-cover.jpg",
    accent: "blue",
  },
  {
    id: "ArLAR Research Group (ARCH)",
    shortName: "ARCH",
    name: "ARCH Research Publications",
    description: "Peer-reviewed studies from the ArLAR Research Group.",
    href: "/professionals/publications",
    image: "/images/publications/covid-practice-study-cover.jpg",
    accent: "jade",
  },
  {
    id: "ArLAR E-Bulletin",
    shortName: "Bulletins",
    name: "ArLAR E-Bulletin",
    description: "Every issue of the regional community and activity archive.",
    href: "/professionals/e-bulletin",
    image: "/images/e-bulletin/issue-05-cover.jpg",
    accent: "crimson",
  },
];

export const libraryStats = {
  total: libraryResources.length,
  videos: libraryResources.filter(
    (resource) => resource.kind === "webinar" || resource.kind === "congress",
  ).length,
  documents: libraryResources.filter(
    (resource) =>
      resource.kind === "publication" ||
      resource.kind === "bulletin" ||
      resource.kind === "document",
  ).length,
  collections: new Set(libraryResources.map((resource) => resource.collection)).size,
};
