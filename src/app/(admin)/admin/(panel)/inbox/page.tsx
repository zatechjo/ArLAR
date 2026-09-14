import { MessageSquare, UserRoundCheck } from "lucide-react";

import { AdminContent, AdminPageHeader, MetricCard } from "@/components/admin/admin-ui";
import { InboxManager } from "@/components/admin/inbox-manager";
import { Mail } from "@/components/icons";
import { listInboxRecordsAsync } from "@/lib/inbox-repository";

export default async function InboxPage() {
  const records = await listInboxRecordsAsync();
  const unread = records.filter((record) => record.status === "unread").length;
  const questions = records.filter((record) => record.kind === "question").length;
  const subscribers = records.filter((record) => record.kind === "subscriber" && record.status === "active").length;
  return <><AdminPageHeader title="Inbox & subscribers" description="Review enquiries, public questions, and subscribers." /><AdminContent><div className="grid gap-4 sm:grid-cols-3"><MetricCard label="Unread submissions" value={unread} note="Contact enquiries and public questions" icon={<Mail className="size-5" />} tone="dark" /><MetricCard label="Public questions" value={questions} note="Submitted through the AAAA patient page" icon={<MessageSquare className="size-5" />} tone="light" /><MetricCard label="Active subscribers" value={subscribers} note="People receiving ArLAR updates" icon={<UserRoundCheck className="size-5" />} tone="green" /></div><div className="mt-6"><InboxManager records={records} /></div></AdminContent></>;
}
