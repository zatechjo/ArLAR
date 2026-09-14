"use client";

import { useEffect } from "react";

export function Arlar27LandingMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-arlar27-landing]");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const revealItems = Array.from(
      root.querySelectorAll<HTMLElement>("[data-arlar27-reveal]"),
    );
    root.classList.add("is-motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    for (const item of revealItems) observer.observe(item);

    return () => {
      observer.disconnect();
      root.classList.remove("is-motion-ready");
    };
  }, []);

  return null;
}
