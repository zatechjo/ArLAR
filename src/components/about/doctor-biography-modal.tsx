"use client";

import { useLayoutEffect, useRef } from "react";

import { CountryFlag } from "@/components/about/country-flag";
import { DoctorAvatar } from "@/components/about/doctor-avatar";
import { Close } from "@/components/icons";
import {
  formatDoctorName,
  formatDoctorNameWithCredentials,
} from "@/lib/doctor-name";
import type { DoctorBiographyProfile } from "@/data/doctor-types";
import { useTranslations } from "@/i18n/locale-context";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

/**
 * The single biography dialog used by the board, the people directories and
 * search. Identity sits in a full-width header band so long names lay out on
 * one line instead of breaking inside a name.
 */
export function DoctorBiographyModal({
  doctor,
  onClose,
}: {
  doctor: DoctorBiographyProfile;
  onClose: () => void;
}) {
  const { locale, t } = useTranslations();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useModalAccessibility<HTMLElement>({ onClose, initialFocusRef: closeButtonRef });
  const titleId = `biography-${doctor.id}-title`;
  const isArabicProfile = locale === "ar" && Boolean(doctor.nameAr);
  // A published French bio is already French and must not go through t().
  const isFrenchBio = locale === "fr" && Boolean(doctor.biographyFr?.length);
  const frenchName = locale === "fr" ? doctor.nameFr : undefined;
  const name = isArabicProfile ? doctor.nameAr! : frenchName || formatDoctorName(doctor.fullName);
  // Full credentials appear here and nowhere else on the site.
  const titleName = isArabicProfile
    ? doctor.nameAr!
    : frenchName || formatDoctorNameWithCredentials(doctor.fullName, doctor.credentials);
  const biography = locale === "ar" && doctor.biographyAr?.length
    ? doctor.biographyAr
    : isFrenchBio
      ? doctor.biographyFr!
      : doctor.bio;

  return (
    <div
      className="fixed inset-0 z-[150] grid place-items-center overflow-y-auto bg-[#030a12]/76 p-4 backdrop-blur-[3px] sm:p-8"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative my-auto grid max-h-[calc(100dvh-2rem)] w-full max-w-2xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[1.75rem] bg-white shadow-2xl shadow-black/35 sm:max-h-[calc(100dvh-4rem)]"
      >
        <header className="relative overflow-hidden bg-gradient-to-br from-[#72001c] via-[#a1032a] to-[#c10230] px-6 py-7 text-white sm:px-9 sm:py-8">
          <div
            aria-hidden
            className="absolute -right-20 -top-24 size-56 rounded-full border border-white/12"
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -left-20 size-64 rounded-full border border-white/10"
          />

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t("Close biography")}
            className="absolute end-4 top-4 z-20 grid size-10 cursor-pointer place-items-center rounded-full border border-white/25 bg-white/12 text-white transition-colors hover:border-white/50 hover:bg-white/22 sm:size-11"
          >
            <Close className="size-5" />
          </button>

          {/* Stacked on narrow screens so the name gets the full band width
              instead of the sliver left beside the portrait. */}
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
            <PortraitFrame doctor={doctor} name={name} />

            {/* The taller portrait pushes this block below the close button,
                so it no longer needs to reserve room for it. */}
            <div className="min-w-0 flex-1">
              {doctor.flagFilename ? (
                <div className="flex items-center gap-2">
                  <CountryFlag filename={doctor.flagFilename} size="modal" />
                  {/* Arabic needs more size and no letter-spacing: tracking
                      breaks the cursive join and uppercase does nothing. */}
                  <span
                    className={`font-display font-semibold text-white/72 ${
                      locale === "ar"
                        ? "text-[13.5px]"
                        : "text-[10px] tracking-[0.14em] uppercase"
                    }`}
                  >
                    {t(doctor.countryName)}
                  </span>
                </div>
              ) : null}

              <FittedName id={titleId} name={titleName} dir={isArabicProfile ? "rtl" : undefined} />

              {doctor.showRole && doctor.displayRole ? (
                <p
                  className={`mt-2.5 font-display font-semibold text-crimson-100 ${
                    locale === "ar"
                      ? "text-[14px]"
                      : "text-[11px] tracking-[0.14em] uppercase"
                  }`}
                >
                  {t(doctor.displayRole)}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <div className="min-h-0 overflow-y-auto px-6 py-8 sm:px-9 sm:py-9">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-crimson-600" />
            <p className="font-display text-[10px] font-semibold tracking-[0.18em] text-ink-500 uppercase">
              {t("Biography")}
            </p>
          </div>

          {biography.length ? (
            <div className="mt-6 grid gap-4">
              {biography.map((paragraph, index) => (
                <p
                  key={`${doctor.id}-bio-${index}`}
                  dir={isArabicProfile ? "rtl" : undefined}
                  className="text-[14px] leading-7 text-ink-600"
                >
                  {isArabicProfile || isFrenchBio ? paragraph : t(paragraph)}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-[14px] leading-7 text-ink-500">
              {t("Professional biography coming soon.")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

/** Names shrink rather than wrap; below this they are allowed to wrap instead. */
const MIN_TITLE_FONT_SIZE = 19;

/**
 * Sets the name on one line, stepping the type down when a long credential
 * list would otherwise force a break. The starting size stays in CSS (a
 * viewport clamp), so this only ever shrinks from the design size.
 */
function FittedName({ id, name, dir }: { id: string; name: string; dir?: "rtl" }) {
  const nameRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const element = nameRef.current;
    const container = element?.parentElement;
    if (!element || !container) return;

    let cancelled = false;
    let lastWidth = -1;

    const fitName = (force = false) => {
      if (cancelled) return;

      const availableWidth = element.clientWidth;
      if (!availableWidth) return;
      // Width is the only input that matters, so ignore the height changes our
      // own font-size edits provoke in the observer.
      if (!force && availableWidth === lastWidth) return;
      lastWidth = availableWidth;

      // Back to the CSS clamp before measuring, so repeated passes are stable.
      element.style.fontSize = "";
      element.style.whiteSpace = "nowrap";

      const maxFontSize = Number.parseFloat(
        window.getComputedStyle(element).fontSize,
      );
      const requiredWidth = element.scrollWidth;
      if (!requiredWidth || requiredWidth <= availableWidth) return;

      const fittedSize = (maxFontSize * availableWidth) / requiredWidth - 0.25;
      if (fittedSize >= MIN_TITLE_FONT_SIZE) {
        element.style.fontSize = `${fittedSize}px`;
        return;
      }

      // Longer than one line can hold even at the floor — wrap it instead of
      // shrinking into illegibility.
      element.style.fontSize = `${MIN_TITLE_FONT_SIZE}px`;
      element.style.whiteSpace = "normal";
    };

    fitName(true);
    void document.fonts.ready.then(() => fitName(true));

    const resizeObserver = new ResizeObserver(() => fitName());
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, [name]);

  return (
    <h2
      ref={nameRef}
      id={id}
      dir={dir}
      className="mt-3.5 font-display text-[clamp(1.375rem,1rem+1.5vw,1.875rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-balance"
    >
      {name}
    </h2>
  );
}

function PortraitFrame({
  doctor,
  name,
}: {
  doctor: DoctorBiographyProfile;
  name: string;
}) {
  return (
    <DoctorAvatar
      imageSrc={doctor.imageSrc}
      name={name}
      imagePosition={doctor.imagePosition ?? "50% 24%"}
      sizes="160px"
      className="size-32 shrink-0 rounded-[1.5rem] ring-1 sm:size-40"
      fallbackClassName="bg-white/12 text-white ring-white/25"
      initialsClassName="font-display text-3xl font-semibold tracking-[-0.05em] sm:text-4xl"
    />
  );
}
