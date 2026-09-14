import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import arlar21Data from "@/data/arlar21-jordan.json";
import arlar23Data from "@/data/arlar23-kuwait.json";
import { getDeletedAdminRecordIds, getDeletedAdminRecordIdsAsync, isAdminRecordDeleted } from "@/lib/admin-deletion-repository";
import { getArlar23GalleryImages } from "@/lib/arlar23-gallery";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabasePublicDataClient, getCurrentAdminProfileId, reportSupabaseReadFallback } from "@/lib/supabase/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CongressVideo = { id: string; title: string; speaker: string; date: string; day: string; track: string; room: string; youtubeId: string; watchUrl: string; duration: string; description: string; thumbnail: string; status: "published" | "draft" };
export type CongressRecord = { id: string; title: string; dateRange: string; location: string; image: string; publicHref: string; introduction: string; status: "published" | "draft"; videos: CongressVideo[]; gallery: Array<{ day?: number; order?: number; label?: string; src?: string; thumbnailSrc?: string; alt?: string }>; speakers: Array<{ speaker: string; videoCount: number; talkTitles?: string[]; tracks?: string[] }>; tracks: Array<{ track: string; videoCount: number; totalDurationHuman?: string }> };
type CongressStore = { version: 1; records: Record<string, CongressRecord> };

const stateDirectory = path.join(process.cwd(), ".admin-data");
const statePath = path.join(stateDirectory, "congresses.json");

export function getAllCongresses() {
  return getAllCongressSources().filter((congress) => !isAdminRecordDeleted("congresses", congress.id));
}

export function getAllCongressSources() {
  const source = sourceCongresses();
  const store = readStore();
  const sourceIds = new Set(source.map((congress) => congress.id));
  return [...source.map((congress) => store.records[congress.id] || congress), ...Object.values(store.records).filter((congress) => !sourceIds.has(congress.id))]
    .map((congress) => ({ ...congress, videos: ensureUniqueVideoIds(congress.videos) }));
}

export function getCongress(id: string): CongressRecord | null {
  const congress = getAllCongresses().find((candidate) => candidate.id === id);
  if (!congress) return null;
  const deletedReplayIds = getDeletedAdminRecordIds("congress-replays");
  return { ...congress, videos: congress.videos.filter((video) => !deletedReplayIds.has(`${id}:${video.id}`)) };
}

export function saveCongress(record: CongressRecord) {
  const clean = sanitizeCongress(record);
  const store = readStore();
  store.records[clean.id] = clean;
  writeStore(store);
  return clean;
}

export function saveCongressVideo(congressId: string, video: CongressVideo) {
  const congress = getAllCongressSources().find((candidate) => candidate.id === congressId);
  if (!congress) throw new Error("Congress not found.");
  const cleanVideo = sanitizeVideo(video);
  const videos = [...congress.videos];
  const index = videos.findIndex((candidate) => candidate.id === cleanVideo.id);
  if (index >= 0) videos[index] = cleanVideo;
  else videos.unshift(cleanVideo);
  return saveCongress({ ...congress, videos });
}

export function createCongressId(title: string) {
  const base = title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const candidate = (base || "arlar-congress").slice(0, 90);
  const existing = new Set(getAllCongressSources().map((congress) => congress.id));
  if (!existing.has(candidate)) return candidate;
  let suffix = 2;
  while (existing.has(`${candidate}-${suffix}`)) suffix += 1;
  return `${candidate}-${suffix}`;
}

export function extractYoutubeId(value: string) {
  return value.match(/(?:youtu\.be\/|[?&]v=|embed\/)([a-zA-Z0-9_-]{6,})/)?.[1] || "";
}

function sourceCongresses(): CongressRecord[] {
  const data23 = arlar23Data as typeof arlar23Data;
  const data21 = arlar21Data as typeof arlar21Data;
  return [
    { id: "arlar23", title: data23.meta.title, dateRange: data23.meta.dateRange, location: data23.meta.location, image: "/images/arlar23/congress-mark.png", publicHref: "/congresses/arlar23-replay", introduction: `Browse the complete ${data23.meta.title} replay archive.`, status: "published", videos: ensureUniqueVideoIds(data23.videos.map((video) => ({ id: video.youtubeId, title: video.title, speaker: video.speakers.join(", "), date: video.dateLabel, day: `Day ${video.day}`, track: video.program, room: video.room, youtubeId: video.youtubeId, watchUrl: `https://youtube.com/watch?v=${video.youtubeId}`, duration: "", description: video.title, thumbnail: "", status: "published" }))), gallery: getArlar23GalleryImages(), speakers: [], tracks: [] },
    { id: "arlar21", title: "ArLAR21 Jordan e-Congress", dateRange: "3–7 March 2021", location: "Jordan · Virtual meeting", image: "/images/arlar21/page/arlar21-congress-logo.png", publicHref: "/congresses/arlar21-replay", introduction: "Browse the complete ArLAR21 Jordan e-Congress replay archive.", status: "published", videos: ensureUniqueVideoIds(data21.videos.map((video) => ({ id: video.youtubeId, title: video.titleFull, speaker: video.speaker, date: video.uploadDate.slice(0, 10), day: `Gallery ${video.galleryGroup}`, track: video.trackNormalized, room: "Virtual", youtubeId: video.youtubeId, watchUrl: video.watchUrl, duration: video.durationHuman, description: [video.titleFull, video.speaker].filter(Boolean).join(" — "), thumbnail: "", status: "published" }))), gallery: [], speakers: data21.speakers, tracks: data21.tracks },
  ];
}

