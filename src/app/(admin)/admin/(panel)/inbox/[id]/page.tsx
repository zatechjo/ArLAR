import { Mail } from "lucide-react";
import { notFound } from "next/navigation";

import { updateInboxStatusAction } from "@/app/(admin)/admin/(panel)/inbox/actions";
import { AdminActionForm, type AdminActionIcon } from "@/components/admin/admin-action-form";
import { AdminContent, AdminPageHeader, SectionCard } from "@/components/admin/admin-ui";
import { RecordStatus } from "@/components/admin/inbox-manager";
import { getInboxRecordAsync, type InboxRecordStatus } from "@/lib/inbox-repository";

export default async function InboxRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getInboxRecordAsync(decodeURIComponent(id));
  if (!record) notFound();

  const heading = record.kind === "subscriber" ? record.email : record.subject;
  return (
    <>
      <AdminPageHeader
        title={heading}
        description={`${kindLabel(record.kind)} · received ${formatDate(record.createdAt)}`}
        actions={<>
          {record.email ? <a href={`mailto:${record.email}?subject=${encodeURIComponent(`Re: ${record.subject}`)}`} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-800 transition hover:border-ink-400 hover:bg-ink-50"><Mail size={15} />Reply by email</a> : null}
          <StatusActions id={record.id} kind={record.kind} status={record.status} />
        </>}
      />

      <AdminContent className="max-w-[1400px]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            {record.kind !== "subscriber" ? (
              <SectionCard title={record.kind === "question" ? "Submitted question" : "Enquiry message"} description={record.subject}>
                <div className="p-6 sm:p-8"><p className="whitespace-pre-wrap text-[14px] leading-7 text-ink-700">{record.message}</p></div>
              </SectionCard>
            ) : (
              <SectionCard title="Mailing-list subscription" description="The details captured when this person subscribed.">
                <div className="p-6 sm:p-8"><p className="text-sm leading-7 text-ink-700">{record.message}</p></div>
              </SectionCard>
            )}

            <SectionCard title={record.kind === "subscriber" ? "Subscriber details" : "Contact details"} description="Fields captured by the corresponding public website form.">
              <dl className="grid gap-px bg-ink-100 sm:grid-cols-2">
                <Detail label="Full name" value={record.name || "Not provided"} />
                <Detail label="Email address" value={record.email || "Not provided"} href={record.email ? `mailto:${record.email}` : undefined} />
                {record.kind === "contact" ? <>
                  <Detail label="Phone number" value={record.phone || "Not provided"} href={record.phone ? `tel:${record.phone}` : undefined} />
                  <Detail label="Country" value={record.country || "Not provided"} />
                  <Detail label="Role" value={record.role || "Not provided"} />
                  <Detail label="Organisation" value={record.organisation || "Not provided"} />
                  <Detail label="Enquiry type" value={record.enquiryType || "Not provided"} />
                  <Detail label="Subject" value={record.subject || "Not provided"} />
                </> : null}
              </dl>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <SectionCard title="Submission status">
              <div className="p-5"><RecordStatus status={record.status} /><p className="mt-4 text-xs leading-5 text-ink-500">Use the actions in the header to update this record.</p></div>
            </SectionCard>
            <SectionCard title="Record information">
              <dl className="divide-y divide-ink-100 px-5">
                <Meta label="Reference" value={record.id} />
                <Meta label="Received" value={formatDate(record.createdAt)} />
                <Meta label="Form source" value={record.source} />
                <Meta label="Record type" value={kindLabel(record.kind)} />
                <Meta label="Consent" value={record.consent ? "Recorded" : "Not recorded"} />
              </dl>
            </SectionCard>
          </aside>
        </div>
      </AdminContent>
    </>
  );
}

function StatusActions({ id, kind, status }: { id: string; kind: "contact" | "question" | "subscriber"; status: InboxRecordStatus }) {
  const actions: { status: InboxRecordStatus; label: string; icon: AdminActionIcon; primary?: boolean }[] = kind === "subscriber"
    ? status === "unsubscribed"
      ? [{ status: "active", label: "Reactivate", icon: "user-check", primary: true }, { status: "archived", label: "Archive", icon: "archive" }]
      : [{ status: "unsubscribed", label: "Unsubscribe", icon: "user-minus" }, { status: "archived", label: "Archive", icon: "archive" }]
    : [
      ...(status === "unread" ? [{ status: "read" as const, label: "Mark as read", icon: "mail-open" as const }] : [{ status: "unread" as const, label: "Mark unread", icon: "mail" as const }]),
      { status: "resolved", label: "Resolve", icon: "check", primary: true },
      { status: "archived", label: "Archive", icon: "archive" },
    ];
  return <>{actions.filter((action) => action.status !== status).map((action) => { const submit = updateInboxStatusAction.bind(null, id, action.status); return <AdminActionForm key={action.status} action={submit} icon={action.icon} label={action.label} className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${action.primary ? "border-crimson-600 bg-crimson-600 text-white hover:bg-crimson-700" : "border-ink-200 bg-white text-ink-700 hover:border-ink-400 hover:bg-ink-50"}`} />; })}</>;
}

function Detail({ label, value, href }: { label: string; value: string; href?: string }) { return <div className="bg-white p-5 sm:p-6"><dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">{label}</dt><dd className="mt-2 break-words text-sm font-semibold text-ink-800">{href ? <a href={href} className="text-crimson-700 hover:underline">{value}</a> : value}</dd></div>; }
function Meta({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-4 py-4"><dt className="text-[10px] font-semibold text-ink-400">{label}</dt><dd className="text-right text-[11px] font-semibold text-ink-700">{value}</dd></div>; }
function kindLabel(kind: "contact" | "question" | "subscriber") { return kind === "contact" ? "Contact enquiry" : kind === "question" ? "Public question" : "Mailing subscriber"; }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short" }).format(date); }
