"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AdminImageField } from "@/components/admin/admin-image-field";
import { AdminSavingForm } from "@/components/admin/admin-saving-form";
import { SectionCard } from "@/components/admin/admin-ui";
import type { AdminMediaItem } from "@/lib/admin-media";

type TitleTextCard = { id: string; title: string; text: string };
type EssentialCard = { id: string; icon: string; label: string; value: string; note: string };
type WeatherStat = { id: string; label: string; value: string };

type AboutIraqContent = {
  pageTitle: string;
  pageDescription: string;
  destinationLabel: string;
  destination: string;
  heading: string;
  paragraphs: readonly string[];
  planningTitle: string;
  planningCards: readonly TitleTextCard[];
  essentials: { eyebrow: string; title: string; intro: string; cards: readonly EssentialCard[] };
  gallery: { eyebrow: string; title: string; intro: string };
  visa: {
    eyebrow: string; title: string; lead: string; ctaLabel: string; portalUrl: string;
    facts: readonly TitleTextCard[]; note: string;
  };
  weather: { eyebrow: string; title: string; intro: string; stats: readonly WeatherStat[] };
};

/** Icon keys the public guide can render for an "Iraq at a glance" card. */
const ICON_OPTIONS = [
  { value: "currency", label: "Banknote" },
  { value: "languages", label: "Languages" },
  { value: "clock", label: "Clock" },
  { value: "power", label: "Plug" },
  { value: "phone", label: "Phone" },
  { value: "plane", label: "Aeroplane" },
  { value: "globe", label: "Globe" },
  { value: "pin", label: "Map pin" },
] as const;

