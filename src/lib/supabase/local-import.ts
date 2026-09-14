import "server-only";

import { createHash } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listAdminAuditLog } from "@/lib/admin-audit-repository";
import { listManagedDoctors } from "@/lib/admin-doctor-repository";
import { getAllCongresses } from "@/lib/admin-congress-data";
import { getAdminMediaLibrary } from "@/lib/admin-media";
import { listAdminNewsArticles, listTrashedNewsArticles } from "@/lib/admin-news-repository";
import { listInboxRecords } from "@/lib/inbox-repository";
import { getManagedMemberCountries } from "@/lib/member-societies-repository";
import { getAllProfessionalResourceSources } from "@/lib/professional-resources-repository";
import { getManagedSigDirectory } from "@/lib/sig-directory-repository";
import { getArlar27Statuses, getManagedArlar27About, getManagedArlar27External, getManagedArlar27People, getManagedArlar27Welcome } from "@/lib/arlar27-admin-repository";
import { getDeletedAdminRecordIds, type AdminDeletionScope } from "@/lib/admin-deletion-repository";
import { sigProfiles } from "@/data/sig-profiles";
import { patientFaqCategories, patientFaqs, patientInformationSources } from "@/data/patient-faqs";
import { specialInterestGroups } from "@/data/special-interest-groups";
import { arlar27, arlar27Days, arlar27GatewayCards, arlar27Navigation } from "@/data/arlar27";
import { arlarContactLinks, arlarSocialLinks } from "@/lib/contact-links";
import boardMembers from "@/data/board-members.json";
import scientificCommittee from "@/data/scientific-committee.json";
import mediaGroup from "@/data/media-group.json";
import collegeMembers from "@/data/college-members.json";
import nationalSocieties from "@/data/national-societies.json";
import aaaaGroup from "@/data/aaaa-group.json";
import aaaaVideoLibrary from "@/data/aaaa-video-library.json";

export type LocalImportSummary = {
  ok: boolean;
  counts: Record<string, number>;
  error?: string;
};

const deletionScopes: AdminDeletionScope[] = [
  "doctors", "college-events", "congresses", "congress-replays", "sigs",
  "professional-resources", "member-countries", "member-societies",
  "arlar27-committee", "arlar27-faculty",
];

