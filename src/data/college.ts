/**
 * ArLAR College content.
 *
 * Replays are transcribed from the live site. `upcomingSessions` is sample
 * scheduling data for layout purposes — replace it with the real programme
 * (or the CMS feed) before launch.
 */

export type CollegeSession = {
  title: string;
  date: string;
  time?: string;
  group: string;
  format: "Webinar" | "Course" | "Workshop" | "Case challenge";
};

export type CollegeReplay = {
  title: string;
  date: string;
  group: string;
  image: string;
  imageAlt: string;
};

export const upcomingSessions: CollegeSession[] = [
  {
    title: "Difficult-to-Treat Rheumatoid Arthritis: A Regional Case Panel",
    date: "Wednesday, 16 September 2026",
    time: "19:00 Mecca time",
    group: "ArLAR College",
    format: "Webinar",
  },
  {
    title: "Musculoskeletal Ultrasound: Shoulder and Knee Fundamentals",
    date: "Saturday, 3 October 2026",
    time: "10:00–14:00 Mecca time",
    group: "ArLAR Musculoskeletal Sonography Group (MSUS)",
    format: "Workshop",
  },
  {
    title: "YRG Case Challenge 3",
    date: "Thursday, 22 October 2026",
    group: "Young Rheumatologist Group (YRG)",
    format: "Case challenge",
  },
  {
    title: "Writing Your First Research Protocol",
    date: "Wednesday, 11 November 2026",
    time: "19:00 Mecca time",
    group: "ArLAR Research Group (ARCH)",
    format: "Course",
  },
];

export const collegeReplays: CollegeReplay[] = [
  {
    title: "ArLAR PulmoRheum Alliance: ILD and Pulmonary Vascular Disease",
    date: "Tuesday, 14 July 2026",
    group: "ArLAR College · PulmoRheum Alliance",
    image: "/images/webinar-pulmorheum-2026.jpeg",
    imageAlt:
      "Flyer for the ArLAR PulmoRheum Alliance webinar on ILD and pulmonary vascular disease",
  },
  {
    title: "Authorship Criteria in Research: Who Qualifies as an Author?",
    date: "Wednesday, 10 June 2026",
    group: "ArLAR College · ArLAR Research Group (ARCH)",
    image: "/images/webinar-authorship-2026.jpg",
    imageAlt:
      "Flyer for the ArLAR College and ARCH webinar on authorship criteria in research",
  },
  {
    title: "Latest Advances in CTD-ILD: Guidelines, Gaps and Future Directions",
    date: "Friday, 24 April 2026",
    group: "ArLAR College",
    image: "/images/webinar-ctd-ild-2026.jpg",
    imageAlt:
      "Flyer for the ArLAR College webinar on the latest advances in CTD-ILD",
  },
];