function readStore(): CongressStore {
  if (!existsSync(statePath)) return { version: 1, records: {} };
  try { const parsed = JSON.parse(readFileSync(statePath, "utf8")) as Partial<CongressStore>; return { version: 1, records: parsed.records && typeof parsed.records === "object" ? parsed.records : {} }; }
  catch { return { version: 1, records: {} }; }
}

function writeStore(store: CongressStore) {
  mkdirSync(stateDirectory, { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, statePath);
}

function sanitizeCongress(record: CongressRecord): CongressRecord {
  const title = text(record.title, 180);
  if (!title) throw new Error("Congress title is required.");
  return { ...record, id: cleanId(record.id), title, dateRange: text(record.dateRange, 100), location: text(record.location, 140), image: media(record.image), publicHref: link(record.publicHref), introduction: text(record.introduction, 1200), status: record.status === "draft" ? "draft" : "published", videos: ensureUniqueVideoIds(record.videos.map(sanitizeVideo)), gallery: record.gallery.map((item) => ({ day: Number(item.day) || undefined, order: Number(item.order) || undefined, label: text(item.label, 100), src: media(item.src), thumbnailSrc: media(item.thumbnailSrc), alt: text(item.alt, 240) })), speakers: record.speakers.map((speaker) => ({ ...speaker, speaker: text(speaker.speaker, 140), videoCount: Number(speaker.videoCount) || 0 })), tracks: record.tracks.map((track) => ({ ...track, track: text(track.track, 140), videoCount: Number(track.videoCount) || 0 })) };
}

function ensureUniqueVideoIds(videos: CongressVideo[]) {
  const used = new Set<string>();
  return videos.map((video) => {
    const base = video.id;
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    return id === video.id ? video : { ...video, id };
  });
}

function sanitizeVideo(video: CongressVideo): CongressVideo {
  const title = text(video.title, 240);
  if (!title) throw new Error("Replay title is required.");
  const watchUrl = link(video.watchUrl);
  const youtubeId = text(video.youtubeId || extractYoutubeId(watchUrl), 30);
  return { ...video, id: cleanId(video.id || youtubeId), title, speaker: text(video.speaker, 240), date: text(video.date, 80), day: text(video.day, 80), track: text(video.track, 180), room: text(video.room, 100), youtubeId, watchUrl, duration: text(video.duration, 40), description: text(video.description, 1600), thumbnail: media(video.thumbnail), status: video.status === "draft" ? "draft" : "published" };
}

function text(value: unknown, max: number) { return String(value || "").trim().slice(0, max); }
function cleanId(value: unknown) { const clean = text(value, 180).replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, ""); if (!clean) throw new Error("A valid record ID is required."); return clean; }
function media(value: unknown) { const clean = text(value, 500); return clean.startsWith("/") || clean.startsWith("https://") ? clean : ""; }
function link(value: unknown) { const clean = text(value, 500); return clean.startsWith("/") || clean.startsWith("https://") || clean.startsWith("http://") ? clean : ""; }

