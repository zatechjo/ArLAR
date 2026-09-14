"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createProfessionalResourceIdAsync,
  getProfessionalResourceAsync,
  saveProfessionalResourceAsync,
  type ProfessionalResource,
  type ProfessionalResourceKind,
} from "@/lib/professional-resources-repository";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { recordAdminAuditLogAsync } from "@/lib/admin-audit-repository";
import { revalidateLocalizedPaths } from "@/lib/public-revalidation";

export async function saveProfessionalResourceAction(id: string, formData: FormData) {
  const actor = await requireAdminPermission("resources");
  const existing = await getProfessionalResourceAsync(id, "admin");
  if (!existing) throw new Error("Resource not found.");
  const record = resourceFromForm(existing, formData);
  await saveProfessionalResourceAsync(record);
  await recordAdminAuditLogAsync({ module: "resources", action: "Resource saved", entityType: "professional-resource", entityId: record.id, targetLabel: record.title, detail: `${record.status === "published" ? "Published" : "Draft"} resource updated.`, actorEmail: actor.email });
  revalidateResourceSurfaces(record);
  redirect(`/admin/professionals/${record.id}?saved=1`);
}

export async function createProfessionalResourceAction(formData: FormData) {
  const actor = await requireAdminPermission("resources");
  const title = required(formData, "title");
  const empty: ProfessionalResource = { id: await createProfessionalResourceIdAsync(title), kind: "document", title, description: "", collection: "", publicHref: "", date: "", journal: "", authors: [], topics: [], image: "", resourceUrl: "", actionLabel: "Open resource", language: "English", issueNumber: "", status: "draft" };
  const record = resourceFromForm(empty, formData);
  await saveProfessionalResourceAsync(record);
  await recordAdminAuditLogAsync({ module: "resources", action: "Resource created", entityType: "professional-resource", entityId: record.id, targetLabel: record.title, detail: `${record.status === "published" ? "Published" : "Draft"} resource created.`, actorEmail: actor.email });
  revalidateResourceSurfaces(record);
  redirect(`/admin/professionals/${record.id}?created=1`);
}

function resourceFromForm(existing: ProfessionalResource, formData: FormData): ProfessionalResource {
  return {
    ...existing,
    kind: resourceKind(formData.get("kind")),
    title: required(formData, "title"),
    description: String(formData.get("description") || ""),
    collection: String(formData.get("collection") || ""),
    publicHref: String(formData.get("publicHref") || ""),
    date: String(formData.get("date") || ""),
    journal: String(formData.get("journal") || ""),
    authors: lines(formData.get("authors")),
    topics: commaList(formData.get("topics")),
    image: String(formData.get("image") || ""),
    resourceUrl: String(formData.get("resourceUrl") || ""),
    actionLabel: String(formData.get("actionLabel") || ""),
    language: String(formData.get("language") || ""),
    issueNumber: String(formData.get("issueNumber") || ""),
    status: formData.get("status") === "draft" ? "draft" : "published",
  };
}

function resourceKind(value: FormDataEntryValue | null): ProfessionalResourceKind {
  const kind = String(value || "");
  return ["publication", "bulletin", "document", "partner"].includes(kind) ? kind as ProfessionalResourceKind : "document";
}

function required(formData: FormData, name: string) {
  const value = String(formData.get(name) || "").trim();
  if (!value) throw new Error(`The ${name} field is required.`);
  return value;
}

function lines(value: FormDataEntryValue | null) { return String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean); }
function commaList(value: FormDataEntryValue | null) { return String(value || "").split(",").map((item) => item.trim()).filter(Boolean); }

function revalidateResourceSurfaces(resource: ProfessionalResource) {
  revalidatePath("/admin/professionals");
  revalidatePath(`/admin/professionals/${resource.id}`);
  revalidateLocalizedPaths(["/professionals/publications", "/professionals/e-bulletin", "/professionals/partners", "/education"]);
}
