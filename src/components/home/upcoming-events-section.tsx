"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "@/components/icons";
import { ScientificBackdrop } from "@/components/home/scientific-backdrop";
import { useTranslations } from "@/i18n/locale-context";

const CONGRESS_START = new Date("2027-03-24T00:00:00+03:00").getTime();

type TimeLeft = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const total = Math.max(0, CONGRESS_START - Date.now());

  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1_000) % 60),
  };
}

const countdownUnits = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

export function UpcomingEventsSection() {
  const { locale, t, href } = useTranslations();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const updateCountdown = () => setTimeLeft(getTimeLeft());

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full max-w-[100vw] overflow-hidden bg-[#f7fafb] px-4 pb-20 pt-8 sm:px-6 lg:pb-24 lg:pt-12">
      <ScientificBackdrop variant="events" />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-7xl">
        <article className="relative isolate min-h-[620px] w-full min-w-0 max-w-full overflow-hidden rounded-[2rem] bg-[#03172e] text-white shadow-2xl shadow-[#032b52]/15 sm:min-h-[650px] lg:min-h-[610px]">
          <Image
            src="/images/arlar27-save-the-date.jpg"
            alt="ArLAR27 save the date flyer for March 24 to 27, 2027 in Baghdad, Iraq"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center"
          />

          <div
            aria-hidden
            className={`absolute inset-0 ${
              locale === "ar"
                ? "bg-gradient-to-l from-[#03172e] via-[#03172e]/95 to-[#03172e]/20"
                : "bg-gradient-to-r from-[#03172e] via-[#03172e]/95 to-[#03172e]/20"
            }`}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#03172e]/85 via-transparent to-[#03172e]/20"
          />
          <div
            aria-hidden
            className="animate-congress-glow absolute -left-24 top-1/3 size-72 rounded-full bg-[#ffc21c]/10 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-36 left-[38%] size-80 rounded-full border-[38px] border-sky-300/10"
          />

          <div className="relative flex min-h-[620px] items-center p-6 sm:min-h-[650px] sm:p-10 lg:min-h-[610px] lg:p-14">
            <div className="w-full min-w-0 max-w-[650px] lg:w-[58%]">
              <div className="flex items-center gap-3 font-display text-[11px] font-semibold tracking-[0.08em] text-sky-100/80">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ffc21c] opacity-50" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-[#ffc21c]" />
                </span>
                {t("Upcoming ArLAR Congress")}
              </div>

              <div className="mt-7 flex items-end gap-3">
                <h2 className="font-display text-5xl font-semibold leading-none tracking-[-0.04em] text-white sm:text-6xl">
                  ArLAR<span className="text-[#ffc21c]">27</span>
                </h2>
                <span className="pb-1 font-display text-[13px] font-semibold tracking-[0.18em] text-sky-200 uppercase">
                  {t("Iraq")}
                </span>
              </div>

              <h3 className="mt-6 max-w-xl break-words font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
                {t("Shaping the future of rheumatology in the heart of Baghdad.")}
              </h3>
              <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-sky-100/65">
                {t("Four days of regional expertise, scientific exchange, and meaningful connection across the Arab rheumatology community.")}
              </p>

              <div className="mt-7 grid max-w-xl grid-cols-1 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-md sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="flex min-w-0 items-center gap-3 px-4 py-3.5 sm:px-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#ffc21c]/15 text-[#ffd45c]">
                    <CalendarDays className="size-4.5" />
                  </span>
                  <span>
                    <small className="block text-[9px] font-semibold tracking-[0.14em] text-sky-100/45 uppercase">
                      {t("Save the date")}
                    </small>
                    <strong className="mt-1 block font-display text-[13px] font-semibold text-white sm:text-[14px]">
                      {t("March 24–27, 2027")}
                    </strong>
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-3 px-4 py-3.5 sm:px-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200">
                    <MapPin className="size-4.5" />
                  </span>
                  <span>
                    <small className="block text-[9px] font-semibold tracking-[0.14em] text-sky-100/45 uppercase">
                      {t("Destination")}
                    </small>
                    <strong className="mt-1 block font-display text-[13px] font-semibold text-white sm:text-[14px]">
                      {t("Baghdad, Iraq")}
                    </strong>
                  </span>
                </div>
              </div>

              <div
                className="mt-7 grid w-full min-w-0 max-w-xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
                role="timer"
                aria-label={
                  timeLeft
                    ? `${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, and ${timeLeft.seconds} seconds until ArLAR27`
                    : "Countdown to ArLAR27 is loading"
                }
              >
                {countdownUnits.map((unit) => {
                  const value = timeLeft?.[unit.key];
                  const displayValue =
                    value === undefined ? "—" : String(value).padStart(2, "0");

                  return (
                    <div
                      key={unit.key}
                      className="overflow-hidden rounded-2xl border border-white/15 bg-[#061f3b]/70 px-2 py-3 text-center backdrop-blur-md sm:py-4"
                    >
                      <strong
                        key={`${unit.key}-${displayValue}`}
                        className="animate-countdown-tick block font-display text-2xl font-semibold leading-none tabular-nums text-white motion-reduce:animate-none sm:text-3xl"
                      >
                        {displayValue}
                      </strong>
                      <span className="mt-2 block text-[8px] font-semibold tracking-[0.13em] text-[#ffd45c] uppercase sm:text-[9px]">
                        {t(unit.label)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href={href("/congresses/arlar27")}
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#ffc21c] px-5 py-3 font-display text-[13px] font-semibold text-[#07182b] transition-all hover:-translate-y-0.5 hover:bg-[#ffd151]"
                >
                  {t("Discover ArLAR27")}
                  <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <span className="font-display text-[11px] font-semibold tracking-[0.13em] text-sky-100/55 uppercase">
                  {t("Baghdad awaits")}
                </span>
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="absolute bottom-0 right-0 h-1 w-[42%] bg-gradient-to-r from-transparent via-[#ffc21c] to-[#ffc21c]"
          />
        </article>
      </div>
    </section>
  );
}