export async function getAllCongressSourcesAsync(access: "public" | "admin" = "public"): Promise<CongressRecord[]> {
  if (!getSupabasePublicConfig()) return getAllCongressSources();
  try {
    const supabase = access === "admin" ? await createSupabaseServerClient() : createSupabasePublicDataClient();
    if (!supabase) return getAllCongressSources();
    const [{ data: congressRows, error: congressError }, { data: videoRows, error: videoError }, { data: galleryRows, error: galleryError }] = await Promise.all([
      supabase.from("admin_congresses").select("id, status, data").order("updated_at", { ascending: false }),
      supabase.from("admin_congress_videos").select("congress_id, status, sort_order, data").order("sort_order"),
      supabase.from("admin_congress_gallery").select("congress_id, day, sort_order, data").order("sort_order"),
    ]);
    const error = congressError || videoError || galleryError;
    if (error) throw error;
    if (!congressRows?.length) return getAllCongressSources();
    const sources = sourceCongresses();
    const sourceById = new Map(sources.map((congress) => [congress.id, congress]));
    const stored = congressRows.map((row) => {
      const base = row.data as Omit<CongressRecord, "videos" | "gallery">;
      const source = sourceById.get(row.id);
      const storedVideos = (videoRows || []).filter((video) => video.congress_id === row.id).map((video) => ({ ...(video.data as CongressVideo), status: video.status as "published" | "draft" }));
      const storedGallery = (galleryRows || []).filter((item) => item.congress_id === row.id).map((item) => ({ ...(item.data as CongressRecord["gallery"][number]), day: item.day || undefined }));
      // Legacy imports may contain the congress row before its child replay rows.
      // Keep the built-in replay archive visible until those child rows are present.
      const videos = storedVideos.length > 0 ? storedVideos : source?.videos || [];
      const gallery = storedGallery.length > 0 ? storedGallery : source?.gallery || [];
      return sanitizeCongress({ ...base, id: row.id, status: row.status as "published" | "draft", videos, gallery });
    });
    // Supabase rows override the bundled congresses; they do not replace the
    // whole catalogue. Otherwise saving one congress makes every untouched
    // seeded congress disappear from both the admin and public collections.
    const storedById = new Map(stored.map((congress) => [congress.id, congress]));
    const sourceIds = new Set(sources.map((congress) => congress.id));
    return [
      ...sources.map((congress) => storedById.get(congress.id) || congress),
      ...stored.filter((congress) => !sourceIds.has(congress.id)),
    ];
  } catch (error) {
    reportSupabaseReadFallback("admin-congresses", error);
    return getAllCongressSources();
  }
}

export async function getAllCongressesAsync(access: "public" | "admin" = "public") {
  const [congresses, deleted] = await Promise.all([getAllCongressSourcesAsync(access), getDeletedAdminRecordIdsAsync("congresses")]);
  return congresses.filter((congress) => !deleted.has(congress.id));
}

export async function getCongressAsync(id: string, access: "public" | "admin" = "public"): Promise<CongressRecord | null> {
  const [congresses, deletedReplayIds] = await Promise.all([getAllCongressesAsync(access), getDeletedAdminRecordIdsAsync("congress-replays")]);
  const congress = congresses.find((candidate) => candidate.id === id);
  return congress ? { ...congress, videos: congress.videos.filter((video) => !deletedReplayIds.has(`${id}:${video.id}`)) } : null;
}

export async function saveCongressAsync(record: CongressRecord) {
  const clean = sanitizeCongress(record);
  if (!getSupabasePublicConfig()) return saveCongress(clean);
  const supabase = await createSupabaseServerClient();
  const createdBy = await getCurrentAdminProfileId(supabase);
  const { error: congressError } = await supabase.from("admin_congresses").upsert({ id: clean.id, title: clean.title, status: clean.status, date_range: clean.dateRange, data: { ...clean, videos: undefined, gallery: undefined }, created_by: createdBy });
  if (congressError) throw congressError;
  const { error: videoDeleteError } = await supabase.from("admin_congress_videos").delete().eq("congress_id", clean.id);
  if (videoDeleteError) throw videoDeleteError;
  if (clean.videos.length) {
    const { error } = await supabase.from("admin_congress_videos").insert(clean.videos.map((video, index) => ({ id: `${clean.id}:${video.id}`, congress_id: clean.id, title: video.title, status: video.status, sort_order: index, data: video, created_by: createdBy })));
    if (error) throw error;
  }
  const { error: galleryDeleteError } = await supabase.from("admin_congress_gallery").delete().eq("congress_id", clean.id);
  if (galleryDeleteError) throw galleryDeleteError;
  if (clean.gallery.length) {
    const { error } = await supabase.from("admin_congress_gallery").insert(clean.gallery.map((item, index) => ({ congress_id: clean.id, day: item.day || null, sort_order: index, data: item, created_by: createdBy })));
    if (error) throw error;
  }
  return clean;
}

export async function saveCongressVideoAsync(congressId: string, video: CongressVideo) {
  const congress = await getCongressAsync(congressId, "admin");
  if (!congress) throw new Error("Congress not found.");
  const cleanVideo = sanitizeVideo(video);
  const videos = [...congress.videos];
  const index = videos.findIndex((candidate) => candidate.id === cleanVideo.id);
  if (index >= 0) videos[index] = cleanVideo;
  else videos.unshift(cleanVideo);
  return saveCongressAsync({ ...congress, videos });
}

export async function createCongressIdAsync(title: string) {
  const base = title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const candidate = (base || "arlar-congress").slice(0, 90);
  const existing = new Set((await getAllCongressSourcesAsync("admin")).map((congress) => congress.id));
  if (!existing.has(candidate)) return candidate;
  let suffix = 2;
  while (existing.has(`${candidate}-${suffix}`)) suffix += 1;
  return `${candidate}-${suffix}`;
}

// Local persistence boundary for later Supabase congress, replay, and gallery tables.
