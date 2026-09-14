export type SpecialInterestGroup = {
  slug: string;
  abbreviation: string;
  name: string;
  logo: string;
};

export const specialInterestGroups: readonly SpecialInterestGroup[] = [
  {
    slug: "arab-adult-arthritis-awareness",
    abbreviation: "AAAA",
    name: "Arab Adult Arthritis Awareness Group",
    logo: "/images/special-interest-groups/aaaa.png",
  },
  {
    slug: "francophone",
    abbreviation: "AFG",
    name: "ArLAR Francophone Group",
    logo: "/images/special-interest-groups/francophone.jpg",
  },
  {
    slug: "musculoskeletal-sonography",
    abbreviation: "MSUS",
    name: "ArLAR Musculoskeletal Sonography Group",
    logo: "/images/special-interest-groups/musculoskeletal-sonography.png",
  },
  {
    slug: "pediatric-rheumatology",
    abbreviation: "PRAG",
    name: "Pediatric Rheumatologist Arab Group",
    logo: "/images/special-interest-groups/pediatric-rheumatology.png",
  },
  {
    slug: "research",
    abbreviation: "ARCH",
    name: "ArLAR Research Group",
    logo: "/images/special-interest-groups/arch.png",
  },
  {
    slug: "registry",
    abbreviation: "RArLAR",
    name: "Registry of ArLAR",
    logo: "/images/special-interest-groups/registry.jpg",
  },
  {
    slug: "arab-journal",
    abbreviation: "AJR",
    name: "Arab Journal of Rheumatology",
    logo: "/images/special-interest-groups/arab-journal.jpg",
  },
  {
    slug: "young-rheumatologists",
    abbreviation: "YRG",
    name: "Young Rheumatologist Group",
    logo: "/images/special-interest-groups/young-rheumatologists.jpeg",
  },
  {
    slug: "women-health-rheumatology",
    abbreviation: "WHrA",
    name: "Arab Women Health in Rheumatology Group",
    logo: "/images/special-interest-groups/women-health.jpg",
  },
] as const;
