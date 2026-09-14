"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminPermission } from "@/lib/admin-authorization";
import {
  saveManagedArlar27AboutAsync,
  saveManagedArlar27ExternalAsync,
  saveManagedArlar27PeopleAsync,
  saveManagedArlar27WelcomeAsync,
  setArlar27SectionStatusAsync,
  type Arlar27SectionStatus,
} from "@/lib/arlar27-admin-repository";
import type { Arlar27PersonPlacement } from "@/data/arlar27";
import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";
import { revalidateLocalizedPaths } from "@/lib/public-revalidation";

export async function setArlar27SectionStatusAction(section: string, status: Arlar27SectionStatus) {
  const actor = await requireAdminPermission("arlar27");
  if (status !== "ready" && status !== "waiting") throw new Error("Invalid section status.");
  await setArlar27SectionStatusAsync(section, status);
  await recordAdminAuditLogAsync({ module: "arlar27", action: "Section status updated", entityType: "arlar27-section", entityId: section, targetLabel: section, detail: `Section marked ${status}.`, actorEmail: actor.email });
  revalidateArlar27();
}

export async function saveArlar27WelcomeAction(formData: FormData) {
  const actor = await requireAdminPermission("arlar27");
  const arabic = welcomeTranslation(formData, "ar");
  const french = welcomeTranslation(formData, "fr");
  await saveManagedArlar27WelcomeAsync({
    pageTitle: required(formData, "page_title"), pageDescription: text(formData, "page_description"), greeting: text(formData, "greeting"),
    paragraphs: paragraphs(formData.get("message_body")), closing: text(formData, "closing"), signoff: text(formData, "signoff"),
    authorDoctorId: required(formData, "author_doctor_id"), authorRoles: stringArray(formData.get("author_roles")),
    translations: { ...(arabic ? { ar: arabic } : {}), ...(french ? { fr: french } : {}) },
  });
  await recordAdminAuditLogAsync({ module: "arlar27", action: "Welcome page saved", entityType: "arlar27-content", entityId: "welcome", targetLabel: "Welcome page", detail: "ArLAR27 welcome content updated.", actorEmail: actor.email });
  revalidateArlar27(); redirect("/admin/arlar27/welcome?saved=1");
}

export async function saveArlar27AboutAction(formData: FormData) {
  const actor = await requireAdminPermission("arlar27");
  await saveManagedArlar27AboutAsync({
    pageTitle: required(formData, "page_title"), pageDescription: text(formData, "page_description"), destinationLabel: text(formData, "destination_label"),
    destination: text(formData, "destination"), heading: required(formData, "heading"), paragraphs: [text(formData, "paragraph_one"), text(formData, "paragraph_two")].filter(Boolean),
    planningTitle: text(formData, "planning_title"), planningCards: cardArray(formData.get("planning_cards")), heroImage: text(formData, "destination_image"),
    essentials: {
      eyebrow: text(formData, "essentials_eyebrow"), title: text(formData, "essentials_title"),
      intro: text(formData, "essentials_intro"), cards: essentialArray(formData.get("essentials_cards")),
    },
    gallery: {
      eyebrow: text(formData, "gallery_eyebrow"), title: text(formData, "gallery_title"),
      intro: text(formData, "gallery_intro"),
    },
    visa: {
      eyebrow: text(formData, "visa_eyebrow"), title: text(formData, "visa_title"), lead: text(formData, "visa_lead"),
      ctaLabel: text(formData, "visa_cta_label"), portalUrl: text(formData, "visa_portal_url"),
      facts: cardArray(formData.get("visa_facts")), note: text(formData, "visa_note"),
    },
    weather: {
      eyebrow: text(formData, "weather_eyebrow"), title: text(formData, "weather_title"),
      intro: text(formData, "weather_intro"), stats: statArray(formData.get("weather_stats")),
    },
  });
  await recordAdminAuditLogAsync({ module: "arlar27", action: "About page saved", entityType: "arlar27-content", entityId: "about-iraq", targetLabel: "About Iraq page", detail: "ArLAR27 About Iraq content updated.", actorEmail: actor.email });
  revalidateArlar27(); redirect("/admin/arlar27/about-iraq?saved=1");
}

export async function saveArlar27ExternalAction(kind: "abstracts" | "registration", label: string, formData: FormData) {
  const actor = await requireAdminPermission("arlar27");
  const url = text(formData, "redirect_url"); const enabled = formData.get("redirect_enabled") === "true";
  if (enabled && !isHttpUrl(url)) throw new Error("Enter a valid HTTP or HTTPS destination before enabling the redirect.");
  await saveManagedArlar27ExternalAsync(kind, { label, url, enabled });
  await recordAdminAuditLogAsync({ module: "arlar27", action: "External link updated", entityType: "arlar27-link", entityId: kind, targetLabel: label, detail: `${kind} redirect ${enabled ? "enabled" : "disabled"}.`, actorEmail: actor.email });
  revalidateArlar27(); redirect(`/admin/arlar27/${kind}?saved=1`);
}

