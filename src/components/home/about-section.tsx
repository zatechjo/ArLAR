import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "@/components/icons";

const commitments = [
  "Promote excellence in the care of rheumatic and musculoskeletal diseases",
  "Advance education, research, and professional development",
  "Strengthen regional and global collaboration between societies",
  "Support patient health through awareness and public resources",
];

export function AboutSection() {
  return (
    <section className="bg-white px-4 pb-20 pt-14 sm:px-6 lg:pb-28 lg:pt-20">
      <div className="mx-auto max-w-7xl">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        {/* Image */}
        <div className="relative order-last lg:order-first">
          <div
            aria-hidden
            className="bg-gradient-brand absolute -inset-3 rounded-[2.5rem] opacity-10 blur-2xl"
          />
          <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-ink-950/20 ring-1 ring-ink-900/5">
            <Image
              src="/images/hero-hands.jpg"
              alt="A caregiver holding a patient's hands"
              width={1100}
              height={800}
              className="aspect-[5/4] w-full object-cover"
            />
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-6 -right-4 rounded-2xl bg-white p-5 shadow-xl shadow-ink-950/15 ring-1 ring-ink-900/5 sm:-right-6">
            <p className="font-display text-3xl font-bold text-gradient-crimson">
              30 yrs
            </p>
            <p className="mt-0.5 text-[12.5px] font-medium text-ink-500">
              of rheumatology care
            </p>
          </div>
          {/* Accent bars */}
          <div className="absolute -left-3 top-8 hidden flex-col gap-2 sm:flex">
            <span className="h-12 w-1.5 rounded-full bg-crimson-600" />
            <span className="h-8 w-1.5 rounded-full bg-jade-600" />
          </div>
        </div>

        {/* Copy */}
        <div>
          <p className="font-display text-[13px] font-semibold uppercase tracking-widest text-crimson-600">
            Who we are
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink-950 sm:text-4xl">
            One league, uniting rheumatology societies across the Arab world
          </h2>
          <p className="mt-5 text-[15.5px] leading-relaxed text-ink-600">
            Founded on March 29, 1995 as the Pan Arab Society of Rheumatic
            Diseases and renamed the Arab League of Associations for
            Rheumatology in 2018, ArLAR represents Arab rheumatologists and
            national member societies — one professional home for the
            rheumatology community across the region.
          </p>

          <ul className="mt-8 space-y-3">
            {commitments.map((item, i) => (
              <li key={item} className="flex items-start gap-3.5">
                <span
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white ${
                    i % 2 === 0 ? "bg-gradient-crimson" : "bg-gradient-jade"
                  }`}
                >
                  <Check className="size-3.5" />
                </span>
                <p className="text-[14.5px] leading-relaxed text-ink-700">
                  {item}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/about"
              className="bg-gradient-jade inline-flex items-center gap-2 rounded-full px-6 py-3 font-display text-[14px] font-semibold text-white shadow-lg shadow-jade-600/25 transition-all hover:shadow-xl hover:brightness-110"
            >
              About ArLAR
              <ArrowRight className="rtl-flip size-4" />
            </Link>
            <Link
              href="/about/board"
              className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-6 py-3 font-display text-[14px] font-semibold text-ink-800 transition-colors hover:border-ink-300 hover:bg-ink-50"
            >
              Meet the Board
            </Link>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
