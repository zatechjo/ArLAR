"use client";

import { useState } from "react";

import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";

/**
 * A form that dims its own contents and shows a spinner while the server
 * action runs.
 *
 * The blur has to sit on an inner wrapper rather than the <form> itself: a CSS
 * filter applies to every descendant, so blurring the form would blur the
 * spinner too. The form stays the positioning context, the wrapper takes the
 * filter, and the overlay is a sibling of the wrapper.
 *
 * Usable from server components — `action` is a server action and `children`
 * is plain JSX, both of which cross the boundary fine.
 */
export function AdminSavingForm({
  id,
  action,
  label = "Saving…",
  className = "",
  children,
}: {
  id?: string;
  action: (formData: FormData) => void | Promise<void>;
  /** Shown beside the spinner, e.g. "Saving event…". */
  label?: string;
  /** Layout classes for the form's contents. */
  className?: string;
  children: React.ReactNode;
}) {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <form
      id={id}
      action={action}
      onSubmit={() => setIsSaving(true)}
      aria-busy={isSaving}
      className="relative"
    >
      <div
        className={`${className} transition duration-200 ${
          isSaving ? "pointer-events-none select-none blur-[2px] opacity-55" : ""
        }`}
      >
        {children}
      </div>
      <AdminPendingOverlay visible={isSaving} label={label} />
    </form>
  );
}
