import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { ArrowRight, ChevronDown } from "@/components/icons";

const conciseAdminDescriptions: Record<string, string> = {
  "Hello, ArLAR.": "Content, people, and programmes at a glance.",
  "Special interest groups": "Manage ArLAR’s nine special interest groups.",
  "Publications & resources": "Manage publications and professional resources.",
  "Inbox & subscribers": "Review enquiries, public questions, and subscribers.",
  "Doctor directory": "Manage unified doctor profiles and placements.",
  "Past congresses": "Manage congress archives and replay libraries.",
  "Add a doctor": "Create a unified doctor profile.",
  "Access control": "Manage administrator access and permissions.",
  "ArLAR27 control room": "Manage the ArLAR27 congress website.",
  "ArLAR College": "Manage webinars, replays, and upcoming events.",
  "Member societies": "Manage member countries and national societies.",
  "Add professional resource": "Create a publication, bulletin, document, or partner resource.",
  "Add a webinar": "Create a new ArLAR College webinar.",
  "Schedule webinar": "Create an upcoming ArLAR College webinar.",
  "Edit session replay": "Manage session details, faculty, and video.",
  "Edit webinar": "Manage webinar details, image, and replay link.",
};

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  const subtitle = conciseAdminDescriptions[title]
    ?? (description.includes("doctor’s canonical identity") ? "Manage this doctor’s profile and website placements." : null)
    ?? (description.includes("complete replay catalogue") ? "Manage congress details, replays, galleries, and faculty." : null)
    ?? description;
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 bg-white px-5 py-6 sm:px-8">
      <div className="max-w-3xl">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function AdminContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 sm:p-8 lg:p-10 ${className}`}>{children}</div>;
}

export function AdminButton({
  children,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "type" | "onClick">) {
  const styles = {
    primary: "border-crimson-600 bg-crimson-600 text-white hover:border-crimson-700 hover:bg-crimson-700",
    secondary: "border-ink-200 bg-white text-ink-800 hover:border-ink-400 hover:bg-ink-50",
    quiet: "border-transparent bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-950",
  }[variant];
  return (
    <button {...props} type={type} onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function AdminLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  const styles = variant === "primary"
    ? "border-crimson-600 bg-crimson-600 text-white hover:border-crimson-700 hover:bg-crimson-700"
    : "border-ink-200 bg-white text-ink-800 hover:border-ink-400 hover:bg-ink-50";
  return <Link href={href} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${styles}`}>{children}</Link>;
}

export function StatusPill({ tone = "green", children }: { tone?: "green" | "amber" | "red" | "blue" | "neutral"; children: ReactNode }) {
  const toneClass = {
    green: "border-jade-200 bg-jade-50 text-jade-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-crimson-200 bg-crimson-50 text-crimson-700",
    blue: "border-sky-200 bg-sky-50 text-sky-700",
    neutral: "border-ink-200 bg-ink-50 text-ink-600",
  }[tone];
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{children}</span>;
}

export function MetricCard({ label, value, note, icon, tone = "dark" }: { label: string; value: string | number; note: string; icon: ReactNode; tone?: "dark" | "light" | "red" | "green" }) {
  const dark = tone === "dark";
  const toneClasses = {
    dark: "border-[#142535] bg-[#091723] text-white",
    light: "border-[#e1e5e9] bg-white text-ink-950",
    red: "border-crimson-100 bg-crimson-50 text-ink-950",
    green: "border-jade-100 bg-jade-50 text-ink-950",
  }[tone];
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ${toneClasses}`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${dark ? "bg-white/8 text-jade-300" : "bg-white text-crimson-600 ring-1 ring-black/5"}`}>{icon}</div>
      <p className={`mt-5 text-[10px] font-bold uppercase tracking-[0.17em] ${dark ? "text-slate-400" : "text-ink-500"}`}>{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{value}</p>
      <p className={`mt-2 text-xs ${dark ? "text-slate-400" : "text-ink-500"}`}>{note}</p>
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full border ${dark ? "border-white/6" : "border-black/5"}`} />
    </div>
  );
}

export function SectionCard({ title, description, action, children, className = "", headerAlign = "left" }: { title: string; description?: string; action?: ReactNode; children: ReactNode; className?: string; headerAlign?: "left" | "center" }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white ${className}`}>
      <div className={`flex flex-wrap items-start gap-3 border-b border-[#edf0f2] px-5 py-4 sm:px-6 ${headerAlign === "center" ? "justify-center text-center" : "justify-between"}`}>
        <div><h2 className="text-base font-semibold tracking-[-0.02em] text-ink-950">{title}</h2>{description ? <p className="mt-1 text-xs leading-5 text-ink-500">{description}</p> : null}</div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-2 text-xs font-semibold text-crimson-600 transition hover:text-crimson-800">{children}<ArrowRight className="h-3.5 w-3.5" /></Link>;
}

export function AdminSearchField({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#dfe3e7] bg-white px-3.5 text-sm text-ink-700 focus-within:border-crimson-300 focus-within:ring-2 focus-within:ring-crimson-100">
      <span className="text-lg text-ink-400">⌕</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-400" />
    </label>
  );
}

export function AdminSelect({ value, onChange, children, label }: { value: string; onChange: (value: string) => void; children: ReactNode; label: string }) {
  return <label className="block min-w-40"><span className="sr-only">{label}</span><AdminNativeSelect aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>{children}</AdminNativeSelect></label>;
}

export function AdminNativeSelect({ className = "", compact = false, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { compact?: boolean }) {
  return (
    <span className="relative block">
      <select
        {...props}
        className={`${compact ? "h-9 rounded-lg pl-3 pr-8 text-[12px]" : "h-11 rounded-xl pl-3.5 pr-9 text-[13px]"} w-full cursor-pointer appearance-none border border-ink-200 bg-white font-display font-medium text-ink-900 outline-none transition-colors hover:border-ink-300 focus:border-jade-500 ${className}`}
      >
        {children}
      </select>
      <ChevronDown className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400 ${compact ? "right-2.5 size-3.5" : "right-3.5 size-4"}`} />
    </span>
  );
}
