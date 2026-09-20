"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HeaderSearch } from "@/components/search/header-search";
import {
  languages,
  getMainNav,
  type NavItem,
  type NavLink,
} from "@/lib/navigation";
import { localizePath, type Locale } from "@/i18n/config";
import { translate } from "@/i18n/messages";
import { useTranslations } from "@/i18n/locale-context";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Close,
  FileText,
  GraduationCap,
  Globe,
  HeartPulse,
  Mail,
  MenuTapered,
  Microscope,
  Play,
  Quote,
  Search,
  Users,
  Video,
} from "@/components/icons";

const utilityLinks = [
  { label: "About ArLAR", href: "/about" },
  { label: "Related Links", href: "/events/related-links" },
  { label: "Contact Us", href: "/contact" },
];

const featureLinks = [
  {
    label: "ArLAR27 Iraq Congress",
    href: "/congresses/arlar27",
    tone: "congress",
    eyebrow: "Annual congress",
  },
  {
    label: "Special Interest Groups",
    href: "/special-interest-groups",
    tone: "groups",
    eyebrow: "Clinical groups",
  },
  {
    label: "For Public & Patients",
    // The full label is a page title used in five other places; the header
    // chip is width-constrained, so it gets its own shorter wording.
    headerLabel: "Public & Patients",
    href: "/public-patients",
    tone: "patients",
    eyebrow: "Patient resources",
  },
  {
    label: "ArLAR News",
    href: "/news",
    tone: "news",
    eyebrow: "News & updates",
  },
];

const featureBadge = {
  groups: "bg-crimson-50 text-crimson-700 ring-crimson-100",
  patients: "bg-jade-50 text-jade-700 ring-jade-100",
  news: "bg-crimson-50 text-crimson-700 ring-crimson-100",
} as const;

const featureIcons = {
  congress: CalendarDays,
  groups: Microscope,
  patients: HeartPulse,
  news: FileText,
} as const;

function navButtonClass(active: boolean) {
  return [
    "group/nav relative inline-flex h-10 w-full items-center justify-center gap-1.5 px-3 font-display text-[12.5px] font-medium whitespace-nowrap transition-colors lg:max-xl:h-11 lg:max-xl:gap-1 lg:max-xl:px-1.5 lg:max-xl:text-center lg:max-xl:text-[10.5px] lg:max-xl:leading-tight lg:max-xl:whitespace-normal min-[1700px]:h-12 min-[1700px]:text-[14px]",
    active
      ? "text-jade-700"
      : "text-ink-950 hover:bg-ink-50/90 hover:text-crimson-700",
  ].join(" ");
}

/**
 * Most specific match wins. The section href (e.g. `/college`) is checked last
 * so it acts as a fallback rather than swallowing every link beneath it.
 */
function SubmenuIcon({
  link,
  className,
}: {
  link: NavLink;
  className: string;
}) {
  const label = link.label.toLowerCase();
  const href = link.href?.toLowerCase() ?? "";

  if (href.includes("replay") || label.includes("replay")) return <Play className={className} />;
  if (href.includes("publication") || label.includes("publication")) return <BookOpen className={className} />;
  if (href.includes("scientific") || href.includes("research") || label.includes("scientific") || label.includes("research")) {
    return <Microscope className={className} />;
  }
  if (href.includes("international") || label.includes("international")) return <Globe className={className} />;
  if (href.includes("president") || label.includes("president")) return <Quote className={className} />;
  if (href.includes("secretariat") || label.includes("secretariat")) return <Mail className={className} />;
  if (href.includes("media") || label.includes("media")) return <Video className={className} />;
  if (href.includes("history") || href.includes("bylaws") || label.includes("history") || label.includes("bylaws")) {
    return <FileText className={className} />;
  }
  if (href.includes("board") || href.includes("members") || href.includes("partner") || label.includes("board") || label.includes("member") || label.includes("partner")) {
    return <Users className={className} />;
  }
  if (href.includes("/college")) return <GraduationCap className={className} />;
  if (href.includes("/event") || href.includes("/congress") || link.links?.length) {
    return <CalendarDays className={className} />;
  }

  return <Globe className={className} />;
}

