"use client";

import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { AdminNativeSelect, SectionCard } from "@/components/admin/admin-ui";
import { AdminSavingForm } from "@/components/admin/admin-saving-form";

export type Arlar27DoctorOption = {
  id: string;
  fullName: string;
  image: string;
  imagePosition?: string;
  country: string;
  flagFilename: string;
};

type WelcomeContent = {
  pageTitle: string;
  pageDescription: string;
  greeting: string;
  paragraphs: readonly string[];
  closing: string;
  signoff: string;
  authorDoctorId: string;
  authorRoles: readonly string[];
  translations?: Partial<Record<"ar" | "fr", {
    pageTitle: string;
    pageDescription: string;
    greeting: string;
    paragraphs: readonly string[];
    closing: string;
    signoff: string;
    authorRoles: readonly string[];
  }>>;
};

export function Arlar27WelcomeEditor({ content, doctors, action, formId }: { content: WelcomeContent; doctors: Arlar27DoctorOption[]; action: (formData: FormData) => void | Promise<void>; formId: string }) {
  const [authorId, setAuthorId] = useState(content.authorDoctorId);
  const [roles, setRoles] = useState<string[]>(() => [...content.authorRoles]);
  const [newRole, setNewRole] = useState("");
  const [translationLang, setTranslationLang] = useState<"ar" | "fr">("ar");
  const author = doctors.find((doctor) => doctor.id === authorId) ?? doctors[0];

  function addRole() {
    const value = newRole.replace(/\s+/g, " ").trim();
    if (!value || roles.some((role) => role.toLowerCase() === value.toLowerCase())) return;
    setRoles((current) => [...current, value]);
    setNewRole("");
  }

  return (
    <AdminSavingForm id={formId} action={action} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]" label="Saving welcome message…">
      <div className="space-y-6">
        <SectionCard title="Page introduction" description="Controls the title and short introduction shown beneath the ArLAR27 congress header.">
          <div className="grid gap-5 p-5 sm:p-7">
            <Field label="Page title"><input name="page_title" defaultValue={content.pageTitle} className="admin-input" /></Field>
            <Field label="Short introduction"><textarea name="page_description" defaultValue={content.pageDescription} rows={3} className="admin-textarea" /></Field>
          </div>
        </SectionCard>

        <SectionCard title="Welcome message" description="Edit the complete message as it appears on the public congress page.">
          <div className="grid gap-5 p-5 sm:p-7">
            <Field label="Greeting"><input name="greeting" defaultValue={content.greeting} className="admin-input" /></Field>
            <Field label="Message body" hint="Separate paragraphs with a blank line."><textarea name="message_body" defaultValue={content.paragraphs.join("\n\n")} rows={14} className="admin-textarea" /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Closing line"><textarea name="closing" defaultValue={content.closing} rows={3} className="admin-textarea" /></Field>
              <Field label="Sign-off"><input name="signoff" defaultValue={content.signoff} className="admin-input" /></Field>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Translations"
          description="Write the complete Arabic and French versions shown on their respective public pages. Blank fields fall back to the existing site translation."
          action={
            <div className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5" role="tablist" aria-label="Welcome message translation">
              <button type="button" role="tab" aria-selected={translationLang === "ar"} onClick={() => setTranslationLang("ar")} className={`rounded-md px-3.5 py-1.5 text-[12px] font-semibold transition ${translationLang === "ar" ? "bg-[#071421] text-white" : "text-ink-500 hover:bg-ink-50"}`}>العربية</button>
              <button type="button" role="tab" aria-selected={translationLang === "fr"} onClick={() => setTranslationLang("fr")} className={`rounded-md px-3.5 py-1.5 text-[11px] font-semibold transition ${translationLang === "fr" ? "bg-[#071421] text-white" : "text-ink-500 hover:bg-ink-50"}`}>Français</button>
            </div>
          }
        >
          {(["ar", "fr"] as const).map((locale) => {
            const translation = content.translations?.[locale];
            const isArabic = locale === "ar";
            return (
              <div key={locale} lang={locale} dir={isArabic ? "rtl" : "ltr"} className={`gap-5 p-5 sm:p-7 ${translationLang === locale ? "grid" : "hidden"}`}>
                <Field label={isArabic ? "عنوان الصفحة" : "Titre de la page"}><input name={`page_title_${locale}`} defaultValue={translation?.pageTitle} className={`admin-input ${isArabic ? "text-right" : ""}`} /></Field>
                <Field label={isArabic ? "المقدمة القصيرة" : "Courte introduction"}><textarea name={`page_description_${locale}`} defaultValue={translation?.pageDescription} rows={3} className={`admin-textarea ${isArabic ? "text-right" : ""}`} /></Field>
                <Field label={isArabic ? "التحية" : "Salutation"}><input name={`greeting_${locale}`} defaultValue={translation?.greeting} className={`admin-input ${isArabic ? "text-right" : ""}`} /></Field>
                <Field label={isArabic ? "نص الرسالة" : "Corps du message"} hint={isArabic ? "افصل بين الفقرات بسطر فارغ." : "Séparez les paragraphes par une ligne vide."}><textarea name={`message_body_${locale}`} defaultValue={translation?.paragraphs.join("\n\n")} rows={14} className={`admin-textarea ${isArabic ? "text-right" : ""}`} /></Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={isArabic ? "السطر الختامي" : "Phrase de clôture"}><textarea name={`closing_${locale}`} defaultValue={translation?.closing} rows={3} className={`admin-textarea ${isArabic ? "text-right" : ""}`} /></Field>
                  <Field label={isArabic ? "التوقيع" : "Signature"}><input name={`signoff_${locale}`} defaultValue={translation?.signoff} className={`admin-input ${isArabic ? "text-right" : ""}`} /></Field>
                </div>
                <Field label={isArabic ? "المناصب الرسمية" : "Fonctions officielles"} hint={isArabic ? "منصب واحد في كل سطر." : "Une fonction par ligne."}><textarea name={`author_roles_${locale}`} defaultValue={translation?.authorRoles.join("\n")} rows={4} className={`admin-textarea ${isArabic ? "text-right" : ""}`} /></Field>
              </div>
            );
          })}
        </SectionCard>

        <SectionCard title="Author and official roles" description="The author is linked to the unified doctor directory, so their portrait and biography remain consistent everywhere.">
          <div className="grid gap-5 p-5 sm:p-7">
            <Field label="Message author">
              <AdminNativeSelect name="author_doctor_id" value={authorId} onChange={(event) => setAuthorId(event.target.value)}>
                {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName}</option>)}
              </AdminNativeSelect>
            </Field>

            <input type="hidden" name="author_roles" value={JSON.stringify(roles)} />
            <div>
              <span className="mb-2 block text-xs font-semibold text-ink-700">Roles shown beneath the signature</span>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div key={role} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3">
                    <span className="min-w-0 flex-1 text-sm font-medium text-ink-800">{role}</span>
                    <button type="button" onClick={() => setRoles((current) => current.filter((item) => item !== role))} className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-300 transition hover:bg-crimson-50 hover:text-crimson-700" aria-label={`Remove ${role}`}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input value={newRole} onChange={(event) => setNewRole(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addRole(); } }} placeholder="Add another official role" className="admin-input min-w-0 flex-1" />
                <button type="button" onClick={addRole} disabled={!newRole.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#071421] px-5 text-xs font-semibold text-white transition hover:bg-[#142535] disabled:opacity-40"><Plus size={15} />Add role</button>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6">
        <SectionCard title="Current author" headerAlign="center">
          <div className="p-5 text-center">
            {author ? (
              <>
                <div className="relative mx-auto size-36 overflow-hidden rounded-2xl bg-ink-50 ring-1 ring-ink-100">
                  <Image src={author.image} alt="" fill sizes="144px" className="object-cover" style={{ objectPosition: author.imagePosition || "center top" }} />
                </div>
                <p className="mt-4 text-base font-semibold text-ink-950">{author.fullName}</p>
                <p className="mt-1 text-xs text-ink-500">{author.country}</p>
                <Link href={`/admin/doctors/${author.id}`} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-ink-200 px-4 text-xs font-semibold text-ink-700 transition hover:border-crimson-200 hover:text-crimson-700">Edit doctor profile</Link>
              </>
            ) : <p className="text-xs text-ink-400">Select an author from the doctor directory.</p>}
          </div>
        </SectionCard>

        <div className="rounded-2xl border border-jade-100 bg-jade-50 p-4">
          <p className="text-xs font-semibold text-jade-800">Connected profile</p>
          <p className="mt-1 text-[11px] leading-5 text-jade-700">Changing the doctor’s portrait or biography in the directory updates this message automatically.</p>
        </div>
      </aside>
      </AdminSavingForm>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label><span className="mb-2 block text-xs font-semibold text-ink-700">{label}</span>{children}{hint ? <span className="mt-1.5 block text-[10px] leading-5 text-ink-400">{hint}</span> : null}</label>;
}
