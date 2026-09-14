import type { DoctorBiographyProfile } from "@/data/doctor-types";

export type SearchResultKind =
  | "page"
  | "news"
  | "group"
  | "webinar"
  | "resource"
  | "question"
  | "person";

export type SearchResult = {
  id: string;
  kind: SearchResultKind;
  title: string;
  description: string;
  href: string;
  image?: string;
  meta?: string;
  doctor?: DoctorBiographyProfile;
};
