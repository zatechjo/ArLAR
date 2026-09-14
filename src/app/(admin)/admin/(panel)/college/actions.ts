"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { saveCollegeUpcomingEventAsync } from "@/lib/college-upcoming-event";
import { deleteAdminRecordAsync, restoreAdminRecordAsync } from "@/lib/admin-deletion-repository";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { getManagedCollegeEventAsync, saveManagedCollegeEventAsync } from "@/lib/admin-college-repository";
import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";
import { revalidateLocalizedPaths } from "@/lib/public-revalidation";

export async function saveUpcomingCollegeEventAction(formData: FormData) {
  const actor = await requireAdminPermission("college");
  const title = textValue(formData, "title");
  const date = textValue(formData, "event_date");
  const time = textValue(formData, "event_time");
  const banner = textValue(formData, "image");
  const registrationUrl = textValue(formData, "registration_url");
  const groups = parseGroups(formData.get("organising_groups"));
  const published = formData.get("intent") !== "draft";

  if (published) {
    const missing = [
      [title, "webinar title"],
      [date, "event date"],
      [time, "event time"],
      [groups.length, "organising group"],
      [banner, "webinar image"],
      [registrationUrl, "registration link"],
    ].filter(([value]) => !value).map(([, label]) => label);

    if (missing.length) {
      redirect(`/admin/college/new?error=${encodeURIComponent(`Add the ${missing.join(", ")} before publishing.`)}`);
    }
  }

  const startsAt = date && time ? `${date}T${time}:00+03:00` : "";
  if (startsAt && Number.isNaN(Date.parse(startsAt))) {
    redirect(`/admin/college/new?error=${encodeURIComponent("Choose a valid webinar date and time.")}`);
  }

  const speakers = nameList(formData, "speakers");
  const moderators = nameList(formData, "moderators");
  await saveCollegeUpcomingEventAsync({
    title,
    startsAt,
    groups,
    banner,
    registrationUrl,
    speakers,
    moderators,
    published,
    internalNotes: String(formData.get("internal_notes") || "").trim(),
  });
  // Scheduling a fresh webinar after an older one was trashed must make the
  // fixed scheduled-webinar record visible again.
  await restoreAdminRecordAsync("college-events", "scheduled-webinar");
  await recordAdminAuditLogAsync({ module: "college", action: "Upcoming event saved", entityType: "college-event", entityId: "scheduled-webinar", targetLabel: title || "Upcoming webinar", detail: `${published ? "Published" : "Draft"} webinar updated.`, actorEmail: actor.email });

  revalidateCollegeSurfaces();
  redirect("/admin/college");
}

export async function deleteUpcomingCollegeEventAction() {
  const actor = await requireAdminPermission("college");
  await deleteAdminRecordAsync("college-events", "scheduled-webinar");
  await recordAdminAuditLogAsync({ module: "college", action: "Upcoming event deleted", entityType: "college-event", entityId: "scheduled-webinar", targetLabel: "Upcoming webinar", detail: "Upcoming webinar removed.", actorEmail: actor.email });
  revalidateCollegeSurfaces();
}

export async function saveCollegeArchiveEventAction(id: string, formData: FormData) {
  const actor = await requireAdminPermission("college");
  const existing = await getManagedCollegeEventAsync(id, "admin");
  if (!existing) throw new Error("Webinar not found.");
  const date = textValue(formData, "event_date"); const time = textValue(formData, "event_time");
  const groups = parseGroups(formData.get("organising_groups"));
  await saveManagedCollegeEventAsync({
    ...existing, id, title: requiredValue(formData, "title"), date: date ? `${date}T${time || "00:00"}:00.000Z` : existing.date,
    year: Number(formData.get("archive_year")) || Number(date.slice(0, 4)) || existing.year,
    groups, webinarUrl: textValue(formData, "webinar_url"), image: textValue(formData, "image") || existing.image,
    status: formData.get("intent") === "draft" || formData.get("visible") !== "on" ? "draft" : "published",
    updatedDate: new Date().toISOString(),
  });
  await recordAdminAuditLogAsync({ module: "college", action: "Archive event saved", entityType: "college-event", entityId: id, targetLabel: requiredValue(formData, "title"), detail: "College archive event updated.", actorEmail: actor.email });
  revalidateCollegeSurfaces(); redirect(`/admin/college/${id}?saved=1`);
}

function revalidateCollegeSurfaces() {
  updateTag("public-deletions");
  updateTag("public-college-events");
  revalidatePath("/admin/college");
  revalidatePath("/admin/college/new");
  revalidateLocalizedPaths(["/", "/college", "/college/about", "/college/events", "/education", "/special-interest-groups"]);
}

/**
 * Collects a repeated field (one input per person) into the newline-separated
 * form the event record stores, dropping blank rows the editor left behind.
 */
function nameList(formData: FormData, name: string) {
  return formData.getAll(name).map((value) => String(value).trim()).filter(Boolean).join("\n");
}

function textValue(formData: FormData, name: string) {
  return String(formData.get(name) || "").trim();
}
function requiredValue(formData: FormData, name: string) { const value = textValue(formData, name); if (!value) throw new Error(`The ${name} field is required.`); return value; }

function parseGroups(value: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(String(value || "[]")) as unknown;
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim())))]
      : [];
  } catch {
    return [];
  }
}