export async function saveArlar27PeopleAction(kind: "committee" | "faculty", formData: FormData) {
  const actor = await requireAdminPermission("arlar27");
  const records = peopleArray(formData.get(`arlar27_${kind}`));
  await saveManagedArlar27PeopleAsync(kind, records);
  await recordAdminAuditLogAsync({ module: "arlar27", action: `${kind === "committee" ? "Committee" : "Faculty"} updated`, entityType: "arlar27-people", entityId: kind, targetLabel: kind, detail: `${records.length} placements saved.`, actorEmail: actor.email });
  revalidateArlar27(); redirect(`/admin/arlar27/${kind}?saved=1`);
}

function revalidateArlar27() {
  updateTag("public-arlar27");
  revalidatePath("/admin/arlar27", "layout");
  revalidateLocalizedPaths([
    "/congresses/arlar27",
    "/congresses/arlar27/about-iraq",
    "/congresses/arlar27/abstracts",
    "/congresses/arlar27/committee",
    "/congresses/arlar27/faculty",
    "/congresses/arlar27/programme",
    "/congresses/arlar27/registration",
    "/congresses/arlar27/welcome",
  ]);
}
function text(formData: FormData, name: string) { return String(formData.get(name) || "").trim(); }
function required(formData: FormData, name: string) { const value = text(formData, name); if (!value) throw new Error(`The ${name.replaceAll("_", " ")} field is required.`); return value; }
function paragraphs(value: FormDataEntryValue | null) { return String(value || "").split(/\r?\n\s*\r?\n/).map((item) => item.trim()).filter(Boolean); }
function lines(value: FormDataEntryValue | null) { return String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean); }
function welcomeTranslation(formData: FormData, locale: "ar" | "fr") {
  const translation = {
    pageTitle: text(formData, `page_title_${locale}`), pageDescription: text(formData, `page_description_${locale}`),
    greeting: text(formData, `greeting_${locale}`), paragraphs: paragraphs(formData.get(`message_body_${locale}`)),
    closing: text(formData, `closing_${locale}`), signoff: text(formData, `signoff_${locale}`),
    authorRoles: lines(formData.get(`author_roles_${locale}`)),
  };
  return Object.values(translation).some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value)) ? translation : undefined;
}
function stringArray(value: FormDataEntryValue | null): string[] { const parsed = parseArray(value); return parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim()); }
function cardArray(value: FormDataEntryValue | null) { return parseArray(value).flatMap((item, index) => { if (!item || typeof item !== "object") return []; const card = item as Record<string, unknown>; const title = String(card.title || "").trim(); const content = String(card.text || "").trim(); return title || content ? [{ id: String(card.id || `card-${index + 1}`).slice(0, 120), title, text: content }] : []; }); }
/** "Iraq at a glance" cards: an icon key plus a label, value and footnote. */
function essentialArray(value: FormDataEntryValue | null) {
  return parseArray(value).flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const card = item as Record<string, unknown>;
    const label = String(card.label || "").trim();
    const cardValue = String(card.value || "").trim();
    if (!label && !cardValue) return [];
    return [{
      id: String(card.id || `essential-${index + 1}`).slice(0, 120),
      icon: String(card.icon || "globe").trim().slice(0, 40),
      label, value: cardValue, note: String(card.note || "").trim(),
    }];
  });
}

/** Weather figures: a label and the figure shown beneath it. */
function statArray(value: FormDataEntryValue | null) {
  return parseArray(value).flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const stat = item as Record<string, unknown>;
    const label = String(stat.label || "").trim();
    const statValue = String(stat.value || "").trim();
    if (!label && !statValue) return [];
    return [{ id: String(stat.id || `stat-${index + 1}`).slice(0, 120), label, value: statValue }];
  });
}

function peopleArray(value: FormDataEntryValue | null): Arlar27PersonPlacement[] { return parseArray(value).flatMap((item) => { if (!item || typeof item !== "object") return []; const person = item as Record<string, unknown>; const id = String(person.id || "").trim(); const doctorId = String(person.doctorId || "").trim(); if (!id || !doctorId) return []; return [{ id: id.slice(0, 240), doctorId: doctorId.slice(0, 240), role: String(person.role || "").trim().slice(0, 240), group: String(person.group || "").trim().slice(0, 160), published: Boolean(person.published) }]; }); }
function parseArray(value: FormDataEntryValue | null): unknown[] { try { const parsed = JSON.parse(String(value || "[]")); return Array.isArray(parsed) ? parsed : []; } catch { throw new Error("One of the ArLAR27 collections could not be saved."); } }
function isHttpUrl(value: string) { try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; } }
