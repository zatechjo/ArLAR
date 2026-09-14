import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { memberCountries } from "@/lib/navigation";

export function SocietiesSection() {
  const doubled = [...memberCountries, ...memberCountries];

  return (
    <section className="overflow-hidden bg-ink-950 py-20 text-white lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-display text-[13px] font-semibold uppercase tracking-widest text-jade-400">
              Our community
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              National societies, one regional voice
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/60">
              ArLAR brings together national rheumatology societies from across
              the Arab world — from the Gulf to North Africa.
            </p>
          </div>
          <Link
            href="/members"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-display text-[14px] font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
          >
            Member societies
            <ArrowRight className="rtl-flip size-4" />
          </Link>
        </div>
      </div>

      {/* Scrolling country marquee */}
      <div className="relative mt-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-950 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-950 to-transparent"
        />
        <div className="flex w-max animate-marquee gap-4">
          {doubled.map((country, i) => (
            <span
              key={`${country}-${i}`}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-display text-[15px] font-semibold whitespace-nowrap"
            >
              <span
                className={`size-2 rounded-full ${
                  i % 2 === 0 ? "bg-crimson-500" : "bg-jade-500"
                }`}
              />
              {country}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
