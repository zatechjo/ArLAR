"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { deleteAdminRecordAction } from "@/app/(admin)/admin/(panel)/actions";
import { AdminImageField } from "@/components/admin/admin-image-field";
import { AdminNativeSelect, SectionCard } from "@/components/admin/admin-ui";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import type { AdminMediaItem } from "@/lib/admin-media";
import type { ManagedMemberCountry, ManagedMemberSociety } from "@/lib/member-societies-repository";
import { AdminSavingForm } from "@/components/admin/admin-saving-form";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";

const socialPlatforms = ["Facebook", "Instagram", "X", "LinkedIn", "YouTube"];

export function MemberCountryEditor({ country, media, action }: { country: ManagedMemberCountry; media: AdminMediaItem[]; action: (formData: FormData) => void | Promise<void> }) {
  const [societies, setSocieties] = useState(country.societies);
  const [deleting, setDeleting] = useState<ManagedMemberSociety | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateSociety(id: string, patch: Partial<ManagedMemberSociety>) {
    setSocieties((current) => current.map((society) => society.id === id ? { ...society, ...patch } : society));
  }

  function addSociety() {
    setSocieties((current) => [...current, { id: `society-${crypto.randomUUID()}`, name: "", abbreviation: "", websiteUrl: null, websiteDisplay: "", socials: [] }]);
  }

  function removeSociety(society: ManagedMemberSociety) {
    setSocieties((current) => current.filter((candidate) => candidate.id !== society.id));
    if (!country.societies.some((candidate) => candidate.id === society.id)) return;
    startTransition(async () => { await deleteAdminRecordAction("member-societies", society.id); });
  }

  const flagSrc = country.flag && (/^https?:\/\//i.test(country.flag) ? country.flag : `/Arab Flags/${country.flag}`);
  const backgroundSrc = country.background && (/^https?:\/\//i.test(country.background) ? country.background : `/images/national-societies/backgrounds/${country.background}`);

  return (
    <AdminSavingForm id="member-country-form" action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" label="Saving country…">
      <AdminPendingOverlay visible={isPending} label="Moving society to trash…" />
      <input type="hidden" name="societies" value={JSON.stringify(societies)} />
      <div className="space-y-6">
        <SectionCard title="Country details" description="The identity shown in the public member directory.">
          <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_160px] sm:p-7">
            <Field label="Country name"><input name="country" defaultValue={country.country} required maxLength={100} className="admin-input" /></Field>
            <Field label="Country code"><input name="countryCode" defaultValue={country.countryCode} required minLength={2} maxLength={2} className="admin-input uppercase" /></Field>
            <Field label="Background photo credit" className="sm:col-span-2"><input name="backgroundCredit" defaultValue={country.backgroundCredit} maxLength={120} className="admin-input" /></Field>
          </div>
        </SectionCard>

        <SectionCard title="National societies" description="Manage every society, website, and social account associated with this country." action={<button type="button" onClick={addSociety} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#071421] px-3 text-xs font-semibold text-white transition hover:bg-[#142535]"><Plus size={14} />Add society</button>}>
          <div className="space-y-4 p-5 sm:p-7">
            {societies.map((society, index) => (
              <div key={society.id} className="rounded-2xl border border-ink-200 bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-400">Society {String(index + 1).padStart(2, "0")}</p>
                  <button type="button" onClick={() => setDeleting(society)} aria-label={`Remove ${society.name || "society"}`} className="grid size-8 place-items-center rounded-lg border border-ink-200 text-ink-400 transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700"><Trash2 size={14} /></button>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px]">
                  <Field label="Society name"><input value={society.name} onChange={(event) => updateSociety(society.id, { name: event.target.value })} required className="admin-input" /></Field>
                  <Field label="Abbreviation"><input value={society.abbreviation} onChange={(event) => updateSociety(society.id, { abbreviation: event.target.value })} className="admin-input" /></Field>
                  <Field label="Website URL"><input type="url" value={society.websiteUrl || ""} onChange={(event) => updateSociety(society.id, { websiteUrl: event.target.value || null })} placeholder="https://example.org" className="admin-input" /></Field>
                  <Field label="Website label"><input value={society.websiteDisplay} onChange={(event) => updateSociety(society.id, { websiteDisplay: event.target.value })} placeholder="example.org" className="admin-input" /></Field>
                </div>
                <div className="mt-5 border-t border-ink-100 pt-5">
                  <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-ink-800">Social links</p><button type="button" onClick={() => updateSociety(society.id, { socials: [...society.socials, { platform: "Facebook", url: "", verified: false }] })} className="text-xs font-semibold text-crimson-700 hover:text-crimson-800">+ Add link</button></div>
                  <div className="mt-3 space-y-3">
                    {society.socials.map((social, socialIndex) => (
                      <div key={`${society.id}-${socialIndex}`} className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)_100px_40px] sm:items-center">
                        <AdminNativeSelect value={social.platform} onChange={(event) => { const socials = [...society.socials]; socials[socialIndex] = { ...social, platform: event.target.value }; updateSociety(society.id, { socials }); }}>{socialPlatforms.map((platform) => <option key={platform}>{platform}</option>)}</AdminNativeSelect>
                        <input type="url" value={social.url} onChange={(event) => { const socials = [...society.socials]; socials[socialIndex] = { ...social, url: event.target.value }; updateSociety(society.id, { socials }); }} placeholder="https://…" className="admin-input" />
                        <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-3 text-[11px] font-semibold text-ink-600"><input type="checkbox" checked={social.verified} onChange={(event) => { const socials = [...society.socials]; socials[socialIndex] = { ...social, verified: event.target.checked }; updateSociety(society.id, { socials }); }} className="size-4 accent-[#00953b]" />Verified</label>
                        <button type="button" onClick={() => updateSociety(society.id, { socials: society.socials.filter((_, candidateIndex) => candidateIndex !== socialIndex) })} aria-label="Remove social link" className="grid size-10 place-items-center rounded-lg border border-ink-200 text-ink-400 hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-700"><Trash2 size={13} /></button>
                      </div>
                    ))}
                    {society.socials.length === 0 ? <p className="text-[11px] text-ink-400">No social accounts listed.</p> : null}
                  </div>
                </div>
              </div>
            ))}
            {societies.length === 0 ? <div className="rounded-xl border border-dashed border-ink-300 px-5 py-10 text-center text-sm text-ink-500">No active societies for this country.</div> : null}
          </div>
        </SectionCard>
      </div>

      <aside className="space-y-6">
        <SectionCard title="Country flag" headerAlign="center"><div className="p-5"><AdminImageField name="flag" value={flagSrc} items={media} aspect="flag" fit="cover" filter={(item) => item.src.startsWith("/Arab Flags/") || item.folder === "Country flags" || item.folder === "New uploads"} /></div></SectionCard>
        <SectionCard title="Country background" headerAlign="center"><div className="p-5"><AdminImageField name="background" value={backgroundSrc} items={media} aspect="video" fit="cover" filter={(item) => item.src.includes("/national-societies/backgrounds/") || item.folder === "New uploads"} /></div></SectionCard>
      </aside>

      <DeleteConfirmDialog open={Boolean(deleting)} title={deleting?.name || "this society"} confirmLabel={isPending ? "Removing…" : "Move to trash"} onClose={() => setDeleting(null)} onConfirm={() => { if (!deleting) return; removeSociety(deleting); setDeleting(null); }} />
    </AdminSavingForm>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-xs font-semibold text-ink-700">{label}</span>{children}</label>;
}