export function Arlar27AboutIraqEditor({ content, heroImage, media, action, formId }: { content: AboutIraqContent; heroImage: string; media: AdminMediaItem[]; action: (formData: FormData) => void | Promise<void>; formId: string }) {
  const [image, setImage] = useState(heroImage);
  const [cards, setCards] = useState(() => content.planningCards.map((card) => ({ ...card })));
  const [essentials, setEssentials] = useState(() => content.essentials.cards.map((card) => ({ ...card })));
  const [visaFacts, setVisaFacts] = useState(() => content.visa.facts.map((fact) => ({ ...fact })));
  const [weatherStats, setWeatherStats] = useState(() => content.weather.stats.map((stat) => ({ ...stat })));

  function addCard() {
    setCards((current) => [...current, { id: `planning-${Date.now()}`, title: "", text: "" }]);
  }

  return (
    <AdminSavingForm id={formId} action={action} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]" label="Saving About Iraq…">
      <div className="space-y-6">
        <SectionCard title="Page introduction" description="Manage the title and description beneath the ArLAR27 congress header.">
          <div className="grid gap-5 p-5 sm:p-7">
            <Field label="Page title"><input name="page_title" defaultValue={content.pageTitle} className="admin-input" /></Field>
            <Field label="Short introduction"><textarea name="page_description" defaultValue={content.pageDescription} rows={3} className="admin-textarea" /></Field>
          </div>
        </SectionCard>

        <SectionCard title="Destination story" description="Controls the main Baghdad introduction shown beside the congress destination image.">
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <Field label="Destination label"><input name="destination_label" defaultValue={content.destinationLabel} className="admin-input" /></Field>
            <Field label="Destination"><input name="destination" defaultValue={content.destination} className="admin-input" /></Field>
            <Field label="Main heading" className="sm:col-span-2"><textarea name="heading" defaultValue={content.heading} rows={3} className="admin-textarea" /></Field>
            <Field label="First paragraph" className="sm:col-span-2"><textarea name="paragraph_one" defaultValue={content.paragraphs[0]} rows={5} className="admin-textarea" /></Field>
            <Field label="Second paragraph" className="sm:col-span-2"><textarea name="paragraph_two" defaultValue={content.paragraphs[1]} rows={4} className="admin-textarea" /></Field>
          </div>
        </SectionCard>

        <SectionCard title="Planning information" description="Manage the practical travel cards shown beneath the destination story.">
          <div className="p-5 sm:p-7">
            <Field label="Section heading"><input name="planning_title" defaultValue={content.planningTitle} className="admin-input" /></Field>
            <input type="hidden" name="planning_cards" value={JSON.stringify(cards)} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {cards.map((card, index) => (
                <div key={card.id} className="rounded-xl border border-ink-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3"><span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">Card {String(index + 1).padStart(2, "0")}</span><button type="button" onClick={() => setCards((current) => current.filter((item) => item.id !== card.id))} className="grid size-8 place-items-center rounded-lg text-ink-300 transition hover:bg-crimson-50 hover:text-crimson-700" aria-label={`Remove planning card ${index + 1}`}><Trash2 size={14} /></button></div>
                  <input value={card.title} onChange={(event) => setCards((current) => current.map((item) => item.id === card.id ? { ...item, title: event.target.value } : item))} aria-label={`Planning card ${index + 1} title`} placeholder="Card title" className="admin-input mt-3" />
                  <textarea value={card.text} onChange={(event) => setCards((current) => current.map((item) => item.id === card.id ? { ...item, text: event.target.value } : item))} aria-label={`Planning card ${index + 1} text`} placeholder="Practical information" rows={5} className="admin-textarea mt-3" />
                </div>
              ))}
            </div>
            <button type="button" onClick={addCard} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 text-xs font-semibold text-ink-600 transition hover:border-crimson-300 hover:text-crimson-700"><Plus size={15} />Add planning card</button>
          </div>
        </SectionCard>

        <SectionCard title="Iraq at a glance" description="The quick-facts grid: currency, languages, time zone, electricity, dialling code and airport.">
          <div className="p-5 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Eyebrow"><input name="essentials_eyebrow" defaultValue={content.essentials.eyebrow} className="admin-input" /></Field>
              <Field label="Heading"><input name="essentials_title" defaultValue={content.essentials.title} className="admin-input" /></Field>
              <Field label="Introduction" className="sm:col-span-2"><textarea name="essentials_intro" defaultValue={content.essentials.intro} rows={2} className="admin-textarea" /></Field>
            </div>
            <input type="hidden" name="essentials_cards" value={JSON.stringify(essentials)} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {essentials.map((card, index) => (
                <div key={card.id} className="rounded-xl border border-ink-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">Fact {String(index + 1).padStart(2, "0")}</span>
                    <button type="button" onClick={() => setEssentials((current) => current.filter((item) => item.id !== card.id))} className="grid size-8 place-items-center rounded-lg text-ink-300 transition hover:bg-crimson-50 hover:text-crimson-700" aria-label={`Remove fact ${index + 1}`}><Trash2 size={14} /></button>
                  </div>
                  <select value={card.icon} onChange={(event) => setEssentials((current) => current.map((item) => item.id === card.id ? { ...item, icon: event.target.value } : item))} aria-label={`Fact ${index + 1} icon`} className="admin-input mt-3">
                    {ICON_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <input value={card.label} onChange={(event) => setEssentials((current) => current.map((item) => item.id === card.id ? { ...item, label: event.target.value } : item))} aria-label={`Fact ${index + 1} label`} placeholder="Label, e.g. Currency" className="admin-input mt-3" />
                  <input value={card.value} onChange={(event) => setEssentials((current) => current.map((item) => item.id === card.id ? { ...item, value: event.target.value } : item))} aria-label={`Fact ${index + 1} value`} placeholder="Value, e.g. Iraqi dinar (IQD)" className="admin-input mt-3" />
                  <textarea value={card.note} onChange={(event) => setEssentials((current) => current.map((item) => item.id === card.id ? { ...item, note: event.target.value } : item))} aria-label={`Fact ${index + 1} note`} placeholder="Short footnote" rows={2} className="admin-textarea mt-3" />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setEssentials((current) => [...current, { id: `essential-${Date.now()}`, icon: "globe", label: "", value: "", note: "" }])} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 text-xs font-semibold text-ink-600 transition hover:border-crimson-300 hover:text-crimson-700"><Plus size={15} />Add fact</button>
          </div>
        </SectionCard>

        <SectionCard title="Entry and visas" description="The visa panel. Keep this accurate — delegates book international travel on it.">
          <div className="p-5 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Eyebrow"><input name="visa_eyebrow" defaultValue={content.visa.eyebrow} className="admin-input" /></Field>
              <Field label="Heading"><input name="visa_title" defaultValue={content.visa.title} className="admin-input" /></Field>
              <Field label="Introduction" className="sm:col-span-2"><textarea name="visa_lead" defaultValue={content.visa.lead} rows={3} className="admin-textarea" /></Field>
              <Field label="Button label"><input name="visa_cta_label" defaultValue={content.visa.ctaLabel} className="admin-input" /></Field>
              <Field label="Visa portal URL"><input name="visa_portal_url" type="url" defaultValue={content.visa.portalUrl} placeholder="https://evisa.iq" className="admin-input" /></Field>
              <Field label="Verification note" className="sm:col-span-2"><textarea name="visa_note" defaultValue={content.visa.note} rows={3} className="admin-textarea" /><span className="mt-1.5 block text-[10px] text-ink-400">Shown as a highlighted caution beneath the four points.</span></Field>
            </div>
            <input type="hidden" name="visa_facts" value={JSON.stringify(visaFacts)} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {visaFacts.map((fact, index) => (
                <div key={fact.id} className="rounded-xl border border-ink-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">Point {String(index + 1).padStart(2, "0")}</span>
                    <button type="button" onClick={() => setVisaFacts((current) => current.filter((item) => item.id !== fact.id))} className="grid size-8 place-items-center rounded-lg text-ink-300 transition hover:bg-crimson-50 hover:text-crimson-700" aria-label={`Remove visa point ${index + 1}`}><Trash2 size={14} /></button>
                  </div>
                  <input value={fact.title} onChange={(event) => setVisaFacts((current) => current.map((item) => item.id === fact.id ? { ...item, title: event.target.value } : item))} aria-label={`Visa point ${index + 1} title`} placeholder="Point title" className="admin-input mt-3" />
                  <textarea value={fact.text} onChange={(event) => setVisaFacts((current) => current.map((item) => item.id === fact.id ? { ...item, text: event.target.value } : item))} aria-label={`Visa point ${index + 1} text`} placeholder="Detail" rows={4} className="admin-textarea mt-3" />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setVisaFacts((current) => [...current, { id: `visa-${Date.now()}`, title: "", text: "" }])} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 text-xs font-semibold text-ink-600 transition hover:border-crimson-300 hover:text-crimson-700"><Plus size={15} />Add visa point</button>
          </div>
        </SectionCard>

        <SectionCard title="Weather" description="The March-in-Baghdad panel and its four figures.">
          <div className="p-5 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Eyebrow"><input name="weather_eyebrow" defaultValue={content.weather.eyebrow} className="admin-input" /></Field>
              <Field label="Heading"><input name="weather_title" defaultValue={content.weather.title} className="admin-input" /></Field>
              <Field label="Introduction" className="sm:col-span-2"><textarea name="weather_intro" defaultValue={content.weather.intro} rows={3} className="admin-textarea" /></Field>
            </div>
            <input type="hidden" name="weather_stats" value={JSON.stringify(weatherStats)} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {weatherStats.map((stat, index) => (
                <div key={stat.id} className="rounded-xl border border-ink-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">Figure {String(index + 1).padStart(2, "0")}</span>
                    <button type="button" onClick={() => setWeatherStats((current) => current.filter((item) => item.id !== stat.id))} className="grid size-8 place-items-center rounded-lg text-ink-300 transition hover:bg-crimson-50 hover:text-crimson-700" aria-label={`Remove figure ${index + 1}`}><Trash2 size={14} /></button>
                  </div>
                  <input value={stat.label} onChange={(event) => setWeatherStats((current) => current.map((item) => item.id === stat.id ? { ...item, label: event.target.value } : item))} aria-label={`Figure ${index + 1} label`} placeholder="Label, e.g. Average high" className="admin-input mt-3" />
                  <input value={stat.value} onChange={(event) => setWeatherStats((current) => current.map((item) => item.id === stat.id ? { ...item, value: event.target.value } : item))} aria-label={`Figure ${index + 1} value`} placeholder="Value, e.g. 25°C" className="admin-input mt-3" />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setWeatherStats((current) => [...current, { id: `stat-${Date.now()}`, label: "", value: "" }])} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 text-xs font-semibold text-ink-600 transition hover:border-crimson-300 hover:text-crimson-700"><Plus size={15} />Add figure</button>
          </div>
        </SectionCard>

        <SectionCard title="Gallery" description="Headings for the scrolling photo strip. The photographs themselves live in the site's image data.">
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <Field label="Eyebrow"><input name="gallery_eyebrow" defaultValue={content.gallery.eyebrow} className="admin-input" /></Field>
            <Field label="Heading"><input name="gallery_title" defaultValue={content.gallery.title} className="admin-input" /></Field>
            <Field label="Introduction" className="sm:col-span-2"><textarea name="gallery_intro" defaultValue={content.gallery.intro} rows={2} className="admin-textarea" /></Field>
          </div>
        </SectionCard>
      </div>

      <aside className="xl:sticky xl:top-6">
        <SectionCard title="Destination image" headerAlign="center">
          <div className="p-5"><AdminImageField name="destination_image" value={image} items={media} aspect="portrait" fit="cover" filter={(item) => item.folder === "Congress media" || item.folder === "Website images"} onChange={setImage} /></div>
        </SectionCard>
      </aside>
      </AdminSavingForm>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={className}><span className="mb-2 block text-xs font-semibold text-ink-700">{label}</span>{children}</label>;
}
