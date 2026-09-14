export type DoctorAppearance = {
  id: string;
  pageId: string;
  pageTitle: string;
  path: string;
  section: string;
  role: string;
  /** One-based position within this page section. Older records fall back to directory order. */
  sortOrder?: number;
  /** Prevents incomplete/test ordering data from changing an established public roster. */
  sortOrderVersion?: 1;
};

export type DoctorRecord = {
  id: string;
  slug: string;
  name: string;
  credentials: string;
  fullName: string;
  country: string;
  countryCode: string;
  flagFilename: string;
  biography: string[];
  /** Arabic display name, as published on arab-rheumatology.org. */
  nameAr?: string;
  /** Arabic biography, one entry per line as it appears on the Arabic site. */
  biographyAr?: string[];
  /** French display name. Usually empty: the French site uses the same Latin
   * spelling, so this is only for genuinely different renderings. */
  nameFr?: string;
  /** French biography, one entry per line as on arab--rheumatology.org. */
  biographyFr?: string[];
  image: string;
  imagePosition?: string;
  aliases: string[];
  /** Original source names retained for data export and auditing. */
  sourceFullNames: string[];
  availableOn: string[];
  appearances: DoctorAppearance[];
};

export type DoctorBiographyProfile = {
  id: string;
  fullName: string;
  nameAr?: string;
  nameFr?: string;
  /** Full credential list, e.g. "MD, PhD, FRCP". Shown only in the dialog. */
  credentials?: string;
  displayRole: string;
  /**
   * Whether the role is a real leadership title worth showing. Everyone in the
   * source data carries a `displayRole`, including generic ones like
   * "Scientific Committee Member", so the dialog follows the same rule the
   * cards use and only shows it for leadership.
   */
  showRole?: boolean;
  countryName: string;
  flagFilename: string;
  bio: string[];
  biographyAr?: string[];
  biographyFr?: string[];
  imageSrc: string;
  imagePosition?: string;
};
