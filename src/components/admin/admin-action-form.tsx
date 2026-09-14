"use client";

import { Archive, Check, Loader2, Mail, MailOpen, UserMinus, UserRoundCheck } from "lucide-react";
import { useFormStatus } from "react-dom";

export type AdminActionIcon = "archive" | "check" | "mail" | "mail-open" | "user-minus" | "user-check";

const actionIcons = {
  archive: Archive,
  check: Check,
  mail: Mail,
  "mail-open": MailOpen,
  "user-minus": UserMinus,
  "user-check": UserRoundCheck,
} satisfies Record<AdminActionIcon, React.ComponentType<{ size?: number; className?: string }>>;

/**
 * A single-button form for small admin mutations (status toggles, archive,
 * resolve). The blur-and-overlay treatment of `AdminSavingForm` is meant for
 * full editor pages; on a 40px button it just hides the button, so here the
 * spinner takes the icon's place while a lightweight overlay prevents a
 * second status mutation from being submitted before the first completes.
 */
export function AdminActionForm({
  action,
  className,
  icon: Icon,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>;
  className: string;
  icon: AdminActionIcon;
  label: string;
}) {
  return (
    <form action={action}>
      <ActionButton className={className} icon={Icon} label={label} />
    </form>
  );
}

function ActionButton({
  className,
  icon,
  label,
}: {
  className: string;
  icon: AdminActionIcon;
  label: string;
}) {
  const { pending } = useFormStatus();
  const Icon = actionIcons[icon];

  return (
    <>
      <button type="submit" disabled={pending} aria-busy={pending} className={className}>
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
        {pending ? "Updating..." : label}
      </button>
      {pending ? (
        <div className="fixed inset-0 z-[250] grid cursor-wait place-items-center bg-white/35 backdrop-blur-[2px]" role="status" aria-live="polite" aria-label={`Updating inbox status: ${label}`}>
          <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg">
            <Loader2 className="size-4 animate-spin text-crimson-600" />
            Updating inbox...
          </span>
        </div>
      ) : null}
    </>
  );
}
