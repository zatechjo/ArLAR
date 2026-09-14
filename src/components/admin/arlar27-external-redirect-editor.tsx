"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { SectionCard, StatusPill } from "@/components/admin/admin-ui";
import { AdminSavingForm } from "@/components/admin/admin-saving-form";

export function Arlar27ExternalRedirectEditor({ label, publicPath, initialUrl, initialEnabled, action, formId }: { label: string; publicPath: string; initialUrl: string; initialEnabled: boolean; action: (formData: FormData) => void | Promise<void>; formId: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [enabled, setEnabled] = useState(initialEnabled);
  const validUrl = isExternalUrl(url);

  return (
    <AdminSavingForm id={formId} action={action} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]" label="Saving redirect…">
      <SectionCard title={`${label} destination`} description="This public page does not need its own CMS content. Once enabled, links to this page across the ArLAR27 site open the official external portal in a new tab.">
        <div className="grid gap-5 p-5 sm:p-7">
          <input type="hidden" name="redirect_enabled" value={enabled ? "true" : "false"} />
          <label><span className="mb-2 block text-xs font-semibold text-ink-700">External portal URL</span><input name="redirect_url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://official-portal.example/path" className="admin-input" /><span className="mt-1.5 block text-[10px] leading-5 text-ink-400">Use the final secure URL supplied by the registration or abstract platform.</span></label>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink-100 bg-[#f7f9f8] p-4">
            <div><p className="text-sm font-semibold text-ink-900">Send visitors to the external portal</p><p className="mt-1 text-[11px] leading-5 text-ink-500">Links to the public ArLAR27 route open the portal in a new tab, so visitors keep the congress site open.</p></div>
            <button type="button" role="switch" aria-checked={enabled} onClick={() => setEnabled((current) => !current)} className={`relative h-7 w-12 rounded-full transition ${enabled ? "bg-jade-600" : "bg-ink-200"}`}><span className={`absolute left-0 top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} /></button>
          </div>
          {url && !validUrl ? <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">Enter a complete external URL beginning with http:// or https://.</p> : null}
        </div>
      </SectionCard>

      <aside className="space-y-4">
        <SectionCard title="Redirect status" headerAlign="center">
          <div className="p-5 text-center">
            <StatusPill tone={enabled && validUrl ? "green" : "amber"}>{enabled && validUrl ? "Active" : "Not active"}</StatusPill>
            <p className="mt-4 break-all text-sm font-semibold text-ink-900">{publicPath}</p>
            <p className="mt-2 text-[11px] leading-5 text-ink-500">{enabled && validUrl ? `Visitors are sent to ${url}` : "Visitors continue to see the current coming-soon page until a valid destination is enabled."}</p>
            {validUrl ? <a href={url} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 px-4 text-xs font-semibold text-ink-700 transition hover:border-crimson-200 hover:text-crimson-700">Test destination <ExternalLink size={14} /></a> : null}
          </div>
        </SectionCard>
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4"><p className="text-xs font-semibold text-sky-900">Safe launch flow</p><p className="mt-1 text-[11px] leading-5 text-sky-700">Save the URL first, test it, then enable it. This avoids sending visitors to an unfinished portal.</p></div>
      </aside>
    </AdminSavingForm>
  );
}

function isExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
