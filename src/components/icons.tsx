import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps): IconProps {
  return {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    ...props,
  };
}

export function ChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function Play(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 6 9 6-9 6V6Z" />
    </svg>
  );
}

export function Search(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function Menu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

/** Menu glyph with a shortened bottom rule, used for the mobile header button. */
export function MenuTapered(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2.2}>
      <path d="M4 8h16" />
      <path d="M4 14h16" />
      <path d="M4 20h9" />
    </svg>
  );
}

export function Close(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export function Globe(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

export function GraduationCap(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m2 9 10-5 10 5-10 5L2 9Z" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
      <path d="M22 9v6" />
    </svg>
  );
}

export function Users(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 19.5c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <path d="M16 5a3.5 3.5 0 0 1 0 7" />
      <path d="M18.5 14.5c1.9.7 3 2.2 3 4" />
    </svg>
  );
}

export function BookOpen(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 6c-1.5-1.6-3.7-2.5-6-2.5H4V18h2c2.3 0 4.5.9 6 2.5 1.5-1.6 3.7-2.5 6-2.5h2V3.5h-2c-2.3 0-4.5.9-6 2.5Z" />
      <path d="M12 6v14.5" />
    </svg>
  );
}

export function FileText(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  );
}

export function Mic(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v3" />
    </svg>
  );
}

export function Microscope(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0 0-14h-1" />
      <path d="M9 14h2" />
      <path d="M9 2h4v6a2 2 0 0 1-2 2 2 2 0 0 1-2-2V2Z" />
    </svg>
  );
}

export function HeartPulse(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 14c1.5-1.5 3-3.4 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3.4.9-4.5 2.3A5.7 5.7 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.1 1.5 4 3 5.5l7 7 7-7Z" />
      <path d="M3.5 12h5l1.5-3 2 5 1.5-2h5" />
    </svg>
  );
}

export function CalendarDays(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 11h18" />
    </svg>
  );
}

export function MapPin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function Quote(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 11H5.5A3.5 3.5 0 0 0 2 14.5V18h8v-7Z" />
      <path d="M22 11h-4.5a3.5 3.5 0 0 0-3.5 3.5V18h8v-7Z" />
      <path d="M4 11c0-3.1 1.4-5.3 4.2-6.7" />
      <path d="M16 11c0-3.1 1.4-5.3 4.2-6.7" />
    </svg>
  );
}

export function Mail(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function Phone(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.5 3h3l1.5 4.5-2 1.5a13 13 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
    </svg>
  );
}

export function Download(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  );
}

export function ExternalLink(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 4h6v6" />
      <path d="m20 4-9 9" />
      <path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

export function Video(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="6" width="13" height="12" rx="2" />
      <path d="m15.5 10.5 6-3.5v10l-6-3.5" />
    </svg>
  );
}

export function Award(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="9" r="6" />
      <path d="m8.5 14-1.5 7 5-2.5 5 2.5-1.5-7" />
    </svg>
  );
}

export function Sparkle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
      <path d="M18.5 15.5 19 17l1.5.5L19 18l-.5 1.5L18 18l-1.5-.5L18 17l.5-1.5Z" />
    </svg>
  );
}

export function Share2(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.5 6.8-4" />
      <path d="m8.6 13.5 6.8 4" />
    </svg>
  );
}

export function Link2(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
      <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
    </svg>
  );
}

export function Clock3(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
