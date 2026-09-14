import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  GraduationCap,
  HeartPulse,
  Microscope,
  Users,
} from "@/components/icons";

type Pillar = {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: "crimson" | "jade";
};

const pillars: Pillar[] = [
  {
    title: "Educational Library",
    description:
      "Lectures, webinars, and learning material for healthcare professionals.",
    href: "/education",
    icon: BookOpen,
    tone: "crimson",
  },
  {
    title: "Special Interest Groups",
    description:
      "Nine focused groups — from pediatric rheumatology to women health and research.",
    href: "/special-interest-groups",
    icon: Users,
    tone: "jade",
  },
  {
    title: "ArLAR College",
    description:
      "Fellowship and structured professional development for the next generation.",
    href: "/college/about",
    icon: GraduationCap,
    tone: "jade",
  },
  {
    title: "Research and ARCH",
    description:
      "Regional research collaborations, registries, and the ArLAR research group.",
    href: "/special-interest-groups",
    icon: Microscope,
    tone: "crimson",
  },
  {
    title: "Publications",
    description:
      "Recommendations, consensus statements, and the Arab Journal of Rheumatology.",
    href: "/professionals/publications",
    icon: FileText,
    tone: "crimson",
  },
  {
    title: "For Public and Patients",
    description:
      "Awareness campaigns and trusted resources for patients and families.",
    href: "/public-patients",
    icon: HeartPulse,
    tone: "jade",
  },
];

const toneStyles = {
  crimson: {
    icon: "bg-crimson-50 text-crimson-600 group-hover:bg-gradient-crimson group-hover:text-white",
    hover: "hover:border-crimson-200",
  },
  jade: {
    icon: "bg-jade-50 text-jade-600 group-hover:bg-gradient-jade group-hover:text-white",
    hover: "hover:border-jade-200",
  },
} as const;

export function PillarsSection() {
  return (
    <section className="bg-ink-50/60 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="font-display text-[13px] font-semibold uppercase tracking-widest text-jade-600">
            What we do
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink-950 sm:text-4xl">
            Education, research, and community — in one place
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const tone = toneStyles[pillar.tone];
            return (
              <Link
                key={pillar.title}
                href={pillar.href}
                className={`group relative rounded-2xl border border-ink-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${tone.hover}`}
              >
                <span
                  className={`flex size-12 items-center justify-center rounded-xl transition-colors ${tone.icon}`}
                >
                  <pillar.icon className="size-6" />
                </span>
                <h3 className="mt-5 flex items-center justify-between font-display text-lg font-semibold text-ink-950">
                  {pillar.title}
                  <ArrowUpRight className="size-4 text-ink-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink-900" />
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-500">
                  {pillar.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
