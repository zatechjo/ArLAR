"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { BookOpen, CalendarDays, Close, ExternalLink, FileText, Globe, Mail, Menu, Microscope, Users, Video } from "@/components/icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { recordAdminSignOutAction } from "@/app/(admin)/admin/auth-actions";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import type { AdminPermission } from "@/lib/access-control-types";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

const sections = [
  { label: "Overview", links: [{ href: "/admin/dashboard", label: "Dashboard", icon: Globe }] },
  { label: "Editorial", links: [{ href: "/admin/news", label: "Newsroom", icon: FileText }, { href: "/admin/doctors", label: "Doctor directory", icon: Users }] },
  { label: "Programmes", links: [
    { href: "/admin/arlar27", label: "ArLAR27", icon: CalendarDays },
    { href: "/admin/college", label: "ArLAR College", icon: Video },
    { href: "/admin/sigs", label: "Special interest groups", icon: Microscope },
    { href: "/admin/members", label: "Member societies", icon: Globe },
    { href: "/admin/congresses", label: "Past congresses", icon: CalendarDays },
    { href: "/admin/professionals", label: "Professional resources", icon: BookOpen },
  ] },
  { label: "Community", links: [{ href: "/admin/inbox", label: "Inbox & subscribers", icon: Mail }] },
  { label: "Administration", links: [{ href: "/admin/access", label: "Access control", icon: Users }, { href: "/admin/activity", label: "Activity log", icon: FileText }, { href: "/admin/migration", label: "Database migration", icon: FileText }] },
] as const;

const recycleBinReturnRoutes: Record<string, string> = {
  doctors: "/admin/doctors",
  "college-events": "/admin/college",
  congresses: "/admin/congresses",
  "congress-replays": "/admin/congresses",
  sigs: "/admin/sigs",
  "professional-resources": "/admin/professionals",
  "member-countries": "/admin/members",
  "member-societies": "/admin/members",
  "arlar27-committee": "/admin/arlar27/committee",
  "arlar27-faculty": "/admin/arlar27/faculty",
};

const routePermissions: Partial<Record<string, AdminPermission>> = {
  "/admin/news": "news",
  "/admin/doctors": "doctors",
  "/admin/arlar27": "arlar27",
  "/admin/college": "college",
  "/admin/sigs": "sigs",
  "/admin/members": "members",
  "/admin/congresses": "congresses",
  "/admin/professionals": "resources",
  "/admin/inbox": "inbox",
  "/admin/access": "access",
};

export function AdminShell({ children, actor, isOwner = false }: { children: React.ReactNode; actor: { name: string; email: string; permissions: AdminPermission[] }; isOwner?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const closeMenuButtonRef = useRef<HTMLButtonElement>(null);
  const menuModalRef = useModalAccessibility<HTMLElement>({ open, onClose: () => setOpen(false), initialFocusRef: closeMenuButtonRef });
  const [signingOut, setSigningOut] = useState(false);
  const pathSegments = pathname.split("/").filter(Boolean);
  const showBackButton = pathSegments[0] === "admin" && pathSegments.length >= 3;
  const backHref = pathSegments[1] === "recycle-bin"
    ? recycleBinReturnRoutes[pathSegments[2]] || "/admin/dashboard"
    : pathSegments[1] === "congresses" && pathSegments.includes("replays")
      ? `/admin/congresses/${pathSegments[2]}`
      : `/admin/${pathSegments[1]}`;
  const ownerOnlyRoutes = new Set(["/admin/access", "/admin/activity", "/admin/migration"]);
  const visibleSections = sections.map((section) => ({
    ...section,
    links: section.links.filter((item) => {
      if (item.href === "/admin/dashboard") return isOwner;
      if (ownerOnlyRoutes.has(item.href)) return isOwner;
      const permission = routePermissions[item.href];
      return !permission || isOwner || actor.permissions.includes(permission);
    }),
  })).filter((section) => section.links.length > 0);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await recordAdminSignOutAction();
    } finally {
      await createSupabaseBrowserClient().auth.signOut();
      router.replace("/admin");
      router.refresh();
    }
  }

  const navigation = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-white/10"><Image src="/arlar-logo-tight.png" alt="ArLAR" width={68} height={46} className="h-auto w-full" /></div>
        <div><p className="text-[13px] font-semibold tracking-[-0.01em] text-white">ArLAR Control</p><p className="mt-0.5 text-[9px] uppercase tracking-[0.17em] text-slate-500">Executive workspace</p></div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {visibleSections.map((section) => (
          <div key={section.label} className="mb-3 last:mb-0">
            <p className="mb-1 px-2 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600">{section.label}</p>
            <div className="space-y-0.5">
              {section.links.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`group flex min-h-8 items-center gap-2.5 rounded-lg px-2 text-[12px] font-medium transition ${active ? "bg-white text-[#071421]" : "text-slate-400 hover:bg-white/6 hover:text-white"}`}><Icon className={`h-4 w-4 ${active ? "text-crimson-600" : "text-slate-500 group-hover:text-slate-300"}`} /><span>{item.label}</span>{active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-jade-500" /> : null}</Link>;
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/8 p-3">
        <a href="/" target="_blank" className="flex min-h-8 items-center gap-2.5 rounded-lg px-2 text-[12px] font-medium text-slate-400 transition hover:bg-white/6 hover:text-white"><ExternalLink className="h-3.5 w-3.5" />Open public website</a>
        <button type="button" onClick={handleSignOut} disabled={signingOut} className="mt-1 flex min-h-8 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 text-left text-[12px] font-medium text-slate-400 transition hover:bg-white/6 hover:text-white disabled:cursor-wait disabled:opacity-60">{signingOut ? "Signing out…" : "Sign out"}</button>
        <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-white/[0.045] p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-crimson text-[10px] font-bold text-white">{initials(actor.name)}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-white">{actor.name}</p><p className="truncate text-[9px] text-slate-500">{actor.email}</p></div>
          <span className="h-2 w-2 rounded-full bg-jade-400 ring-4 ring-jade-400/10" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f5f7] lg:flex">
      <AdminPendingOverlay visible={signingOut} label="Signing out…" />
      <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 bg-[#071421] lg:block">{navigation}</aside>
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e3e6ea] bg-white px-4 lg:hidden">
        <div className="flex items-center gap-3"><Image src="/arlar-logo-tight.png" alt="ArLAR" width={80} height={50} className="h-9 w-auto" /><span className="h-6 w-px bg-ink-200" /><span className="text-sm font-semibold text-ink-900">Admin</span></div>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 text-ink-800"><Menu className="h-5 w-5" /></button>
      </div>
      {open ? <div className="fixed inset-0 z-[100] lg:hidden"><button type="button" aria-label="Close admin menu" className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setOpen(false)} /><aside ref={menuModalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Admin navigation" className="absolute inset-y-0 left-0 w-[min(86vw,300px)] bg-[#071421] shadow-2xl"><button ref={closeMenuButtonRef} type="button" onClick={() => setOpen(false)} aria-label="Close admin menu" className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/8 text-white"><Close className="h-4 w-4" /></button>{navigation}</aside></div> : null}
      <main className="min-w-0 flex-1">{showBackButton ? <div className="border-b border-[#e3e6ea] bg-white px-5 py-3 sm:px-8"><Link href={backHref} className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-ink-600 transition hover:bg-ink-50 hover:text-crimson-700"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>Back</Link></div> : null}{children}</main>
    </div>
  );
}

function initials(value: string) { return value.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "AR"; }
