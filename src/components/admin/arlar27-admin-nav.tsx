"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Overview", href: "/admin/arlar27" },
  { label: "Welcome", href: "/admin/arlar27/welcome" },
  { label: "Committee", href: "/admin/arlar27/committee" },
  { label: "Faculty", href: "/admin/arlar27/faculty" },
  { label: "Abstracts", href: "/admin/arlar27/abstracts" },
  { label: "Registration", href: "/admin/arlar27/registration" },
  { label: "Programme", href: "/admin/arlar27/programme" },
  { label: "About Iraq", href: "/admin/arlar27/about-iraq" },
] as const;

export function Arlar27AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="ArLAR27 management sections" className="border-b border-slate-200 bg-white px-5 sm:px-8">
      <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-12 shrink-0 items-center px-3 text-xs font-semibold transition ${active ? "text-crimson-700" : "text-slate-500 hover:text-slate-900"}`}
            >
              {item.label}
              {active ? <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-crimson-600" /> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
