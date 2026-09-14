import { CalendarDays, Clock3, Eye } from "lucide-react";

import { Arlar27AdminHeader } from "@/components/admin/arlar27-admin-header";
import { Arlar27StatusControl } from "@/components/admin/arlar27-status";
import { AdminContent, AdminLink, SectionCard, StatusPill } from "@/components/admin/admin-ui";
import { arlar27Days } from "@/data/arlar27";
import { getArlar27SectionStatusAsync } from "@/lib/arlar27-admin-repository";
import { getPublishedSiteContent } from "@/lib/site-content-repository";

export default async function AdminArlar27ProgrammePage() {
  const [status, days] = await Promise.all([getArlar27SectionStatusAsync("programme", "admin"), getPublishedSiteContent("arlar27", "days", arlar27Days)]);
  return (
    <>
      <Arlar27AdminHeader
        title="Scientific programme"
        description="The full programme builder will be designed as the next major module."
        actions={<><Arlar27StatusControl section="programme" initialStatus={status} /><AdminLink href="/congresses/arlar27/programme" variant="secondary"><Eye size={15} />Preview</AdminLink></>}
      />
      <AdminContent>
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <SectionCard title="Four-day programme" description="The congress dates are reserved. Sessions, rooms, tracks, faculty links, and downloadable schedules will be added in the programme builder.">
            <div className="divide-y divide-ink-100">
              {days.map((day) => (
                <div key={day.day} className="grid gap-3 px-5 py-5 sm:grid-cols-[84px_minmax(0,1fr)_auto] sm:items-center sm:px-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-crimson-600">{day.day}</span>
                  <div><p className="text-sm font-semibold text-ink-900">{day.date}</p><p className="mt-1 text-xs text-ink-400">{day.state}</p></div>
                  <StatusPill tone="amber">Waiting</StatusPill>
                </div>
              ))}
            </div>
          </SectionCard>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#d9e7e1] bg-jade-50 p-5"><CalendarDays className="size-6 text-jade-700" /><h2 className="mt-4 text-base font-semibold text-ink-950">Builder reserved</h2><p className="mt-2 text-xs leading-5 text-ink-600">This page is intentionally focused until the programme data model and editing workflow are agreed.</p></div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5"><Clock3 className="size-6 text-amber-700" /><p className="mt-3 text-xs leading-5 text-amber-900">Next: tracks, sessions, speakers, timings, rooms, filters, and programme exports.</p></div>
          </aside>
        </div>
      </AdminContent>
    </>
  );
}
