type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

/** Small line icons used only by the ArLAR27 destination guide. */
export function Banknote({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

export function PlugIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 2v6M15 2v6" />
      <path d="M6 8h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8Z" />
      <path d="M12 17v5" />
    </svg>
  );
}

export function Plane({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2 13l9-2V4.5a1.5 1.5 0 0 1 3 0V11l7 1.5v2L14 14v4l2.5 1.6V21L12 19.8 7.5 21v-1.4L10 18v-4l-8 .8Z" />
    </svg>
  );
}

export function Sun({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function Passport({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M9 17h6" />
    </svg>
  );
}

export function Languages({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 5h10M8 3v2M11 5c0 4-3.5 8-8 8" />
      <path d="M6 10c1.5 2 3.5 3.5 6 4.5" />
      <path d="M13 21l4.5-11L22 21M15 17h5" />
    </svg>
  );
}
