import { Loader2 } from "lucide-react";

export function AdminPendingOverlay({ visible, label = "Updating…" }: { visible: boolean; label?: string }) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[300] grid cursor-wait place-items-center bg-white/35 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg">
        <Loader2 className="size-4 animate-spin text-crimson-600" />
        {label}
      </span>
    </div>
  );
}
