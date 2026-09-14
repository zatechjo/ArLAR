"use client";

import Link from "next/link";

import type { Arlar27ExternalLinks } from "@/lib/arlar27-external-links";

/**
 * Renders an ArLAR27 link as a normal in-site `<Link>`, unless the route it
 * points at is backed by an external portal — then it becomes a new-tab anchor
 * so the visitor keeps the congress site open behind them.
 *
 * `path` is the unlocalized internal route (e.g. "/congresses/arlar27/abstracts")
 * because that is the key `externalLinks` is built on; `href` is the localized
 * path used when the link stays internal.
 */
export function Arlar27ExternalAwareLink({
  path,
  href,
  externalLinks,
  className,
  children,
  ...rest
}: {
  path: string;
  href: string;
  externalLinks: Arlar27ExternalLinks;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">) {
  const externalUrl = externalLinks[path];

  if (externalUrl) {
    return (
      <a {...rest} href={externalUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link {...rest} href={href} className={className}>
      {children}
    </Link>
  );
}
