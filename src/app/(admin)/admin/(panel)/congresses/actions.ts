"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createCongressIdAsync, extractYoutubeId, getAllCongressSourcesAsync, getCongressAsync, saveCongressAsync, saveCongressVideoAsync, type CongressRecord, type CongressVideo } from "@/lib/admin-congress-data";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";
import { revalidateLocalizedPaths, revalidatePublicSitemap } from "@/lib/public-revalidation";

export async function saveCongressAction(id: string, formData: FormData) {
  const actor = await requireAdminPermission("congresses");
  const existing = (await getAllCongressSourcesAsync("admin")).find((congress) => congress.id === id);
  if (!existing) throw new Error("Congress not found.");
  const record = congressFromForm(existing, formData);
  await saveCongressAsync(record);
  await recordAdminAuditLogAsync({ module: "congresses", action: "Congress saved", entityType: "congress", entityId: record.id, targetLabel: record.title, detail: `Congress archive ${record.status}.`, actorEmail: actor.email });
  revalidateCongress(record);
  redirect(`/admin/congresses/${record.id}?saved=1`);
}

export async function createCongressAction(formData: FormData) {
  const actor = await requireAdminPermission("congresses");
  const title = required(formData, "title");
  const id = await createCongressIdAsync(title);
  const empty: CongressRecord = { id, title, dateRange: "", location: "", image: "", publicHref: "", introduction: "", status: "draft", videos: [], gallery: [], speakers: [], tracks: [] };
  const record = congressFromForm(empty, formData);
  await saveCongressAsync(record);
  await recordAdminAuditLogAsync({ module: "congresses", action: "Congress created", entityType: "congress", entityId: record.id, targetLabel: record.title, detail: "Congress archive created as a draft.", actorEmail: actor.email });
  revalidateCongress(record);
  redirect(`/admin/congresses/${record.id}?created=1`);
}

export async function saveCongressReplayAction(congressId: string, videoId: string, formData: FormData) {
  const actor = await requireAdminPermission("congresses");
  const existingCongress = await getCongressAsync(congressId, "admin");
  if (!existingCongress) throw new Error("Congress not found.");
  const watchUrl = required(formData, "watchUrl");
  const youtubeId = extractYoutubeId(watchUrl) || String(formData.get("youtubeId") || "").trim();
  const existing = existingCongress.videos.find((video) => video.id === videoId);
  const resolvedId = videoId === "new" ? uniqueReplayId(existingCongress, youtubeId || `replay-${Date.now()}`) : videoId;
  const video: CongressVideo = {
    id: resolvedId,
    title: required(formData, "title"),
    speaker: String(formData.get("speaker") || ""),
    date: String(formData.get("date") || ""),
    day: String(formData.get("day") || ""),
    track: String(formData.get("track") || ""),
    room: String(formData.get("room") || ""),
    youtubeId,
    watchUrl,
    duration: String(formData.get("duration") || existing?.duration || ""),
    description: String(formData.get("description") || ""),
    thumbnail: String(formData.get("thumbnail") || ""),
    status: formData.get("status") === "draft" ? "draft" : "published",
  };
  await saveCongressVideoAsync(congressId, video);
  await recordAdminAuditLogAsync({ module: "congresses", action: videoId === "new" ? "Replay created" : "Replay saved", entityType: "congress-replay", entityId: `${congressId}:${resolvedId}`, targetLabel: video.title, detail: `Replay ${video.status}.`, actorEmail: actor.email });
  revalidateCongress(existingCongress);
  redirect(`/admin/congresses/${congressId}/replays/${resolvedId}?saved=1`);
}

function congressFromForm(existing: CongressRecord, formData: FormData): CongressRecord {
  return {
    ...existing,
    title: formData.has("title") ? required(formData, "title") : existing.title,
    dateRange: formValue(formData, "dateRange", existing.dateRange),
    location: formValue(formData, "location", existing.location),
    publicHref: formValue(formData, "publicHref", existing.publicHref),
    introduction: formValue(formData, "introduction", existing.introduction),
    image: formValue(formData, "image", existing.image),
    status: formData.has("status") ? (formData.get("status") === "draft" ? "draft" : "published") : existing.status,
    gallery: parseJson(formData.get("gallery"), existing.gallery),
    speakers: parseJson(formData.get("speakers"), existing.speakers),
    tracks: parseJson(formData.get("tracks"), existing.tracks),
  };
}

function formValue(formData: FormData, name: string, fallback: string) {
  return formData.has(name) ? String(formData.get(name) || "") : fallback;
}

function parseJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (value === null) return fallback;
  try { return JSON.parse(String(value)) as T; }
  catch { throw new Error("One of the congress collections could not be saved."); }
}

function required(formData: FormData, name: string) {
  const value = String(formData.get(name) || "").trim();
  if (!value) throw new Error(`The ${name.replaceAll(/([A-Z])/g, " $1").toLowerCase()} field is required.`);
  return value;
}

function uniqueReplayId(congress: CongressRecord, base: string) {
  const ids = new Set(congress.videos.map((video) => video.id));
  let id = base;
  let suffix = 2;
  while (ids.has(id)) id = `${base}-${suffix++}`;
  return id;
}

function revalidateCongress(congress: CongressRecord) {
  revalidatePath("/admin/congresses");
  revalidatePath(`/admin/congresses/${congress.id}`);
  revalidateLocalizedPaths([congress.publicHref || "/education", "/education"]);
  revalidatePublicSitemap();
}
