"use client";

import { ExternalLink, FileText } from "lucide-react";
import { useState } from "react";

import { AdminImageField } from "@/components/admin/admin-image-field";
import { MediaLibraryDialog } from "@/components/admin/media-library-dialog";
import { AdminNativeSelect, SectionCard, StatusPill } from "@/components/admin/admin-ui";
import type { AdminMediaItem } from "@/lib/admin-media";
import type { ProfessionalResource } from "@/lib/professional-resources-repository";
import { AdminSavingForm } from "@/components/admin/admin-saving-form";

export function ProfessionalResourceEditor({ resource, media, action }: { resource: ProfessionalResource; media: AdminMediaItem[]; action: (formData: FormData) => void | Promise<void> }) {
  const [resourceUrl, setResourceUrl] = useState(resource.resourceUrl);
  const [mediaOpen, setMediaOpen] = useState(false);

  return <AdminSavingForm id="professional-resource-form" action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" label="Saving resource…">
    <div className="space-y-6">
      <SectionCard title="Resource details" description="The title, classification, and summary shown across the website.">
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
          <Field label="Resource title" className="sm:col-span-2"><textarea name="title" defaultValue={resource.title} rows={3} required className="admin-textarea text-base font-semibold" /></Field>
          <Field label="Resource type"><AdminNativeSelect name="kind" defaultValue={resource.kind}><option value="publication">Publication</option><option value="bulletin">E-Bulletin</option><option value="document">Document</option><option value="partner">Partner resource</option></AdminNativeSelect></Field>
          <Field label="Publishing status"><AdminNativeSelect name="status" defaultValue={resource.status}><option value="published">Published</option><option value="draft">Draft</option></AdminNativeSelect></Field>
          <Field label="Collection"><input name="collection" defaultValue={resource.collection} placeholder="ArLAR Publications" className="admin-input" /></Field>
          <Field label="Published date"><input name="date" type="date" defaultValue={resource.date} className="admin-input" /></Field>
          <Field label="Journal or publisher"><input name="journal" defaultValue={resource.journal} placeholder="Journal, publisher, or partner" className="admin-input" /></Field>
          <Field label="Language"><input name="language" defaultValue={resource.language} placeholder="English" className="admin-input" /></Field>
          <Field label="Issue number"><input name="issueNumber" defaultValue={resource.issueNumber} placeholder="Optional" className="admin-input" /></Field>
          <Field label="Action label"><input name="actionLabel" defaultValue={resource.actionLabel} placeholder="Open resource" className="admin-input" /></Field>
          <Field label="Public collection page" className="sm:col-span-2"><input name="publicHref" defaultValue={resource.publicHref} placeholder="/professionals/publications" className="admin-input" /></Field>
          <Field label="Description" className="sm:col-span-2"><textarea name="description" defaultValue={resource.description} rows={5} className="admin-textarea" /></Field>
        </div>
      </SectionCard>

      <SectionCard title="People & discovery" description="Use one author per line and separate search topics with commas.">
        <div className="grid gap-5 p-5 sm:p-7">
          <Field label="Authors or editors"><textarea name="authors" defaultValue={resource.authors.join("\n")} rows={6} placeholder="One name per line" className="admin-textarea" /></Field>
          <Field label="Topics"><textarea name="topics" defaultValue={resource.topics.join(", ")} rows={6} placeholder="Research, COVID-19, Clinical education" className="admin-textarea" /></Field>
        </div>
      </SectionCard>

      <SectionCard title="Resource file or destination" description="Choose a local document from Website Media or paste an approved external URL.">
        <div className="p-5 sm:p-7">
          <input type="hidden" name="resourceUrl" value={resourceUrl} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <input value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} placeholder="/documents/resource.pdf or https://…" className="admin-input flex-1" />
            <button type="button" onClick={() => setMediaOpen(true)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-xs font-semibold text-ink-700 transition hover:border-crimson-300 hover:text-crimson-700"><FileText size={15} />Website Media</button>
          </div>
          {resourceUrl ? <a href={resourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-crimson-700 hover:text-crimson-800"><ExternalLink size={14} />Open current resource</a> : <p className="mt-3 text-[11px] text-ink-400">No file or external destination attached.</p>}
        </div>
      </SectionCard>
    </div>

    <aside className="space-y-6">
      <SectionCard title="Cover image" headerAlign="center"><div className="p-5"><AdminImageField name="image" value={resource.image} items={media} aspect="portrait" /></div></SectionCard>
      <div className="overflow-hidden rounded-2xl bg-[#071421] text-white">
        <div className="p-5"><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-jade-300">Current record</p><h2 className="mt-3 text-lg font-semibold tracking-[-0.025em]">{resource.title || "New professional resource"}</h2><p className="mt-2 text-xs leading-5 text-slate-400">{resource.collection || "Choose a collection"}</p></div>
        <div className="flex items-center justify-between border-t border-white/10 p-4"><span className="text-xs text-slate-400">Visibility</span><StatusPill tone={resource.status === "published" ? "green" : "neutral"}>{resource.status === "published" ? "Published" : "Draft"}</StatusPill></div>
      </div>
    </aside>

    {mediaOpen ? <MediaLibraryDialog open items={media} value={resourceUrl} selectKind="document" title="Choose a resource document" onClose={() => setMediaOpen(false)} onSelect={setResourceUrl} /> : null}
  </AdminSavingForm>;
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-xs font-semibold text-ink-700">{label}</span>{children}</label>;
}
