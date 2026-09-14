"use client";

import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";

import { deleteAdminRecordAction } from "@/app/(admin)/admin/(panel)/actions";
import { AdminSearchField, AdminSelect, StatusPill } from "@/components/admin/admin-ui";
import { DeleteConfirmDialog, TrashIcon } from "@/components/admin/delete-confirm-dialog";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import type { DoctorAppearance } from "@/data/doctor-types";
import { DoctorAvatar } from "@/components/about/doctor-avatar";

/** A French profile counts as present once there is a biography — the name is
 * normally identical to the English one and left blank. */
function hasFrenchProfile(doctor: { nameFr?: string; biographyFr?: string[] }) {
  return Boolean(doctor.biographyFr?.length || doctor.nameFr);
}

export type AdminDoctor = {
  id: string;
  fullName: string;
  name: string;
  credentials: string;
  country: string;
  flagFilename: string;
  image: string;
  imagePosition?: string;
  biography: string[];
  nameAr?: string;
  biographyAr?: string[];
  nameFr?: string;
  biographyFr?: string[];
  sourceFullNames: string[];
  appearances: DoctorAppearance[];
};

const desktopColumns = "lg:grid-cols-[minmax(240px,1.2fr)_140px_minmax(190px,1fr)_110px_190px]";

export function DoctorsManager({ doctors }: { doctors: AdminDoctor[] }) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [membership, setMembership] = useState("all");
  const [profile, setProfile] = useState("all");
  const [lang, setLang] = useState<"en" | "ar" | "fr">("en");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<AdminDoctor | null>(null);
  const deferredQuery = useDeferredValue(query);

  const countries = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.country))].sort(),
    [doctors],
  );
  const memberships = useMemo(
    () => [...new Set(doctors.flatMap((doctor) => doctor.appearances.map((appearance) => appearance.pageTitle)))].sort(),
    [doctors],
  );
  const visible = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return doctors.filter((doctor) => {
      if (removedIds.includes(doctor.id)) return false;
      const searchable = `${doctor.fullName} ${doctor.nameAr || ""} ${doctor.nameFr || ""} ${doctor.country} ${doctor.sourceFullNames.join(" ")} ${doctor.appearances.map((item) => `${item.pageTitle} ${item.role}`).join(" ")}`.toLowerCase();
      const complete = doctor.biography.length > 0 && !doctor.image.includes("placeholder");
      return (!needle || searchable.includes(needle))
        && (country === "all" || doctor.country === country)
        && (membership === "all" || doctor.appearances.some((item) => item.pageTitle === membership))
        && (profile === "all" || (profile === "complete" ? complete : !complete));
    });
  }, [country, deferredQuery, doctors, membership, profile, removedIds]);

  const arabicCount = useMemo(
    () => doctors.filter((doctor) => Boolean(doctor.nameAr)).length,
    [doctors],
  );

  const frenchCount = useMemo(() => doctors.filter(hasFrenchProfile).length, [doctors]);

  const pageSize = 24;
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const pageItems = visible.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="rounded-2xl border border-[#e1e5e9] bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          <AdminSearchField value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search doctors, countries, roles, or groups…" />
          <div className="flex flex-wrap gap-2">
            <AdminSelect label="Country" value={country} onChange={(value) => { setCountry(value); setPage(1); }}>
              <option value="all">All countries</option>
              {countries.map((item) => <option key={item}>{item}</option>)}
            </AdminSelect>
            <AdminSelect label="Membership" value={membership} onChange={(value) => { setMembership(value); setPage(1); }}>
              <option value="all">All memberships</option>
              {memberships.map((item) => <option key={item}>{item}</option>)}
            </AdminSelect>
            <AdminSelect label="Profile completeness" value={profile} onChange={(value) => { setProfile(value); setPage(1); }}>
              <option value="all">All profiles</option>
              <option value="complete">Complete</option>
              <option value="incomplete">Needs attention</option>
            </AdminSelect>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f2] pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold text-ink-600">{visible.length} of {doctors.length} unified records</p>
            <span className="text-[11px] font-medium text-ink-400">·</span>
            <p className="text-[11px] font-medium text-ink-400"><span className="font-bold text-ink-600">{arabicCount}</span> with an Arabic profile</p>
            <span className="text-[11px] font-medium text-ink-400">·</span>
            <p className="text-[11px] font-medium text-ink-400"><span className="font-bold text-ink-600">{frenchCount}</span> with a French profile</p>
          </div>

          {/* Language toggle — switches the directory between English, Arabic and French */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-400">Show names in</span>
            <div className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5" role="group" aria-label="Name language">
              <button
                type="button"
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${lang === "en" ? "bg-[#071421] text-white" : "text-ink-500 hover:bg-ink-50 hover:text-ink-800"}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("ar")}
                aria-pressed={lang === "ar"}
                className={`rounded-md px-3 py-1.5 text-[13px] font-semibold transition ${lang === "ar" ? "bg-[#071421] text-white" : "text-ink-500 hover:bg-ink-50 hover:text-ink-800"}`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setLang("fr")}
                aria-pressed={lang === "fr"}
                className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${lang === "fr" ? "bg-[#071421] text-white" : "text-ink-500 hover:bg-ink-50 hover:text-ink-800"}`}
              >
                Français
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-4">
      <div className={`overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white transition duration-200 ${isDeleting ? "pointer-events-none select-none blur-[2px] opacity-55" : ""}`} aria-busy={isDeleting}>
        <div className={`hidden ${desktopColumns} gap-4 border-b border-[#e5e8eb] bg-[#fafbfb] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400 lg:grid`}>
          <span>Doctor</span>
          <span>Country</span>
          <span>Appears on</span>
          <span>Profile</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-[#edf0f2]">
          {pageItems.map((doctor) => {
            const complete = doctor.biography.length > 0 && !doctor.image.includes("placeholder");
            return (
              <div key={doctor.id} className={`group grid gap-4 px-4 py-4 transition hover:bg-[#fafbfb] sm:grid-cols-[minmax(260px,1fr)_auto] sm:items-center ${desktopColumns} lg:px-5`}>
                <Link href={`/admin/doctors/${doctor.id}`} className="flex min-w-0 items-center gap-3">
                  <DoctorAvatar imageSrc={doctor.image} name={doctor.fullName} imagePosition={doctor.imagePosition || "center top"} sizes="52px" className="size-13 shrink-0 rounded-xl" fallbackClassName="bg-[#071421] text-white" initialsClassName="font-display text-sm font-semibold tracking-[-0.04em]" />
                  <div className="min-w-0">
                    {lang === "ar" && doctor.nameAr ? (
                      <>
                        <p dir="rtl" lang="ar" className="truncate text-[15px] font-semibold text-ink-950 group-hover:text-crimson-700">{doctor.nameAr}</p>
                        <p className="mt-0.5 truncate text-[11px] text-ink-400">{doctor.fullName}</p>
                      </>
                    ) : lang === "ar" ? (
                      <>
                        <p className="truncate text-sm font-semibold text-ink-400 group-hover:text-crimson-700">{doctor.fullName}</p>
                        <p className="mt-0.5 truncate text-[11px] font-medium text-amber-600">No Arabic name yet</p>
                      </>
                    ) : lang === "fr" ? (
                      /* French names are usually spelled exactly as the English
                         ones, so the useful signal here is whether a French
                         biography exists, not whether a French name does. */
                      <>
                        <p className={`truncate text-sm font-semibold group-hover:text-crimson-700 ${hasFrenchProfile(doctor) ? "text-ink-950" : "text-ink-400"}`} lang="fr">
                          {doctor.nameFr || doctor.fullName}
                        </p>
                        {hasFrenchProfile(doctor) ? (
                          <p className="mt-0.5 truncate text-[11px] text-ink-400">{doctor.biographyFr?.length ?? 0} French bio lines</p>
                        ) : (
                          <p className="mt-0.5 truncate text-[11px] font-medium text-amber-600">No French profile yet</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="truncate text-sm font-semibold text-ink-950 group-hover:text-crimson-700">{doctor.fullName}</p>
                        {doctor.nameAr ? <p dir="rtl" lang="ar" className="mt-0.5 truncate text-[11px] text-ink-400">{doctor.nameAr}</p> : null}
                      </>
                    )}
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  {/* A doctor with no country match has no flag file; building
                      the path anyway produced "/images/flags/", which the image
                      optimiser rejects. */}
                  {doctor.flagFilename ? (
                    <Image src={/^https?:\/\//i.test(doctor.flagFilename) ? doctor.flagFilename : `/images/flags/${doctor.flagFilename}`} alt="" width={28} height={18} className="h-4 w-6 rounded-[3px] object-cover ring-1 ring-black/10" />
                  ) : (
                    <span aria-hidden className="h-4 w-6 rounded-[3px] bg-ink-100 ring-1 ring-black/10" />
                  )}
                  <span className="text-xs font-medium text-ink-600">{doctor.country}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {doctor.appearances.slice(0, 3).map((appearance) => <span key={appearance.id} className="max-w-[155px] truncate rounded-md bg-ink-50 px-2 py-1 text-[10px] font-semibold text-ink-600">{appearance.pageTitle}</span>)}
                  {doctor.appearances.length > 3 ? <span className="rounded-md bg-crimson-50 px-2 py-1 text-[10px] font-semibold text-crimson-700">+{doctor.appearances.length - 3}</span> : null}
                </div>

                <div>{complete ? <StatusPill tone="green">Complete</StatusPill> : <StatusPill tone="amber">Review</StatusPill>}</div>

                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/doctors/${doctor.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#071421] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#142535]"><Pencil size={13} />Edit</Link>
                  <button type="button" onClick={() => setDeleting(doctor)} aria-label={`Move ${doctor.fullName} to trash`} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700"><TrashIcon /></button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-[#edf0f2] bg-[#fafbfb] px-5 py-3">
          <p className="text-[11px] text-ink-400">Page {page} of {pageCount}</p>
          <div className="flex gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 disabled:opacity-35">Previous</button>
            <button type="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 disabled:opacity-35">Next</button>
          </div>
        </div>
      </div>
      <AdminPendingOverlay visible={isDeleting} label="Moving doctor to trash…" />
      </div>

      <DeleteConfirmDialog open={Boolean(deleting)} title={deleting?.fullName || "this doctor"} description="This removes the unified profile and every placement that uses it. You can restore it from Trash." confirmLabel={isDeleting ? "Moving…" : "Move to trash"} onClose={() => setDeleting(null)} onConfirm={() => { if (!deleting) return; const id = deleting.id; startDeleteTransition(async () => { await deleteAdminRecordAction("doctors", id); setRemovedIds((current) => [...current, id]); router.refresh(); }); }} />
    </>
  );
}
