import Image from "next/image";

const UNIFORM_FLAG_ASSETS: Record<string, string> = {
  "ae-united-arab-emirates.png": "uae.png",
  "dz-algeria.png": "algeria.png",
  "eg-egypt.png": "egypt.png",
  "iq-iraq.png": "iraq.png",
  "jo-jordan.png": "jordan.png",
  "kw-kuwait.png": "kuwait.png",
  "lb-lebanon.png": "lebanon.png",
  "ly-libya.png": "libya.png",
  "ma-morocco.png": "morocco.png",
  "om-oman.png": "oman.png",
  "ps-palestine.png": "palestine.png",
  "qa-qatar.png": "qatar.png",
  "qa-qatar.svg": "qatar.png",
  "sa-saudi-arabia.png": "ksa.png",
  "sd-sudan.png": "sudan.png",
  "sy-syria.webp": "syria.png",
  "tn-tunisia.png": "tunisia.png",
};

export function CountryFlag({
  filename,
  size = "card",
}: {
  filename: string;
  size?: "card" | "modal";
}) {
  const isCard = size === "card";
  const assetName = UNIFORM_FLAG_ASSETS[filename] ?? filename;
  const imageSrc = /^https?:\/\//i.test(assetName)
    ? assetName
    : `/flags/${assetName}`;

  // Flag assets are normalized to a 3:2 canvas with no transparent padding, so
  // the frame sits flush against the artwork instead of floating around it.
  return (
    <span
      className={`relative block aspect-[3/2] shrink-0 overflow-hidden rounded-[4px] border border-ink-200/80 ${
        isCard ? "w-[3.25rem]" : "w-8"
      }`}
    >
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes={isCard ? "52px" : "32px"}
        className="object-cover"
      />
    </span>
  );
}
