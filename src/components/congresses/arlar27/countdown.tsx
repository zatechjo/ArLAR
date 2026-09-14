"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/locale-context";

const congressStart = new Date("2027-03-24T09:00:00+03:00").getTime();

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateTimeLeft(): TimeLeft {
  const remaining = Math.max(0, congressStart - Date.now());

  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
  };
}

export function Arlar27Countdown() {
  const { t } = useTranslations();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => setTimeLeft(calculateTimeLeft());
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = [
    { label: "Days", value: timeLeft?.days },
    { label: "Hours", value: timeLeft?.hours },
    { label: "Minutes", value: timeLeft?.minutes },
    { label: "Seconds", value: timeLeft?.seconds },
  ];

  return (
    <div className="grid grid-cols-4 divide-x divide-white/12" aria-label={t("Countdown to ArLAR27")}>
      {parts.map((part) => (
        <div key={part.label} className="px-2 text-center sm:px-5">
          <p className="font-display text-2xl font-semibold tabular-nums tracking-[-0.04em] text-white sm:text-3xl">
            {part.value === undefined ? "—" : String(part.value).padStart(2, "0")}
          </p>
          <p className="mt-1 text-[8px] font-semibold tracking-[0.15em] text-white/42 uppercase sm:text-[9px]">
            {t(part.label)}
          </p>
        </div>
      ))}
    </div>
  );
}
