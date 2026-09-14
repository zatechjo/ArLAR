"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

import { NewsImageUploader } from "@/components/admin/news-image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { AdminMediaItem } from "@/lib/admin-media";
import { AdminSavingForm } from "@/components/admin/admin-saving-form";

type LanguageContent = { title: string; body: string };
export type NewsEditorRecord = { id?: string; slug?: string; image?: string; date?: string; published?: boolean; hasUnpublishedChanges?: boolean; english?: LanguageContent; arabic?: LanguageContent; french?: LanguageContent };
type Lang = "en" | "ar" | "fr";
type CategoryOption = { id: string; name: string };

export function NewsComposer({ record, media, categories, action }: { record?: NewsEditorRecord & { categoryIds?: string[] }; media: AdminMediaItem[]; categories: CategoryOption[]; action: (formData: FormData) => void | Promise<void> }) {
  const [lang, setLang] = useState<Lang>("en");
  const [bodyEn, setBodyEn] = useState(record?.english?.body ?? "");
  const [bodyAr, setBodyAr] = useState(record?.arabic?.body ?? "");
  const [bodyFr, setBodyFr] = useState(record?.french?.body ?? "");
  const [titleEn, setTitleEn] = useState(record?.english?.title ?? "");
  const [titleAr, setTitleAr] = useState(record?.arabic?.title ?? "");
  const [titleFr, setTitleFr] = useState(record?.french?.title ?? "");
  const [coverUrl, setCoverUrl] = useState(record?.image ?? "");
  const [editorKey, setEditorKey] = useState(0);

  function copyEnglish(target: "ar" | "fr") {
    if (target === "ar") { setTitleAr(titleEn); setBodyAr(bodyEn); } else { setTitleFr(titleEn); setBodyFr(bodyEn); }
    setEditorKey((key) => key + 1); setLang(target);
  }
  const firstImage = (url: string) => setCoverUrl((current) => current || url);

  return <div className="mx-auto max-w-6xl">
    <AdminSavingForm id="news-composer-form" action={action} className="space-y-5" label="Saving article…">
      {record?.id ? <input type="hidden" name="id" value={record.id} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex min-h-10 rounded-lg border border-slate-200 bg-white p-1"><LanguageTab active={lang === "en"} onClick={() => setLang("en")}>English</LanguageTab><LanguageTab active={lang === "ar"} onClick={() => setLang("ar")}>Arabic</LanguageTab><LanguageTab active={lang === "fr"} onClick={() => setLang("fr")}>French</LanguageTab></div>
        <div className="flex flex-wrap gap-2"><CopyButton onClick={() => copyEnglish("ar")}>Copy English to Arabic</CopyButton><CopyButton onClick={() => copyEnglish("fr")}>Copy English to French</CopyButton></div>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0">
          <EditorLanguage media={media} active={lang === "en"} titleLabel="Post title" titleName="title_en" title={titleEn} onTitleChange={setTitleEn} bodyLabel="Article body" bodyName="body_en" body={bodyEn} editorKey={`en-${editorKey}`} dir="ltr" onBodyChange={setBodyEn} onImageUploaded={firstImage} />
          <EditorLanguage media={media} active={lang === "ar"} titleLabel="Arabic title" titleName="title_ar" title={titleAr} onTitleChange={setTitleAr} bodyLabel="Arabic article body" bodyName="body_ar" body={bodyAr} editorKey={`ar-${editorKey}`} dir="rtl" onBodyChange={setBodyAr} onImageUploaded={firstImage} />
          <EditorLanguage media={media} active={lang === "fr"} titleLabel="French title" titleName="title_fr" title={titleFr} onTitleChange={setTitleFr} bodyLabel="French article body" bodyName="body_fr" body={bodyFr} editorKey={`fr-${editorKey}`} dir="ltr" onBodyChange={setBodyFr} onImageUploaded={firstImage} />
        </div>
        <aside className="space-y-4 xl:sticky xl:top-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4"><h2 className="text-sm font-bold text-slate-900">Cover and social image</h2><p className="mb-4 mt-1 text-xs leading-5 text-slate-500">Used on news cards and social links. The first inline image becomes the cover automatically.</p><NewsImageUploader name="cover_image_url" value={coverUrl} media={media} onChange={setCoverUrl} label="" /></section>
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold text-slate-900">Categories</h2>
            <p className="mb-3 mt-1 text-xs leading-5 text-slate-500">Choose all categories related to this article.</p>
            <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {categories.map((category) => (
                <label key={category.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:border-crimson-200 hover:bg-crimson-50/40">
                  <input type="checkbox" name="category_ids" value={category.id} defaultChecked={record?.categoryIds?.includes(category.id)} className="h-4 w-4 shrink-0 rounded border-slate-300 accent-crimson-600" />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
            {!categories.length ? <p className="text-xs text-slate-400">No categories are available yet.</p> : null}
          </section>
          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"><div><h2 className="text-sm font-bold text-slate-900">Publish</h2>{record?.hasUnpublishedChanges ? <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">Unpublished changes</span> : null}</div><Field label="Published date" hint="Leave blank to use today when publishing."><input name="published_at" type="date" defaultValue={record?.date ?? ""} className={fieldInputClass} /></Field><PublishToggle name="published" label="Published" hint={record?.hasUnpublishedChanges ? "The current version remains live until you publish these changes." : "Visible on the public news page."} defaultChecked={record?.published ?? Boolean(record)} /></section>
        </aside>
      </div>
    </AdminSavingForm>
  </div>;
}

type EditorLanguageProps = { media: AdminMediaItem[]; active: boolean; titleLabel: string; titleName: string; title: string; onTitleChange: (value: string) => void; bodyLabel: string; bodyName: string; body: string; editorKey: string; dir: "ltr" | "rtl"; onBodyChange: (value: string) => void; onImageUploaded: (url: string) => void };
function EditorLanguage(props: EditorLanguageProps) { return <section className={props.active ? "space-y-4" : "hidden"}><div className="rounded-lg border border-slate-200 bg-white p-5"><Field label={props.titleLabel}><input name={props.titleName} value={props.title} onChange={(event) => props.onTitleChange(event.target.value)} required={props.titleName === "title_en"} dir={props.dir} placeholder={`Enter the ${props.titleLabel.toLowerCase()}`} className={fieldInputClass} /></Field></div><div className="rounded-lg border border-slate-200 bg-white p-5"><span className="mb-2 block text-sm font-semibold text-slate-700">{props.bodyLabel}</span><RichTextEditor key={props.editorKey} name={props.bodyName} media={props.media} defaultHtml={props.body} dir={props.dir} onChange={props.onBodyChange} onImageUploaded={props.onImageUploaded} /></div></section>; }
function LanguageTab({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`min-w-24 rounded-md px-4 py-1.5 text-sm font-semibold transition ${active ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"}`}>{children}</button>; }
function CopyButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) { return <button type="button" onClick={onClick} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-crimson-300 hover:text-crimson-700"><Copy size={15} />{children}</button>; }
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) { return <label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>{children}{hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}</label>; }
function PublishToggle({ name, label, hint, defaultChecked }: { name: string; label: string; hint: string; defaultChecked: boolean }) { return <label className="flex cursor-pointer items-start gap-3 border-t border-slate-100 pt-3"><input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-crimson-600" /><span><strong className="block text-sm font-semibold text-slate-800">{label}</strong><span className="block text-xs leading-5 text-slate-500">{hint}</span></span></label>; }
const fieldInputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100";
