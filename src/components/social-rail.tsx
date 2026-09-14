import type { ComponentType, SVGProps } from "react";

import { Mail, Phone } from "@/components/icons";
import { Facebook, Instagram, LinkedIn, X } from "@/components/social-icons";
import type { arlarContactLinks, arlarSocialLinks } from "@/lib/contact-links";

type RailIcon = ComponentType<SVGProps<SVGSVGElement>>;

const iconByPlatform = {
  facebook: Facebook,
  instagram: Instagram,
  x: X,
  linkedin: LinkedIn,
  email: Mail,
  phone: Phone,
} satisfies Record<string, RailIcon>;

const colorByPlatform = {
  facebook: "text-[#1877f2] hover:bg-[#1877f2]/10 hover:ring-[#1877f2]/25",
  instagram: "text-[#d62976] hover:bg-[#d62976]/10 hover:ring-[#d62976]/25",
  x: "text-ink-950 hover:bg-ink-950/8 hover:ring-ink-950/15",
  linkedin: "text-[#0a66c2] hover:bg-[#0a66c2]/10 hover:ring-[#0a66c2]/25",
  email: "text-jade-700 hover:bg-jade-500/10 hover:ring-jade-500/25",
  phone: "text-crimson-700 hover:bg-crimson-500/10 hover:ring-crimson-500/25",
} satisfies Record<string, string>;

export function SocialRail({ socialLinks, contactLinks }: { socialLinks: typeof arlarSocialLinks; contactLinks: typeof arlarContactLinks }) {
  return (
    <aside
      dir="ltr"
      className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center rounded-full border border-ink-100 bg-white p-1.5 shadow-[0_14px_45px_-18px_rgba(5,12,20,0.5)] min-[1400px]:flex"
      aria-label="ArLAR social media and contact links"
    >
      <div className="flex flex-col gap-0.5">
        {socialLinks.map((link) => (
          <RailLink key={link.platform} {...link} />
        ))}
      </div>
      <div className="flex flex-col gap-0.5">
        {contactLinks.map((link) => (
          <RailLink key={link.platform} {...link} />
        ))}
      </div>
    </aside>
  );
}

function RailLink({
  label,
  href,
  platform,
}: {
  label: string;
  href: string;
  platform: keyof typeof iconByPlatform;
}) {
  const Icon = iconByPlatform[platform];
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`group relative grid size-10 place-items-center rounded-full ring-1 ring-transparent transition-colors ${colorByPlatform[platform]}`}
      aria-label={label}
      title={label}
    >
      <Icon className="size-5" />
      <span className="pointer-events-none absolute left-full ml-3 min-w-max translate-x-1 rounded-lg bg-ink-950 px-2.5 py-1.5 font-display text-[10px] font-semibold text-white opacity-0 shadow-lg transition group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
        {label}
      </span>
    </a>
  );
}
