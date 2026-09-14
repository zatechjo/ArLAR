import Image from "next/image";

import { getDoctorInitials } from "@/lib/doctor-name";
import { isCutoutPortrait, isMissingPortrait } from "@/lib/portrait-fit";

type DoctorAvatarProps = {
  imageSrc?: string | null;
  name: string;
  className: string;
  imagePosition?: string;
  sizes?: string;
  alt?: string;
  fallbackClassName?: string;
  initialsClassName?: string;
  imageClassName?: string;
};

/** Shared doctor portrait that turns the stock placeholder into an initials avatar. */
export function DoctorAvatar({
  imageSrc,
  name,
  className,
  imagePosition,
  sizes = "144px",
  alt = name,
  fallbackClassName = "bg-[#071421] text-white",
  initialsClassName = "font-display text-3xl font-semibold tracking-[-0.05em]",
  imageClassName = "",
}: DoctorAvatarProps) {
  const missing = isMissingPortrait(imageSrc);
  const isCutout = !missing && isCutoutPortrait(imageSrc ?? "");

  return (
    <div
      className={`relative overflow-hidden ${className} ${missing ? fallbackClassName : ""}`}
      {...(missing ? { role: "img", "aria-label": name } : {})}
    >
      {missing ? (
        <span aria-hidden className={`grid size-full place-items-center ${initialsClassName}`}>
          {getDoctorInitials(name)}
        </span>
      ) : (
        <Image
          src={imageSrc!}
          alt={alt}
          fill
          sizes={sizes}
          style={isCutout ? undefined : { objectPosition: imagePosition ?? "50% 30%" }}
          className={`${isCutout ? "object-contain p-1.5" : "object-cover"} ${imageClassName}`}
        />
      )}
    </div>
  );
}