function LanguageSelector({
  locale,
  open,
  onOpen,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const current = languages.find((language) => language.code === locale) ?? languages[0];
  const pointerTypeRef = useRef("");
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="relative h-full"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") onOpen();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") onClose();
      }}
    >
      <button
        type="button"
        aria-label={`Language: ${current.nativeLabel}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onPointerDown={(event) => {
          pointerTypeRef.current = event.pointerType;
        }}
        onClick={() => {
          if (pointerTypeRef.current === "mouse") onOpen();
          else if (open) onClose();
          else onOpen();
          pointerTypeRef.current = "";
        }}
        className="inline-flex h-full items-center gap-1 px-1.5 font-display text-[9px] font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white sm:gap-1.5 sm:px-3 sm:text-[12px]"
      >
        <Globe className="size-3 text-white/75 sm:size-3.5" />
        <span className="hidden min-[360px]:inline">{current.nativeLabel}</span>
        <ChevronDown
          className={`size-2.5 text-white/60 transition-transform sm:size-3 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute top-[calc(100%+0.5rem)] z-50 transition-all duration-200 ${
          locale === "ar" ? "left-0" : "right-0"
        } ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        }`}
      >
        <div className="w-48 rounded-2xl border border-ink-100 bg-white p-1.5 shadow-2xl shadow-crimson-950/25">
          {languages.map((lang) => {
            const active = lang.code === current.code;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  router.replace(localizePath(pathname, lang.code));
                  onClose();
                }}
                role="menuitem"
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-start transition-colors hover:bg-ink-50 ${
                  active ? "text-jade-700" : "text-ink-700"
                }`}
              >
                <span>
                  <span lang={lang.code === "ar" ? "ar" : undefined} className={`block text-[12.5px] font-semibold ${lang.code === "ar" ? "font-arabic" : "font-display"}`}>
                    {lang.nativeLabel}
                  </span>
                  <span className="block text-[10.5px] text-ink-400">
                    {lang.label}
                  </span>
                </span>
                {active ? <Check className="size-3.5" /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DesktopSubmenuItem({
  link,
  locale,
  onClose,
}: {
  link: NavLink;
  locale: Locale;
  onClose: () => void;
}) {
  const hasChildren = Boolean(link.links?.length);
  const [nestedOpen, setNestedOpen] = useState(false);

  const rowContent = (
    <>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-500 ring-1 ring-inset ring-ink-100 transition-colors group-hover/row:bg-crimson-600 group-hover/row:text-white group-hover/row:ring-crimson-600">
        <SubmenuIcon link={link} className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block whitespace-nowrap font-display text-[13.5px] font-semibold leading-4 text-ink-950 transition-colors group-hover/row:text-crimson-700">
          {link.label}
        </span>
        {link.description ? (
          <span className="mt-0.5 block whitespace-nowrap text-[11.5px] leading-4 text-ink-500">
            {link.description}
          </span>
        ) : null}
      </span>
      <ArrowRight
        className={`rtl-flip size-3.5 shrink-0 transition-all ${
          hasChildren
            ? "translate-x-0 opacity-100"
            : "-translate-x-1 opacity-0 group-hover/row:translate-x-0 group-hover/row:opacity-100"
        } text-crimson-600`}
      />
    </>
  );

  if (!hasChildren) {
    return (
      <Link
        href={link.href ?? "#"}
        onClick={onClose}
        className="group/row flex min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-crimson-50/80"
      >
        {rowContent}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setNestedOpen(true)}
      onMouseLeave={() => setNestedOpen(false)}
      onFocus={() => setNestedOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setNestedOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={nestedOpen}
        onClick={() => setNestedOpen((value) => !value)}
        className="group/row flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-start transition-colors hover:bg-crimson-50/80"
      >
        {rowContent}
      </button>
      <div
        className={`absolute top-0 z-60 transition-all duration-200 ${
          locale === "ar" ? "right-full pr-2" : "left-full pl-2"
        } ${
          nestedOpen
            ? "visible translate-x-0 opacity-100"
            : `invisible opacity-0 ${locale === "ar" ? "translate-x-1" : "-translate-x-1"}`
        }`}
      >
        <div
          style={{ width: "20rem" }}
          className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-xl shadow-ink-950/12"
        >
          <div className="border-b border-ink-100 bg-ink-50/80 px-3.5 py-2.5">
            <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-crimson-600">
              {translate(locale, "Congress archive")}
            </span>
            <span className="mt-0.5 block font-display text-[13px] font-semibold text-ink-950">
              {translate(locale, "Past ArLAR Congresses")}
            </span>
          </div>
          <div className="grid gap-0.5 p-2">
            {link.links?.map((childLink) => (
              <DesktopSubmenuItem
                key={(childLink.href ?? "group") + childLink.label}
                link={childLink}
                locale={locale}
                onClose={onClose}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopDropdown({
  item,
  locale,
  open,
  active,
  onOpen,
  onClose,
}: {
  item: NavItem;
  locale: Locale;
  open: boolean;
  active: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const twoColumns = (item.links?.length ?? 0) > 5;
  const dropdownWidth =
    item.label === translate(locale, "About Us")
      ? "34rem"
      : item.label === translate(locale, "Events & Congresses")
        ? "24.5rem"
        : item.label === translate(locale, "ArLAR College")
          ? "19rem"
          : item.label === translate(locale, "For Healthcare Professionals")
            ? "20.5rem"
            : "22rem";
  const standardLinks = item.links?.filter((link) => !link.emphasis) ?? [];
  const footerLinks = item.links?.filter((link) => link.emphasis) ?? [];

  return (
    <div
      className="relative flex min-w-0 flex-auto items-center border-r border-ink-100 first:border-l"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      {item.href ? (
        <Link
          href={item.href}
          aria-expanded={open}
          onFocus={onOpen}
          className={navButtonClass(open || active)}
        >
          {item.label}
          {item.links ? <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} /> : null}
          {active ? <span className="absolute inset-x-3 bottom-0 h-1 rounded-t-full bg-jade-600" /> : null}
        </Link>
      ) : (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={open ? onClose : onOpen}
          onFocus={onOpen}
          className={`${navButtonClass(open || active)} cursor-pointer`}
        >
          {item.label}
          <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          {active ? <span className="absolute inset-x-3 bottom-0 h-1 rounded-t-full bg-jade-600" /> : null}
        </button>
      )}

      {item.links ? (
        <div
          className={`absolute top-full z-50 pt-0 transition-all duration-200 ${
            locale === "ar" ? "right-0" : "left-0"
          } ${
            open
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-1 opacity-0"
          }`}
        >
          <div className="rounded-b-xl border border-t-0 border-ink-100 bg-white shadow-xl shadow-ink-950/12">
            <div
              style={{ width: dropdownWidth }}
              className={`grid gap-y-0.5 p-2 ${
                twoColumns
                  ? "grid-cols-2 gap-x-3"
                  : "grid-cols-1"
              }`}
            >
              {standardLinks.map((link) => (
                <DesktopSubmenuItem
                  key={(link.href ?? "group") + link.label}
                  link={link}
                  locale={locale}
                  onClose={onClose}
                />
              ))}
            </div>
            {footerLinks.map((link) => (
              <Link
                key={(link.href ?? "group") + link.label}
                href={link.href ?? "#"}
                onClick={onClose}
                className="group/footer flex w-full items-center justify-between gap-4 rounded-b-xl border-t border-ink-100 bg-ink-50 px-4 py-3 font-display text-[13px] font-semibold text-ink-800 transition-colors hover:bg-jade-50 hover:text-jade-800"
              >
                <span>{link.label}</span>
                <ArrowRight className="rtl-flip size-3.5 shrink-0 text-jade-600 transition-transform group-hover/footer:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DesktopNav({
  items,
  locale,
  openMenu,
  pathname,
  onOpen,
  onClose,
}: {
  items: NavItem[];
  locale: Locale;
  openMenu: string | null;
  pathname: string;
  onOpen: (label: string) => void;
  onClose: () => void;
}) {
  return (
    <nav
      aria-label="Main navigation"
      className="mx-auto hidden w-full max-w-7xl items-center lg:grid lg:grid-cols-8 lg:px-4 xl:flex xl:px-6"
    >
      {items.map((item) => (
        <DesktopDropdown
          key={item.label}
          item={item}
          locale={locale}
          open={openMenu === item.label}
          active={
            item.href === localizePath("/", locale)
              ? pathname === item.href
              : Boolean(
                  (item.href && pathname.startsWith(item.href)) ||
                    item.links?.some((link) =>
                      link.href
                        ? pathname.startsWith(link.href)
                        : link.links?.some(
                            (child) => child.href && pathname.startsWith(child.href),
                          ),
                    ),
                )
          }
          onOpen={() => onOpen(item.label)}
          onClose={onClose}
        />
      ))}
    </nav>
  );
}

function MiddleDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 150"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern
            id="header-science-pattern"
            width="112"
            height="72"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M-8 36 H14 L28 18 H62 L78 36 H112"
              stroke="#64748b"
              strokeWidth="1"
              opacity="0.085"
            />
            <path
              d="M28 18 L14 0 M78 36 L64 54 H34 L20 72"
              stroke="#64748b"
              strokeWidth="1"
              opacity="0.065"
            />
            <circle cx="14" cy="36" r="2" fill="#c10230" opacity="0.1" />
            <circle cx="28" cy="18" r="1.5" fill="#64748b" opacity="0.11" />
            <circle cx="62" cy="18" r="1.5" fill="#00953b" opacity="0.1" />
            <circle cx="78" cy="36" r="2" fill="#64748b" opacity="0.1" />
            <circle cx="64" cy="54" r="1.5" fill="#c10230" opacity="0.08" />
            <circle cx="34" cy="54" r="1.5" fill="#00953b" opacity="0.085" />
            <path
              d="M96 10 V20 M91 15 H101"
              stroke="#00953b"
              strokeWidth="1.25"
              strokeLinecap="round"
              opacity="0.075"
            />
          </pattern>
          <linearGradient id="header-pattern-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="white" stopOpacity="0.9" />
            <stop offset="0.43" stopColor="white" stopOpacity="0.52" />
            <stop offset="0.57" stopColor="white" stopOpacity="0.52" />
            <stop offset="1" stopColor="white" stopOpacity="0.9" />
          </linearGradient>
          <mask id="header-pattern-mask">
            <rect width="1440" height="150" fill="url(#header-pattern-fade)" />
          </mask>
        </defs>
        <rect
          width="1440"
          height="150"
          fill="url(#header-science-pattern)"
          mask="url(#header-pattern-mask)"
          opacity="0.68"
        />
      </svg>
    </div>
  );
}

function FeatureButton({ link }: { link: (typeof featureLinks)[number] }) {
  const { t, href } = useTranslations();
  const Icon = featureIcons[link.tone as keyof typeof featureIcons];

  const isCongress = link.tone === "congress";
  const title = isCongress
    ? t("ArLAR27 Iraq")
    : t(("headerLabel" in link && link.headerLabel) || link.label);

  const badge = isCongress
    ? "bg-[#ffc21c]/12 text-[#ffd45c] ring-[#ffc21c]/25"
    : featureBadge[link.tone as keyof typeof featureBadge];

  return (
    <Link
      href={href(link.href)}
      className={`group relative inline-flex h-12 w-[13.75rem] shrink-0 items-center gap-2 overflow-hidden rounded-xl border px-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 min-[1700px]:h-14 min-[1700px]:w-[15rem] ${
        isCongress
          ? "border-[#0d4c7a] bg-[#032b52] text-[#ffd45c] shadow-md shadow-[#032b52]/20 hover:border-[#ffc21c]/45 hover:bg-[#063761] focus-visible:outline-[#ffc21c]"
          : "border-ink-100 bg-white text-ink-950 hover:border-ink-200 hover:bg-ink-50/70 focus-visible:outline-crimson-600"
      }`}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg ring-1 ring-inset min-[1700px]:size-9 ${badge}`}
      >
        <Icon className="size-4 min-[1700px]:size-[17px]" />
      </span>
      <span className="min-w-0 flex-1 text-start leading-none">
        <span
          className={`block truncate text-[8px] font-bold uppercase tracking-[0.13em] min-[1700px]:text-[10px] ${
            isCongress ? "text-sky-100/65" : "text-ink-400"
          }`}
        >
          {t(link.eyebrow)}
        </span>
        <span
          className={`mt-0.5 block truncate font-display text-[11.5px] font-bold min-[1700px]:mt-1 min-[1700px]:text-[13px] ${
            isCongress
              ? "text-[#ffd45c]"
              : "text-ink-900 transition-colors group-hover:text-crimson-700"
          }`}
        >
          {title}
        </span>
      </span>
      <ArrowRight
        className={`rtl-flip ms-1 size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
          isCongress ? "text-[#ffd45c]/80" : "text-ink-300 group-hover:text-crimson-600"
        }`}
      />
    </Link>
  );
}

function MobileSubmenuItem({
  link,
  onNavigate,
}: {
  link: NavLink;
  onNavigate: () => void;
}) {
  const isRelated = link.emphasis === "related";

  if (link.links?.length) {
    return (
      <MobileNestedGroup link={link} onNavigate={onNavigate} />
    );
  }

  if (isRelated) {
    return (
      <Link
        href={link.href ?? "#"}
        onClick={onNavigate}
        className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-ink-50 px-3 py-2.5 font-display text-[13px] font-semibold text-ink-800 transition-colors hover:bg-jade-50 hover:text-jade-800"
      >
        <span>{link.label}</span>
        <ArrowRight className="rtl-flip size-3.5 shrink-0 text-jade-600" />
      </Link>
    );
  }

  return (
    <Link
      href={link.href ?? "#"}
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-ink-600 transition-colors hover:bg-crimson-50 hover:text-crimson-700"
    >
      <SubmenuIcon
        link={link}
        className="size-3.5 shrink-0 text-ink-400"
      />
      <span className="whitespace-nowrap">{link.label}</span>
    </Link>
  );
}

function MobileNestedGroup({
  link,
  onNavigate,
}: {
  link: NavLink;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-[13px] text-ink-600 transition-colors hover:bg-crimson-50 hover:text-crimson-700"
      >
        <SubmenuIcon
          link={link}
          className="size-3.5 shrink-0 text-ink-400"
        />
        <span className="min-w-0 flex-1 whitespace-nowrap">{link.label}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-ink-400 transition-transform duration-300 motion-reduce:transition-none ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
      <div
        id={panelId}
        aria-hidden={!open}
        inert={open ? undefined : true}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="ms-5 grid gap-0.5 border-s border-ink-100 py-1 ps-2">
            {link.links?.map((childLink) => (
              <MobileSubmenuItem
                key={(childLink.href ?? "group") + childLink.label}
                link={childLink}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileNavSection({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-b border-ink-100">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between py-4 text-start font-display text-[15px] font-semibold text-ink-950"
      >
        {item.label}
        <ChevronDown
          className={`size-4 text-ink-400 transition-transform duration-300 motion-reduce:transition-none ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
      <div
        id={panelId}
        aria-hidden={!open}
        inert={open ? undefined : true}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="grid gap-1 pb-3">
            {item.links?.map((link) => (
              <MobileSubmenuItem
                key={(link.href ?? "group") + link.label}
                link={link}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({
  items,
  open,
  onNavigate,
}: {
  items: NavItem[];
  open: boolean;
  onNavigate: () => void;
}) {
  const { t, href } = useTranslations();
  return (
    <div
      id="mobile-site-menu"
      aria-hidden={!open}
      inert={open ? undefined : true}
      className={`fixed inset-x-0 bottom-0 top-[7.0625rem] z-40 origin-top overscroll-y-contain overflow-y-auto border-t border-ink-100 bg-white shadow-2xl shadow-ink-950/12 transition-[clip-path,opacity,transform] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:top-[8.0625rem] lg:hidden ${
        open
          ? "pointer-events-auto translate-y-0 opacity-100 [clip-path:inset(0_0_0_0)]"
          : "pointer-events-none -translate-y-2 opacity-0 [clip-path:inset(0_0_100%_0)]"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="grid grid-cols-2 gap-2.5">
          {featureLinks.map((link, index) => {
            const isCongress = link.tone === "congress";
            const isPatients = link.tone === "patients";
            const isGroups = link.tone === "groups";

            return (
              <Link
                key={link.href}
                href={href(link.href)}
                onClick={onNavigate}
                style={{
                  transitionDelay: open ? `${70 + index * 45}ms` : "0ms",
                }}
                className={`group relative flex h-[4.75rem] flex-col justify-center overflow-hidden rounded-2xl border p-3 font-display transition-[transform,opacity,border-color,background-color] duration-300 motion-reduce:transition-none ${
                  open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                } ${
                  isCongress
                    ? "border-[#0d4c7a] bg-[#032b52] text-white hover:border-[#ffc21c]/60 hover:bg-[#063761]"
                    : isPatients
                      ? "border-jade-100 bg-jade-50/65 text-ink-950 hover:border-jade-300 hover:bg-jade-50"
                      : isGroups
                        ? "border-crimson-100 bg-crimson-50/65 text-ink-950 hover:border-crimson-300 hover:bg-crimson-50"
                        : "border-ink-100 bg-white text-ink-950 hover:border-crimson-200 hover:bg-ink-50"
                }`}
              >
                <span className="relative z-10 flex w-full items-end justify-between gap-2">
                  <span className="min-w-0">
                    <span
                      className={`block text-[8px] font-semibold tracking-[0.14em] uppercase ${
                        isCongress ? "text-sky-100/60" : "text-ink-400"
                      }`}
                    >
                      {t(link.eyebrow)}
                    </span>
                    <span
                      className={`mt-1 block text-[11.5px] font-bold leading-[1.25] ${
                        isCongress ? "text-[#ffd45c]" : "text-ink-950"
                      }`}
                    >
                      {isCongress
                        ? t("ArLAR27 Iraq")
                        : t(("headerLabel" in link && link.headerLabel) || link.label)}
                    </span>
                  </span>
                  <ArrowRight
                    className={`rtl-flip mb-0.5 size-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 ${
                      isCongress ? "text-[#ffd45c]/80" : "text-ink-300"
                    }`}
                  />
                </span>
                <span
                  className={`pointer-events-none absolute -right-7 -top-7 size-20 rounded-full border ${
                    isCongress ? "border-white/8" : "border-ink-100/70"
                  }`}
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>

        <nav
          className={`mt-5 transition-[transform,opacity] duration-300 motion-reduce:transition-none ${
            open ? "translate-y-0 opacity-100 delay-200" : "translate-y-2 opacity-0"
          }`}
          aria-label={t("Main navigation")}
        >
          {items.map((item) =>
            item.links ? (
              <MobileNavSection
                key={item.label}
                item={item}
                onNavigate={onNavigate}
              />
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                onClick={onNavigate}
                className="flex items-center justify-between border-b border-ink-100 py-4 font-display text-[15px] font-semibold text-ink-950"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </div>
  );
}

export type LatestNewsItem = {
  slug: string;
  title: string;
};

export function SiteHeader({ locale, latestNews }: { locale: Locale; latestNews: LatestNewsItem[] }) {
  const pathname = usePathname();
  const navItems = getMainNav(locale);
  const t = (source: string) => translate(locale, source);
  const href = (path: string) => localizePath(path, locale);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  // Keep the canonical feed newest-first. In RTL the visual order is
  // right-to-left, so reverse the sequence inside the LTR marquee track; this
  // puts the newest story on the right while the whole ticker travels left.
  const tickerItems = locale === "ar" ? [...latestNews].reverse() : latestNews;

  useEffect(() => {
    const updateScrollState = () => {
      const y = Math.max(0, window.scrollY);
      // Use separate enter/exit thresholds so the sticky header cannot flap
      // while the browser settles around the top of the page.
      setIsScrolled((current) => (current ? y > 8 : y > 28));
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousRootOverscroll = root.style.overscrollBehavior;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;

    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      root.style.overflow = previousRootOverflow;
      root.style.overscrollBehavior = previousRootOverscroll;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeMobileMenu = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener("change", closeMobileMenu);
    return () => desktop.removeEventListener("change", closeMobileMenu);
  }, []);

  const openWithIntent = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };

  const closeWithIntent = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 100);
  };

  return (
    <header
      className={`site-header-transition ${
        mobileOpen ? "fixed inset-x-0 top-0" : "sticky top-0"
      } z-50 bg-white shadow-lg shadow-ink-950/8`}
    >
      <div className="border-b border-crimson-950/20 bg-linear-to-r from-crimson-800 via-crimson-600 to-crimson-900 text-white">
        <div className="mx-auto flex h-7 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:h-7 sm:w-[calc(100%-3rem)] sm:gap-6 sm:px-6 min-[1700px]:h-8">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden pr-1 sm:gap-3 sm:pr-2 md:max-w-[34rem] lg:max-w-[42rem] xl:max-w-[46rem]">
            <span className="shrink-0 font-display text-[7.5px] font-bold uppercase tracking-tight text-white/70 min-[360px]:text-[8.5px] sm:tracking-normal sm:text-[10.5px]">
              {t("Latest News")}
            </span>
              <div
                dir="ltr"
                className="relative min-w-0 flex-1 overflow-hidden"
                aria-label={t("Latest News")}
                onMouseEnter={() => setTickerPaused(true)}
                onMouseLeave={() => setTickerPaused(false)}
                onFocus={() => setTickerPaused(true)}
                onBlur={() => setTickerPaused(false)}
              >
                <div
                  dir="ltr"
                  className="flex w-max motion-safe:animate-marquee-header motion-reduce:translate-x-0 items-center whitespace-nowrap text-[9px] text-white/90 sm:text-[11.5px] min-[1700px]:text-[12.5px]"
                  style={{ animationPlayState: tickerPaused ? "paused" : "running" }}
                >
                  {[0, 1].map((segmentCopy) => (
                    <div
                      key={segmentCopy}
                      aria-hidden={segmentCopy === 1}
                      className="flex shrink-0 items-center gap-5 pr-5 sm:gap-8 sm:pr-8"
                    >
                      {tickerItems.map((item) => (
                        <Link
                          key={`${segmentCopy}-${item.slug}`}
                          dir={locale === "ar" ? "rtl" : "ltr"}
                          href={href(`/news/${item.slug}`)}
                          onClick={() => setTickerPaused(false)}
                          className="flex items-center gap-2 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none sm:gap-3"
                        >
                          <span className="size-[3px] shrink-0 rounded-full bg-white/55 sm:size-1" aria-hidden />
                          <span>{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          <div className="flex h-full shrink-0 items-center text-[10.5px] min-[1700px]:text-[12px]">
            <div className="hidden h-full items-center divide-x divide-white/25 sm:flex">
            {utilityLinks.map((link) => (
              <Link
                key={link.href}
                href={href(link.href)}
                  className="flex h-full items-center px-3 font-display font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {t(link.label)}
              </Link>
            ))}
            </div>
            <button
              type="button"
              aria-label={t("Search")}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
              className="hidden h-full items-center border-s border-white/25 px-3 text-white/85 transition-colors hover:bg-white/10 hover:text-white xl:flex"
            >
              <Search className="size-3.5" />
            </button>
            <div className="h-full border-s border-white/25">
              <LanguageSelector
                locale={locale}
                open={openMenu === "__lang"}
                onOpen={() => openWithIntent("__lang")}
                onClose={closeWithIntent}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`relative hidden overflow-hidden border-b border-ink-100 bg-white transition-[height] duration-300 ease-out motion-reduce:transition-none xl:block ${
          isScrolled
            ? "h-[72px] min-[1700px]:h-[108px]"
            : "h-20 min-[1700px]:h-[124px]"
        }`}
      >
        <MiddleDecor />
        <div className="relative mx-auto grid h-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-2 min-[1700px]:gap-6 min-[1700px]:py-3.5">
          <div className="flex items-center justify-start gap-2 min-[1700px]:gap-3">
            {featureLinks.slice(0, 2).map((link) => (
              <FeatureButton key={link.href} link={link} />
            ))}
          </div>

          <Link href={href("/")} className="flex items-center justify-center">
            <Image
              src="/arlar-logo.png"
              alt="ArLAR - Arab League of Associations for Rheumatology"
              width={280}
              height={143}
              priority
              className={`w-auto origin-center drop-shadow-sm transition-[height] duration-300 ease-out motion-reduce:transition-none ${
                isScrolled
                  ? "h-14 min-[1700px]:h-20"
                  : "h-16 min-[1700px]:h-24"
              }`}
            />
          </Link>

          <div className="flex items-center justify-end gap-2 min-[1700px]:gap-3">
            {featureLinks.slice(2).map((link) => (
              <FeatureButton key={link.href} link={link} />
            ))}
          </div>
        </div>
      </div>

      <div className="relative hidden h-20 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-ink-100 bg-white px-6 lg:grid xl:hidden">
        <MiddleDecor />
        <div className="relative flex justify-start">
          <FeatureButton link={featureLinks[0]} />
        </div>
        <Link href={href("/")} className="relative flex items-center justify-center">
          <Image
            src="/arlar-logo-tight.png"
            alt="ArLAR - Arab League of Associations for Rheumatology"
            width={1743}
            height={825}
            priority
            className="h-16 w-auto"
          />
        </Link>
        <div className="relative flex items-center justify-end gap-3">
          <FeatureButton link={featureLinks[3]} />
          <button
            type="button"
            aria-label={t("Search")}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(true)}
            className="grid size-11 place-items-center rounded-full bg-crimson-600 text-white transition-colors hover:bg-crimson-700"
          >
            <Search className="size-5" />
          </button>
        </div>
      </div>

      <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 sm:h-24 sm:px-4 lg:hidden">
        <div className="flex justify-start">
          <button
            type="button"
            aria-label={t("Search")}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(true)}
            className="flex size-12 items-center justify-center rounded-full bg-crimson-600 text-white shadow-sm shadow-crimson-900/20 transition-colors hover:bg-crimson-700"
          >
            <Search className="size-5" />
          </button>
        </div>

        <Link href={href("/")} className="flex items-center justify-center">
          <Image
            src="/arlar-logo-tight.png"
            alt="ArLAR - Arab League of Associations for Rheumatology"
            width={1743}
            height={825}
            priority
            className="h-[4.125rem] w-auto sm:h-20"
          />
        </Link>

        <div className="flex justify-end">
          <button
            type="button"
            aria-label={mobileOpen ? t("Close menu") : t("Open menu")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-site-menu"
            onClick={() => setMobileOpen((value) => !value)}
            className="relative flex size-12 items-center justify-center overflow-hidden rounded-[1.05rem] bg-crimson-600 text-white shadow-sm shadow-crimson-900/20 transition-colors hover:bg-crimson-700"
          >
            <MenuTapered
              className={`absolute size-5 transition-[transform,opacity] duration-300 motion-reduce:transition-none ${
                mobileOpen
                  ? "rotate-90 scale-75 opacity-0"
                  : "rotate-0 scale-100 opacity-100"
              }`}
            />
            <Close
              className={`absolute size-5 transition-[transform,opacity] duration-300 motion-reduce:transition-none ${
                mobileOpen
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-75 opacity-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="hidden border-b border-ink-100 bg-white/95 backdrop-blur-xl lg:block">
        <DesktopNav
          items={navItems}
          locale={locale}
          openMenu={openMenu}
          pathname={pathname}
          onOpen={openWithIntent}
          onClose={closeWithIntent}
        />
      </div>

      <div className="bg-gradient-brand h-[4px] w-full" aria-hidden />

      <MobileMenu
        items={navItems}
        open={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />
      {searchOpen ? <HeaderSearch onClose={closeSearch} /> : null}
    </header>
  );
}
