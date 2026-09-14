"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminSavingForm } from "@/components/admin/admin-saving-form";

import { SectionCard } from "@/components/admin/admin-ui";
import { AdminImageField } from "@/components/admin/admin-image-field";
import type { AdminDoctor } from "@/components/admin/doctors-manager";
import type { DoctorAppearance } from "@/data/doctor-types";
import { ExternalLink } from "@/components/icons";
import type { AdminMediaItem } from "@/lib/admin-media";
import { isCutoutPortrait } from "@/lib/portrait-fit";

export type ArabicSuggestion = { nameAr: string; countryAr?: string; biographyAr: string[] };
export type FrenchSuggestion = { nameFr: string; biographyFr: string[] };

export function DoctorEditor({ doctor, media, action, formId, arabicSuggestions = [], frenchSuggestions = [], placements = [] }: { doctor?: AdminDoctor; media: AdminMediaItem[]; action: (formData: FormData) => void | Promise<void>; formId: string; arabicSuggestions?: ArabicSuggestion[]; frenchSuggestions?: FrenchSuggestion[]; placements?: DoctorAppearance[] }) {
  const savedNameAr = doctor?.nameAr || "";
  const savedBiographyAr = (doctor?.biographyAr || []).join("\n");
  const [nameAr, setNameAr] = useState(savedNameAr);
  const [biographyAr, setBiographyAr] = useState(savedBiographyAr);
  // The picker fills these fields client-side. Without this the status pill
  // would read "Translated" before anything had actually been persisted.
  const arabicDirty = nameAr !== savedNameAr || biographyAr !== savedBiographyAr;
  const savedNameFr = doctor?.nameFr || "";
  const savedBiographyFr = (doctor?.biographyFr || []).join("\n");
  const [nameFr, setNameFr] = useState(savedNameFr);
  const [biographyFr, setBiographyFr] = useState(savedBiographyFr);
  const frenchDirty = nameFr !== savedNameFr || biographyFr !== savedBiographyFr;
  // A French profile counts as present when there is a biography: unlike
  // Arabic, the name is usually identical to the English one and left blank.
  const hasFrench = Boolean(biographyFr.trim() || nameFr.trim());
  const [translationLang, setTranslationLang] = useState<"ar" | "fr">("ar");
  const translationTabs = [
    // Arabic counts as translated on the name alone, matching how the doctors
    // list counts its Arabic coverage.
    { id: "ar" as const, label: "العربية", translated: Boolean(nameAr.trim()), dirty: arabicDirty },
    { id: "fr" as const, label: "Français", translated: hasFrench, dirty: frenchDirty },
  ];
  const activeTranslation =
    translationTabs.find((tab) => tab.id === translationLang) ?? translationTabs[0];
  const [portrait, setPortrait] = useState(doctor?.image || "");
  const [flag, setFlag] = useState(doctor?.flagFilename ? (/^https?:\/\//i.test(doctor.flagFilename) ? doctor.flagFilename : `/images/flags/${doctor.flagFilename}`) : "");
  const importedNameVariants = getDoctorNameVariants(doctor);
  const [nameVariants, setNameVariants] = useState(() => importedNameVariants);
  const [displayName, setDisplayName] = useState(doctor?.fullName || importedNameVariants[0] || "");
  const [newNameVariant, setNewNameVariant] = useState("");
  const [appearances, setAppearances] = useState<DoctorAppearance[]>(() => doctor?.appearances || []);

  /**
   * The catalogue is every placement slot on the site, so a doctor can be
   * added to a page they are not on yet. Any placement already on the record
   * but missing from the catalogue is folded in so it can still be removed.
   */
  const placementCatalogue = [
    ...new Map(
      [...placements, ...(doctor?.appearances || [])].map((item) => [item.id, item] as const),
    ).values(),
  ];
  // Only the unassigned slots go in the picker, grouped by page.
  const unassignedGroups = Object.entries(
    placementCatalogue
      .filter((item) => !appearances.some((a) => a.id === item.id))
      .reduce<Record<string, DoctorAppearance[]>>((groups, item) => {
        (groups[item.pageTitle] ||= []).push(item);
        return groups;
      }, {}),
  ).sort(([a], [b]) => a.localeCompare(b));
  const portraitIsCutout = isCutoutPortrait(portrait);

  function addNameVariant() {
    const value = cleanNameVariant(newNameVariant);
    if (!value) return;
    const existing = nameVariants.find((variant) => variant.toLowerCase() === value.toLowerCase());
    if (existing) {
      setDisplayName(existing);
    } else {
      setNameVariants((current) => [...current, value]);
      setDisplayName(value);
    }
    setNewNameVariant("");
  }

  function removeNameVariant(value: string) {
    const remaining = nameVariants.filter((variant) => variant !== value);
    setNameVariants(remaining);
    if (displayName === value) setDisplayName(remaining[0] || "");
  }

  return (
    <AdminSavingForm id={formId} action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]" label="Saving doctor…">
      <div className="space-y-6">
        <SectionCard title="Canonical identity" description="This is the single profile used across every ArLAR board, committee, SIG, College, and congress page.">
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <label><FieldLabel>Public name</FieldLabel><input name="name" defaultValue={doctor?.name} required placeholder="Doctor's full name" className="admin-input" /></label>
            <label><FieldLabel>Source credentials</FieldLabel><input name="credentials" defaultValue={doctor?.credentials} placeholder="MD, PhD, FRCP" className="admin-input" /></label>
            <label className="sm:col-span-2"><FieldLabel>Country</FieldLabel><input name="country" defaultValue={doctor?.country} required placeholder="Jordan" className="admin-input" /></label>
            <label className="sm:col-span-2">
              <FieldLabel>Full biography</FieldLabel>
              <textarea name="biography" defaultValue={doctor?.biography.join("\n\n")} rows={13} placeholder="Paste the doctor's actual biography. No content is invented." className="admin-textarea" />
              <span className="mt-1.5 block text-[10px] text-ink-400">Original paragraphs and line breaks remain intact in the public biography popup.</span>
            </label>
          </div>
        </SectionCard>

        <SectionCard
          title="Translations"
          description="Localised name and biography for each language site. The English profile above stays the canonical record."
          action={
            activeTranslation.dirty
              ? <span className="rounded-md bg-crimson-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-crimson-700">Unsaved — press Save</span>
              : activeTranslation.translated
                ? <span className="rounded-md bg-jade-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-jade-700">Translated</span>
                : <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">Not translated</span>
          }
        >
          <div className="p-5 sm:p-7">
            {/* Both panels stay mounted so the inactive language still submits
                with the form. Visibility is switched through the class rather
                than the `hidden` attribute, which a `grid` class would win over. */}
            <div className="mb-5 inline-flex rounded-lg border border-ink-200 bg-white p-0.5" role="tablist" aria-label="Translation language">
              {translationTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={translationLang === tab.id}
                  onClick={() => setTranslationLang(tab.id)}
                  className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 font-semibold transition ${tab.id === "ar" ? "text-[13px]" : "text-[11px]"} ${translationLang === tab.id ? "bg-[#071421] text-white" : "text-ink-500 hover:bg-ink-50 hover:text-ink-800"}`}
                >
                  <span
                    aria-hidden
                    className={`size-1.5 shrink-0 rounded-full ${tab.dirty ? "bg-crimson-500" : tab.translated ? "bg-jade-500" : "bg-amber-400"}`}
                  />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={`gap-5 ${translationLang === "ar" ? "grid" : "hidden"}`}>
              {arabicSuggestions.length > 0 ? (
                <label>
                  <FieldLabel>Import an unassigned Arabic profile</FieldLabel>
                  <select
                    value=""
                    onChange={(event) => {
                      const picked = arabicSuggestions.find((item) => item.nameAr === event.target.value);
                      if (!picked) return;
                      setNameAr(picked.nameAr);
                      setBiographyAr(picked.biographyAr.join("\n"));
                    }}
                    className="admin-input"
                  >
                    <option value="">Choose from {arabicSuggestions.length} Arabic profiles scraped from arab-rheumatology.org…</option>
                    {arabicSuggestions.map((item) => (
                      <option key={item.nameAr} value={item.nameAr}>
                        {item.nameAr}{item.countryAr ? ` — ${item.countryAr}` : ""}{item.biographyAr.length ? ` (${item.biographyAr.length} bio lines)` : " (no bio)"}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1.5 block text-[10px] text-ink-400">These Arabic profiles could not be matched to an English record automatically. Pick the one that belongs to this doctor, then save.</span>
                </label>
              ) : null}

              <label>
                <FieldLabel>Arabic name</FieldLabel>
                <input name="name_ar" dir="rtl" lang="ar" value={nameAr} onChange={(event) => setNameAr(event.target.value)} placeholder="د. نزار عبد اللطيف جاسم" className="admin-input text-right" />
              </label>

              <label>
                <FieldLabel>Arabic biography</FieldLabel>
                <textarea name="biography_ar" dir="rtl" lang="ar" rows={9} value={biographyAr} onChange={(event) => setBiographyAr(event.target.value)} placeholder="سطر واحد لكل بند" className="admin-textarea text-right" />
                <span className="mt-1.5 block text-[10px] text-ink-400">One line per credential, matching how the Arabic site lists them.</span>
              </label>
            </div>

            <div className={`gap-5 ${translationLang === "fr" ? "grid" : "hidden"}`}>
              {frenchSuggestions.length > 0 ? (
                <label>
                  <FieldLabel>Import an unassigned French profile</FieldLabel>
                  <select
                    value=""
                    onChange={(event) => {
                      const picked = frenchSuggestions.find((item) => item.nameFr === event.target.value);
                      if (!picked) return;
                      setNameFr(picked.nameFr);
                      setBiographyFr(picked.biographyFr.join("\n"));
                    }}
                    className="admin-input"
                  >
                    <option value="">Choose from {frenchSuggestions.length} French profiles scraped from arab--rheumatology.org…</option>
                    {frenchSuggestions.map((item) => (
                      <option key={item.nameFr} value={item.nameFr}>
                        {item.nameFr}{item.biographyFr.length ? ` (${item.biographyFr.length} bio lines)` : " (no bio)"}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1.5 block text-[10px] text-ink-400">These French profiles could not be matched to an English record automatically. Pick the one that belongs to this doctor, then save.</span>
                </label>
              ) : null}

              <label>
                <FieldLabel>French name</FieldLabel>
                <input name="name_fr" lang="fr" value={nameFr} onChange={(event) => setNameFr(event.target.value)} placeholder="Leave blank to use the English name" className="admin-input" />
              </label>

              <label>
                <FieldLabel>French biography</FieldLabel>
                <textarea name="biography_fr" lang="fr" rows={9} value={biographyFr} onChange={(event) => setBiographyFr(event.target.value)} placeholder="Une ligne par intitulé" className="admin-textarea" />
                <span className="mt-1.5 block text-[10px] text-ink-400">One line per credential, matching how the French site lists them.</span>
              </label>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Website placements"
          description="Where this person appears on the site. One edit here updates the shared identity everywhere."
          action={<span className="rounded-md bg-ink-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-600">{appearances.length} assigned</span>}
        >
          <div className="p-5 sm:p-7">
            <input type="hidden" name="appearances" value={JSON.stringify(appearances)} />

            {appearances.length === 0 ? (
              <p className="rounded-xl border border-dashed border-ink-200 px-4 py-6 text-center text-xs text-ink-400">
                No placements yet. Add the first one below.
              </p>
            ) : (
              <ul className="space-y-2">
                {appearances.map((placement) => (
                  <li key={placement.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-200 bg-[#fafbfb] p-3 sm:flex-nowrap">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-ink-800">{placement.section || placement.pageTitle}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-ink-400">{placement.pageTitle}</span>
                    </span>
                    <input
                      value={placement.role}
                      onChange={(event) =>
                        setAppearances((current) => current.map((item) => (item.id === placement.id ? { ...item, role: event.target.value } : item)))
                      }
                      placeholder="Role (optional)"
                      className="admin-input h-8 w-full text-[11px] sm:w-52"
                    />
                    <a href={placement.path} target="_blank" rel="noreferrer" className="shrink-0 text-ink-400 transition hover:text-crimson-600" aria-label={`Open ${placement.pageTitle}`}>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setAppearances((current) => current.filter((item) => item.id !== placement.id))}
                      aria-label={`Remove ${placement.section || placement.pageTitle}`}
                      className="grid size-8 shrink-0 place-items-center rounded-lg border border-ink-200 text-ink-400 transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {unassignedGroups.length > 0 ? (
              <label className="mt-4 block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">Add a placement</span>
                <select
                  value=""
                  onChange={(event) => {
                    const picked = placementCatalogue.find((item) => item.id === event.target.value);
                    if (picked) setAppearances((current) => [...current, { ...picked, role: "" }]);
                  }}
                  className="admin-input"
                >
                  <option value="">Choose a page or section…</option>
                  {unassignedGroups.map(([pageTitle, group]) => (
                    <optgroup key={pageTitle} label={pageTitle}>
                      {group.map((item) => (
                        <option key={item.id} value={item.id}>{item.section || pageTitle}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            ) : (
              <p className="mt-4 text-[11px] text-ink-400">This doctor is assigned to every available placement.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Name and credential formats" description="Choose the exact format shown on public biography cards, or add another version without losing imported source names.">
          <div className="p-5 sm:p-7">
            <input type="hidden" name="public_display_name" value={displayName} />
            <input type="hidden" name="name_variants" value={JSON.stringify(nameVariants)} />

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-2">
                {nameVariants.map((variant) => {
                  const selected = displayName === variant;
                  const imported = importedNameVariants.includes(variant);
                  return (
                    <div key={variant} className={`group flex items-center rounded-xl border transition ${selected ? "border-crimson-300 bg-crimson-50/60 ring-1 ring-crimson-100" : "border-ink-200 bg-white hover:border-ink-300"}`}>
                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3">
                        <input type="radio" name="display_name_choice" value={variant} checked={selected} onChange={() => setDisplayName(variant)} className="size-4 shrink-0 accent-crimson-600" />
                        <span className="min-w-0 flex-1 text-sm font-semibold text-ink-900">{variant}</span>
                        {selected ? <span className="shrink-0 rounded-full bg-crimson-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">Shown on cards</span> : imported ? <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-400">Imported</span> : null}
                      </label>
                      {!imported ? (
                        <button type="button" onClick={() => removeNameVariant(variant)} className="mr-2 grid size-8 shrink-0 place-items-center rounded-lg text-ink-300 transition hover:bg-white hover:text-crimson-700" aria-label={`Remove ${variant}`} title="Remove format"><Trash2 size={14} /></button>
                      ) : null}
                    </div>
                  );
                })}
                {nameVariants.length === 0 ? <div className="rounded-xl border border-dashed border-ink-200 px-4 py-6 text-center text-xs text-ink-400">Add the first public name format below.</div> : null}
              </div>

              <div className="rounded-xl border border-ink-100 bg-[#f7f9f8] p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">Biography card preview</p>
                <p className="mt-3 text-lg font-semibold leading-snug tracking-[-0.025em] text-ink-950">{displayName || "No format selected"}</p>
                <p className="mt-2 text-[10px] leading-5 text-ink-500">This exact version will be used wherever this doctor appears on a public biography card.</p>
              </div>
            </div>

            <div className="mt-5 border-t border-ink-100 pt-5">
              <FieldLabel>Add another format</FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={newNameVariant}
                  onChange={(event) => setNewNameVariant(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addNameVariant(); } }}
                  placeholder="e.g. Full name, MD, FRCPC, FACP"
                  className="admin-input min-w-0 flex-1"
                />
                <button type="button" onClick={addNameVariant} disabled={!newNameVariant.trim()} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#071421] px-5 text-xs font-semibold text-white transition hover:bg-[#142535] disabled:cursor-not-allowed disabled:opacity-40"><Plus size={15} />Add format</button>
              </div>
              <p className="mt-2 text-[10px] leading-5 text-ink-400">Imported formats stay preserved for matching and auditing. Custom formats can be removed.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <aside className="space-y-5">
        <SectionCard title="Portrait" headerAlign="center">
          <div className="p-4"><AdminImageField name="portrait" value={portrait} items={media} aspect="square" shape="circle" fit={portraitIsCutout ? "contain" : "cover"} enableCrop={!portraitIsCutout} initialObjectPosition={doctor?.imagePosition} onChange={setPortrait} /></div>
        </SectionCard>

        <SectionCard title="Country flag" headerAlign="center">
          <div className="p-4"><AdminImageField name="country_flag" value={flag} items={media} aspect="flag" fit="cover" filter={(item) => item.folder.toLowerCase().includes("flag") || item.folder === "New uploads"} onChange={setFlag} /></div>
        </SectionCard>
      </aside>
    </AdminSavingForm>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-xs font-semibold text-ink-700">{children}</span>;
}

function getDoctorNameVariants(doctor?: AdminDoctor) {
  if (!doctor) return [];
  const fullCredentialName = doctor.credentials ? `${doctor.name}, ${doctor.credentials}` : "";
  const seen = new Set<string>();
  return [doctor.fullName, fullCredentialName, ...doctor.sourceFullNames]
    .map(cleanNameVariant)
    .filter((value) => {
      const key = value.toLowerCase();
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function cleanNameVariant(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ").trim();
}
