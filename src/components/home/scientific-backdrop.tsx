type ScientificBackdropProps = {
  variant: "shortcuts" | "events";
};

const placements = {
  shortcuts: {
    molecule: "-left-16 top-20 w-72 sm:left-[3%] sm:w-80",
    orbit: "-right-24 top-6 size-64 sm:right-[4%] sm:size-72",
    dots: "bottom-8 right-[8%] h-28 w-44",
    cross: "bottom-20 left-[48%]",
    trail: "bottom-3 left-[12%] w-64",
  },
  events: {
    molecule: "-right-20 top-2 w-72 sm:right-[2%] sm:w-80",
    orbit: "-left-24 bottom-8 size-64 sm:left-[2%] sm:size-72",
    dots: "bottom-5 right-[3%] h-32 w-52",
    cross: "top-10 left-[17%]",
    trail: "top-5 right-[30%] w-56",
  },
} as const;

export function ScientificBackdrop({
  variant,
}: ScientificBackdropProps) {
  const position = placements[variant];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        className={`animate-science-drift absolute opacity-55 motion-reduce:animate-none ${position.molecule}`}
      >
        <svg
          viewBox="0 0 320 190"
          fill="none"
          className="h-auto w-full"
        >
          <path
            d="M26 116 78 78l52 20 52-47 54 27 54-39"
            stroke="#00953b"
            strokeOpacity=".17"
            strokeWidth="1.5"
          />
          <path
            d="m78 78 9-55m43 75 13 62m39-109 18-34m36 61 26 73"
            stroke="#c10230"
            strokeOpacity=".13"
            strokeWidth="1.5"
          />
          <path
            d="m113 77 17-29 34 1 17 30-17 29h-34l-17-31Z"
            stroke="#66748f"
            strokeOpacity=".12"
            strokeWidth="1.5"
          />
          <g fill="#f7fafb" strokeWidth="2">
            <circle cx="26" cy="116" r="6" stroke="#c10230" strokeOpacity=".2" />
            <circle cx="78" cy="78" r="8" stroke="#00953b" strokeOpacity=".22" />
            <circle cx="130" cy="98" r="5" stroke="#66748f" strokeOpacity=".18" />
            <circle cx="182" cy="51" r="7" stroke="#c10230" strokeOpacity=".18" />
            <circle cx="236" cy="78" r="5" stroke="#00953b" strokeOpacity=".22" />
            <circle cx="290" cy="39" r="8" stroke="#66748f" strokeOpacity=".16" />
            <circle cx="87" cy="23" r="4" stroke="#c10230" strokeOpacity=".18" />
            <circle cx="143" cy="160" r="5" stroke="#00953b" strokeOpacity=".2" />
            <circle cx="200" cy="17" r="4" stroke="#66748f" strokeOpacity=".16" />
            <circle cx="262" cy="151" r="6" stroke="#c10230" strokeOpacity=".16" />
          </g>
        </svg>
      </div>

      <div
        className={`animate-science-orbit absolute rounded-full border border-jade-200/55 motion-reduce:animate-none ${position.orbit}`}
      >
        <span className="absolute inset-[18%] rounded-full border border-ink-200/55" />
        <span className="absolute inset-[38%] rounded-full border border-crimson-200/60" />
        <span className="absolute left-[11%] top-[22%] size-2 rounded-full bg-crimson-300/70" />
        <span className="absolute bottom-[13%] right-[29%] size-2.5 rounded-full bg-jade-300/75" />
        <span className="absolute right-[5%] top-1/2 size-1.5 rounded-full bg-ink-300/75" />
      </div>

      <div
        className={`absolute opacity-70 ${position.dots}`}
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(102,116,143,.18) 1.2px, transparent 1.2px)",
          backgroundSize: "15px 15px",
          maskImage:
            "linear-gradient(135deg, transparent 5%, black 45%, transparent 95%)",
        }}
      />

      <div
        className={`animate-science-pulse absolute size-9 motion-reduce:animate-none ${position.cross}`}
      >
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-jade-300/55" />
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-crimson-300/55" />
        <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white ring-1 ring-ink-200" />
      </div>

      <div className={`absolute h-12 ${position.trail}`}>
        <svg viewBox="0 0 260 48" fill="none" className="h-full w-full">
          <path
            d="M1 29c23 0 27-17 49-17s26 24 48 24 27-26 49-26 27 20 49 20 26-15 63-15"
            stroke="#00953b"
            strokeOpacity=".12"
            strokeWidth="1.5"
          />
          <path
            d="M1 35c23 0 27-17 49-17s26 24 48 24 27-26 49-26 27 20 49 20 26-15 63-15"
            stroke="#c10230"
            strokeOpacity=".1"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
}