export async function importLocalAdminData(): Promise<LocalImportSummary> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Your Supabase session has expired. Sign in again and retry.");

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id, role, status")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (profileError || !profile || profile.role !== "owner" || profile.status !== "active") {
    throw new Error("Only the active ArLAR owner can run the local data import.");
  }

  const counts: Record<string, number> = {};
  const setCount = (name: string, count: number) => { counts[name] = count; };

  const media = getAdminMediaLibrary();
  const mediaRows = media.map((item) => ({
    id: stableUuid(`media:${item.src}`),
    storage_provider: "external",
    storage_key: `local:${item.src}`,
    public_url: item.src,
    original_name: item.filename,
    mime_type: mimeType(item.extension, item.kind),
    size_bytes: item.size,
    folder: item.folder,
    alt_text: item.name,
    caption: "",
    credit: "",
    source_url: item.src,
    created_by: profile.id,
  }));
  await upsert(supabase, "media_assets", mediaRows, "storage_key");
  setCount("media_assets", mediaRows.length);
  const mediaByUrl = new Map(mediaRows.map((row) => [row.public_url, row.id]));

  const doctors = listManagedDoctors();
  await upsert(supabase, "admin_doctors", doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.fullName || doctor.name,
    status: "active",
    data: doctor,
    created_by: profile.id,
  })));
  setCount("admin_doctors", doctors.length);

  const statuses = getArlar27Statuses();
  const arlar27Sections: { section: string; status: "ready" | "waiting"; data: unknown; updated_by: string }[] = Object.entries(statuses).map(([section, status]) => ({ section, status, data: { section, status }, updated_by: profile.id }));
  arlar27Sections.push(
    { section: "welcome-content", status: "ready", data: getManagedArlar27Welcome(), updated_by: profile.id },
    { section: "about-iraq-content", status: "ready", data: getManagedArlar27About(""), updated_by: profile.id },
    { section: "abstracts-external", status: statuses.abstracts || "waiting", data: getManagedArlar27External("abstracts"), updated_by: profile.id },
    { section: "registration-external", status: statuses.registration || "waiting", data: getManagedArlar27External("registration"), updated_by: profile.id },
  );
  await upsert(supabase, "admin_arlar27_sections", arlar27Sections, "section");
  setCount("admin_arlar27_sections", arlar27Sections.length);

  const peopleRows = (["committee", "faculty"] as const).flatMap((section) =>
    getManagedArlar27People(section).map((person, index) => ({
      id: person.id,
      section,
      doctor_id: person.doctorId,
      sort_order: index,
      data: person,
      created_by: profile.id,
    })),
  );
  await upsert(supabase, "admin_arlar27_people", peopleRows);
  setCount("admin_arlar27_people", peopleRows.length);

  const college = (await import("@/lib/admin-college-repository")).listManagedCollegeEvents();
  await upsert(supabase, "admin_college_events", college.map((event) => ({
    id: event.id || event.wixId || stableUuid(`college:${event.title || "event"}`),
    title: event.title || "",
    status: event.status === "draft" ? "draft" : "published",
    event_date: event.date || null,
    data: event,
    created_by: profile.id,
  })));
  const upcomingCollegeEvent = (await import("@/lib/college-upcoming-event")).getStoredCollegeUpcomingEvent();
  if (upcomingCollegeEvent) {
    await upsert(supabase, "admin_college_events", [{ id: "scheduled-webinar", title: upcomingCollegeEvent.title, status: upcomingCollegeEvent.published ? "published" : "draft", event_date: upcomingCollegeEvent.startsAt || null, data: upcomingCollegeEvent, created_by: profile.id }]);
  }
  setCount("admin_college_events", college.length + (upcomingCollegeEvent ? 1 : 0));

  const sigs = getManagedSigDirectory();
  await upsert(supabase, "admin_sigs", sigs.map((sig) => ({
    slug: sig.slug,
    name: sig.name,
    abbreviation: sig.abbreviation,
    logo_url: sig.logo,
    visible: sig.visible,
    sort_order: sig.order,
    data: { directory: sig, profile: sigProfiles.find((profile) => profile.slug === sig.slug) || null },
    created_by: profile.id,
  })));
  setCount("admin_sigs", sigs.length);

  const countries = getManagedMemberCountries();
  await upsert(supabase, "admin_member_countries", countries.map((country) => ({
    slug: country.slug,
    country: country.country,
    country_code: country.countryCode,
    data: country,
    created_by: profile.id,
  })));
  const societies = countries.flatMap((country) => country.societies.map((society) => ({
    id: society.id,
    country_slug: country.slug,
    name: society.name,
    abbreviation: society.abbreviation,
    data: society,
    created_by: profile.id,
  })));
  await upsert(supabase, "admin_member_societies", societies);
  setCount("admin_member_countries", countries.length);
  setCount("admin_member_societies", societies.length);

  const congresses = getAllCongresses();
  await upsert(supabase, "admin_congresses", congresses.map((congress) => ({
    id: congress.id,
    title: congress.title,
    status: congress.status,
    date_range: congress.dateRange,
    data: { ...congress, videos: undefined, gallery: undefined },
    created_by: profile.id,
  })));
  const videos = congresses.flatMap((congress) => congress.videos.map((video, index) => ({
    id: `${congress.id}:${video.id}`,
    congress_id: congress.id,
    title: video.title,
    status: video.status,
    sort_order: index,
    data: video,
    created_by: profile.id,
  })));
  await upsert(supabase, "admin_congress_videos", videos);
  const gallery = congresses.flatMap((congress) => congress.gallery.map((item, index) => ({
    id: stableUuid(`gallery:${congress.id}:${item.day || 0}:${index}`),
    congress_id: congress.id,
    day: item.day || null,
    sort_order: index,
    media_asset_id: item.src ? mediaByUrl.get(item.src) || null : null,
    data: item,
    created_by: profile.id,
  })));
  const congressIds = congresses.map((congress) => congress.id);
  if (congressIds.length) {
    const { error: galleryDeleteError } = await supabase.from("admin_congress_gallery").delete().in("congress_id", congressIds);
    if (galleryDeleteError) throw new Error(`admin_congress_gallery: ${galleryDeleteError.message}`);
  }
  await upsert(supabase, "admin_congress_gallery", gallery);
  setCount("admin_congresses", congresses.length);
  setCount("admin_congress_videos", videos.length);
  setCount("admin_congress_gallery", gallery.length);

  const resources = getAllProfessionalResourceSources();
  await upsert(supabase, "admin_professional_resources", resources.map((resource) => ({
    id: resource.id,
    kind: resource.kind,
    title: resource.title,
    status: resource.status,
    data: resource,
    created_by: profile.id,
  })));
  setCount("admin_professional_resources", resources.length);

  const inbox = listInboxRecords();
  await upsert(supabase, "admin_inbox_records", inbox.map((record) => ({
    id: record.id,
    kind: record.kind,
    status: record.status,
    email: record.email,
    created_at: record.createdAt,
    data: record,
  })));
  setCount("admin_inbox_records", inbox.length);

  const trashedArticles = listTrashedNewsArticles();
  const trashedById = new Map(trashedArticles.map((article) => [article.id, article]));
  const articles = [...listAdminNewsArticles(), ...trashedArticles];
  const categoryIds = new Map<string, string>();
  const categoryLabels = new Map<string, string>();
  for (const article of articles) {
    article.categoryIds.forEach((id, index) => {
      categoryIds.set(id, id.match(/^[0-9a-f-]{36}$/i) ? id : stableUuid(`category:${id || article.categories[index] || index}`));
      categoryLabels.set(id, article.categories[index] || id);
    });
  }
  const usedCategorySlugs = new Set<string>();
  const categories = [...categoryIds.entries()].map(([sourceId, id]) => {
    const name = categoryLabels.get(sourceId) || sourceId;
    const baseSlug = slugify(name);
    let categorySlug = baseSlug;
    let suffix = 2;
    while (usedCategorySlugs.has(categorySlug)) categorySlug = `${baseSlug}-${suffix++}`;
    usedCategorySlugs.add(categorySlug);
    return { id, slug: categorySlug, name };
  });
  await upsert(supabase, "news_categories", categories);
  await upsert(supabase, "news_articles", articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    status: article.published ? "published" : "draft",
    lifecycle: trashedById.has(article.id) ? "trashed" : "active",
    deleted_at: trashedById.get(article.id)?.deletedAt || null,
    cover_media_id: mediaByUrl.get(article.image) || null,
    published_at: article.publishedAt ? `${article.publishedAt}T00:00:00Z` : null,
    created_by: profile.id,
  })));
  const translations = articles.flatMap((article) => {
    const additional = article.translations || { arabic: { title: "", body: "" }, french: { title: "", body: "" } };
    return [
      { article_id: article.id, locale: "en", title: article.title, excerpt: article.excerpt, body: { contentText: article.contentText, richContent: article.richContent, rawPost: article.rawPost } },
      { article_id: article.id, locale: "ar", title: additional.arabic.title || "", excerpt: "", body: { html: additional.arabic.body || "" } },
      { article_id: article.id, locale: "fr", title: additional.french.title || "", excerpt: "", body: { html: additional.french.body || "" } },
    ];
  });
  await upsert(supabase, "news_translations", translations, "article_id,locale");
  const articleCategories = articles.flatMap((article) => article.categoryIds.flatMap((sourceId) => {
    const categoryId = categoryIds.get(sourceId);
    return categoryId ? [{ article_id: article.id, category_id: categoryId }] : [];
  }));
  await upsert(supabase, "news_article_categories", articleCategories, "article_id,category_id");
  setCount("news_articles", articles.length);
  setCount("news_translations", translations.length);
  setCount("news_categories", categories.length);
  setCount("news_article_categories", articleCategories.length);

  const deletions = deletionScopes.flatMap((scope) => [...getDeletedAdminRecordIds(scope)].map((recordId) => ({ scope, record_id: recordId, permanently_deleted: false, deleted_by: profile.id })));
  await upsert(supabase, "admin_deletions", deletions, "scope,record_id");
  setCount("admin_deletions", deletions.length);

  const audit = listAdminAuditLog(2000);
  await upsert(supabase, "admin_audit_log", audit.map((entry) => ({
    id: stableUuid(`audit:${entry.id}`),
    actor_id: profile.id,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId || null,
    summary: entry.detail || entry.targetLabel || "",
    metadata: { module: entry.module, targetLabel: entry.targetLabel, actorEmail: entry.actorEmail },
    created_at: entry.createdAt,
  })), "id");
  setCount("admin_audit_log", audit.length);

  const siteContent = [
    { namespace: "people", content_key: "board", data: boardMembers },
    { namespace: "people", content_key: "scientific-committee", data: scientificCommittee },
    { namespace: "people", content_key: "media-group", data: mediaGroup },
    { namespace: "people", content_key: "college-members", data: collegeMembers },
    { namespace: "members", content_key: "national-societies", data: nationalSocieties },
    { namespace: "sigs", content_key: "directory", data: specialInterestGroups },
    ...sigProfiles.map((sig, index) => ({ namespace: "sigs", content_key: sig.slug, sort_order: index, data: sig })),
    { namespace: "sigs", content_key: "arab-adult-arthritis-awareness", data: aaaaGroup },
    { namespace: "education", content_key: "aaaa-video-library", data: aaaaVideoLibrary },
    { namespace: "patients", content_key: "faq-categories", data: patientFaqCategories },
    { namespace: "patients", content_key: "faqs", data: patientFaqs },
    { namespace: "patients", content_key: "information-sources", data: patientInformationSources },
    { namespace: "arlar27", content_key: "overview", data: arlar27 },
    { namespace: "arlar27", content_key: "navigation", data: arlar27Navigation },
    { namespace: "arlar27", content_key: "days", data: arlar27Days },
    { namespace: "arlar27", content_key: "gateway-cards", data: arlar27GatewayCards },
    { namespace: "global", content_key: "social-links", data: arlarSocialLinks },
    { namespace: "global", content_key: "contact-links", data: arlarContactLinks },
  ].map((row, index) => ({ locale: "en", status: "published", sort_order: "sort_order" in row ? row.sort_order : index, updated_by: profile.id, ...row }));
  await upsert(supabase, "site_content", siteContent, "namespace,content_key,locale");
  setCount("site_content", siteContent.length);

  return { ok: true, counts };
}

async function upsert(client: Awaited<ReturnType<typeof createSupabaseServerClient>>, table: string, rows: Record<string, unknown>[], onConflict?: string) {
  if (!rows.length) return;
  const { error } = await client.from(table).upsert(rows, onConflict ? { onConflict } : undefined);
  if (error) throw new Error(`${table}: ${error.message}`);
}

function stableUuid(value: string) {
  const hex = createHash("sha1").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "5";
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const raw = hex.join("");
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120) || "category";
}

function mimeType(extension: string, kind: string) {
  if (kind === "image") return extension === "svg" ? "image/svg+xml" : `image/${extension === "jpg" ? "jpeg" : extension}`;
  if (kind === "video") return `video/${extension}`;
  return extension === "pdf" ? "application/pdf" : "application/octet-stream";
}
