"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AdminImageField } from "@/components/admin/admin-image-field";
import { AdminMultiSelect } from "@/components/admin/admin-multi-select";
import { SectionCard, StatusPill } from "@/components/admin/admin-ui";
import type { AdminMediaItem } from "@/lib/admin-media";
import { AdminSavingForm } from "@/components/admin/admin-saving-form";

export type CollegeEventRecord = {
  id?: string;
  wixId?: string;
  title?: string;
  date?: string;
  year?: number;
  groups?: string[];
  speakers?: string | null;
  moderators?: string | null;
  webinarUrl?: string;
  replayUrl?: string;
  image?: string;
  originalImage?: string;
  mediaKey?: string;
  wixImage?: string;
  ownerId?: string;
  createdDate?: string;
  updatedDate?: string;
};

export function CollegeEventEditor({
  event,
  media,
  groupOptions,
  mode = "archive",
  action,
  formId = "college-event-form",
}: {
  event?: CollegeEventRecord;
  media: AdminMediaItem[];
  groupOptions: string[];
  mode?: "archive" | "scheduled";
  action: (formData: FormData) => void | Promise<void>;
  formId?: string;
}) {
  const [eventDate, setEventDate] = useState(event?.date?.slice(0, 10) || "");
  const [eventTime, setEventTime] = useState(event?.date?.slice(11, 16) || "");
  const date = eventDate ? new Date(`${eventDate}T12:00:00`) : null;
  const image = event?.image
    ? event.image.startsWith("/") || event.image.startsWith("http")
      ? event.image
      : `/images/arlar-college-events/${event.image}`
    : "";
  const isScheduled = mode === "scheduled";

  return (
    <AdminSavingForm id={formId} action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]" label="Saving event…">
      <div className="space-y-6">
        <SectionCard
          title={isScheduled ? "Scheduled webinar details" : "Webinar details"}
          description={isScheduled ? "Add the information attendees need before the event." : "Manage the complete replay record and its archive information."}
        >
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <label className="sm:col-span-2">
              <FieldLabel>Webinar title</FieldLabel>
              <textarea name="title" defaultValue={event?.title} rows={3} required className="admin-textarea text-base font-semibold" />
            </label>

            {isScheduled ? <>
              <div className="sm:col-span-2">
                <PersonListField name="speakers" label="Speakers" value={event?.speakers} placeholder="Dr. Jane Doe" />
              </div>
              <div className="sm:col-span-2">
                <PersonListField name="moderators" label="Moderators" value={event?.moderators} placeholder="Dr. John Doe" />
              </div>
            </> : null}

            <label>
              <FieldLabel>Event date</FieldLabel>
              <input name="event_date" type="date" value={eventDate} onChange={(input) => setEventDate(input.target.value)} required className="admin-input" />
            </label>
            <label>
              <FieldLabel>{isScheduled ? "Event time (GMT+3)" : "Event time"}</FieldLabel>
              <input name="event_time" type="time" value={eventTime} onChange={(input) => setEventTime(input.target.value)} required className="admin-input" />
            </label>

            {!isScheduled ? (
              <>
                <label>
                  <FieldLabel>Archive year</FieldLabel>
                  <input name="archive_year" type="number" defaultValue={event?.year || new Date().getFullYear()} className="admin-input" />
                </label>
                <label className="flex min-h-11 items-center justify-between self-end rounded-xl border border-ink-200 px-3.5">
                  <span className="text-xs font-semibold text-ink-700">Visible in College</span>
                  <input name="visible" type="checkbox" defaultChecked={Boolean(event)} className="accent-crimson-600" />
                </label>
              </>
            ) : null}

            <div className="sm:col-span-2">
              <FieldLabel>Organising groups</FieldLabel>
              <AdminMultiSelect name="organising_groups" options={groupOptions} initialValues={event?.groups || []} />
            </div>

            <label className="sm:col-span-2">
              <FieldLabel>{isScheduled ? "Registration link" : "Webinar / playlist URL"}</FieldLabel>
              <input
                name={isScheduled ? "registration_url" : "webinar_url"}
                type="url"
                defaultValue={event?.webinarUrl}
                required={isScheduled}
                placeholder={isScheduled ? "https://example.com/register" : "https://youtube.com/…"}
                className="admin-input"
              />
            </label>

            <label className="sm:col-span-2">
              <FieldLabel>Internal notes</FieldLabel>
              <textarea name="internal_notes" rows={5} placeholder="Optional administration notes…" className="admin-textarea" />
            </label>
          </div>
        </SectionCard>

        {event ? (
          <SectionCard
            title="Source record"
            description="Imported identifiers are preserved so the future database migration can match this event without ambiguity."
          >
            <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
              {[
                ["Source record ID", event.wixId],
                ["Media key", event.mediaKey],
                ["Original filename", event.originalImage],
                ["Owner ID", event.ownerId],
                ["Created", event.createdDate],
                ["Last updated", event.updatedDate],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-ink-100 bg-ink-50 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">{label}</p>
                  <p className="mt-1 break-all text-[11px] leading-5 text-ink-700">{value || "Not supplied"}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>

      <aside className="space-y-5">
        <div className="overflow-hidden rounded-2xl bg-[#071421] text-white">
          <div className="border-b border-white/10 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-jade-300">
              {isScheduled ? "Scheduled for" : "Event date"}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              {date ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Not scheduled"}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {eventTime ? `${formatTime(eventTime)}${isScheduled ? " (GMT+3)" : " UTC"}` : "Choose the event time"}
            </p>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-xs text-slate-400">{isScheduled ? "Listing type" : "Public visibility"}</span>
            <StatusPill tone={isScheduled ? "blue" : event ? "green" : "amber"}>
              {isScheduled ? "Upcoming" : event ? "Published" : "Draft"}
            </StatusPill>
          </div>
        </div>

        <SectionCard title="Webinar image" headerAlign="center">
          <div className="p-5">
            <AdminImageField name="image" value={image} items={media} aspect="portrait" />
          </div>
        </SectionCard>
      </aside>
    </AdminSavingForm>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-xs font-semibold text-ink-700">{children}</span>;
}

/**
 * One row per person, added and removed individually.
 *
 * Every row shares a field name, so the action reads them with
 * `formData.getAll(name)` and stores the result newline-separated — the same
 * shape the older single-textarea records already use, which keeps every
 * imported webinar readable without a migration.
 */
function PersonListField({
  name,
  label,
  value,
  placeholder,
}: {
  name: string;
  label: string;
  value?: string | null;
  placeholder: string;
}) {
  const [people, setPeople] = useState(() => {
    const existing = (value || "").split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
    return existing.length ? existing : [""];
  });

  const update = (index: number, next: string) =>
    setPeople((current) => current.map((entry, position) => (position === index ? next : entry)));

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="space-y-2">
        {people.map((person, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              name={name}
              value={person}
              onChange={(input) => update(index, input.target.value)}
              placeholder={placeholder}
              className="admin-input"
            />
            <button
              type="button"
              onClick={() => setPeople((current) => (current.length === 1 ? [""] : current.filter((_, position) => position !== index)))}
              aria-label={`Remove ${label.replace(/s$/, "")} ${index + 1}`}
              className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-ink-200 text-ink-400 transition-colors hover:border-crimson-300 hover:text-crimson-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setPeople((current) => [...current, ""])}
        className="mt-2.5 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 px-3 text-xs font-semibold text-ink-600 transition-colors hover:border-ink-400 hover:text-ink-900"
      >
        <Plus size={14} />
        Add {label.replace(/s$/, "").toLowerCase()}
      </button>
    </div>
  );
}

function formatTime(value: string) {
  const [rawHour, minute] = value.split(":");
  const hour = Number(rawHour);
  if (Number.isNaN(hour)) return value;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${period}`;
}
