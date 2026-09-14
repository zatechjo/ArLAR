import type { DoctorAppearance } from "@/data/doctor-types";

export type SigPerson = {
  doctorId?: string;
  name: string;
  /** Arabic name, carried from the unified doctor record. */
  nameAr?: string;
  nameFr?: string;
  credentials?: string;
  role?: string;
  country: string;
  bio?: string[];
  /** Arabic biography, carried from the unified doctor record. */
  biographyAr?: string[];
  biographyFr?: string[];
  /** Portrait URL; SIG records may temporarily use the original Wix CDN until Cloudflare migration. */
  image?: string;
  imagePosition?: string;
  appearances?: DoctorAppearance[];
};

export type SigReplay = {
  title: string;
  date: string;
  href: string;
};

export type SigSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type SigResource = {
  title: string;
  description?: string;
  /** ISO year-month or full date used for sorting and display. */
  date?: string;
  href: string;
  action: string;
};

export type SigGalleryItem = {
  title: string;
  image: string;
};

export type SigCase = {
  title: string;
  prompt: string[];
  answer: string;
  treatment?: string[];
  learningPoints?: string[];
  images: string[];
};

export type SigTab =
  | { id: string; label: string; kind: "sections"; sections: SigSection[] }
  | { id: string; label: string; kind: "people"; people: SigPerson[] }
  | { id: string; label: string; kind: "network"; members: { name: string; country: string }[] }
  | { id: string; label: string; kind: "replays"; replays: SigReplay[]; intro?: string }
  | { id: string; label: string; kind: "resources"; resources: SigResource[] }
  | { id: string; label: string; kind: "gallery"; items: SigGalleryItem[] }
  | { id: string; label: string; kind: "cases"; cases: SigCase[] };

export type SigProfile = {
  slug: string;
  abbreviation: string;
  name: string;
  description: string;
  logo: string;
  sourceUrl: string;
  intro?: string[];
  video?: string;
  document?: SigResource;
  tabs: SigTab[];
};

const francophonePeople: SigPerson[] = [
  { name: "Hela Sahli", credentials: "MD", role: "Secrétaire générale", country: "Tunisia", image: "/images/sig-members/1f2182_62e96867c2b940c88cb4b13b4e5db7c6~mv2.jpg" },
  { name: "Manal El Rakaawi", credentials: "MD", country: "Algeria", image: "/images/board/manal-el-rakaawi.jpg" },
  { name: "Basel Masri", credentials: "MD", country: "Jordan", image: "/images/board/basel-masri.jpg" },
  { name: "Nelly Ziadé", credentials: "MD", country: "Lebanon", image: "/images/board/nelly-ziade-zoghbi.jpg" },
  { name: "Ihsane Hmamouchi", credentials: "MD", country: "Morocco", image: "/images/aaaa-group/members/ihsane-hmamouchi.jpg" },
  { name: "Majda Khoury", credentials: "MD", country: "Syria", image: "/images/sig-members/7cc206_6bb2668d6c8c4e90b0929bd969b69a98~mv2.jpg" },
];

const francophoneReplays: SigReplay[] = [
  ["Le Point Rhumato 4ème Webinaire", "Thursday, September 12, 2024", "https://www.youtube.com/playlist?list=PLhkzE1M8cmO53K-is4MAA2ujoRz7ettYi"],
  ["La Médecine de Précision en Rhumatologie: Comment l'IA et les Biosimilaires Peuvent Transformer la Pratique", "Tuesday, November 28, 2023", "https://www.youtube.com/playlist?list=PLhkzE1M8cmO6lWzySmiG_i2E0GC1AI-V8"],
  ["Les Arthrites Juvéniles Idiopathiques", "Tuesday, October 17, 2023", "https://www.youtube.com/playlist?list=PLhkzE1M8cmO67d0ANpqlC1x095skliZlG"],
  ["Les Manifestations Extra Articulaires des Spondyloarthrites: Interface Rhumato, Dermato, Gastro et Ophtalmo.", "Tuesday, September 5, 2023", "https://youtube.com/playlist?list=PLhkzE1M8cmO5KkI8CNvnLRiaL1Hvn18fc"],
  ["Coeur et Rhumatismes Inflammatoires Chroniques", "Tuesday, June 20, 2023", "https://www.youtube.com/playlist?list=PLhkzE1M8cmO6TimJVBMMChwvEaa4aiJew"],
  ["Approche Holistique dans la Prise en Charge des Rhumatismes Inflammatoires Chroniques", "Tuesday, April 25, 2023", "https://youtube.com/playlist?list=PLhkzE1M8cmO7HEO7Bupiscnh9weLTjout"],
  ["Rhumatisme Psoriasique", "Tuesday, December 20, 2022", "https://youtube.com/playlist?list=PLhkzE1M8cmO5Gtk77ZKf4U5EYigz6JwIE"],
  ["Actualités sur la Polyarthrite Rhumatoide (2eme Partie)", "Wednesday, November 23, 2022", "https://youtube.com/playlist?list=PLhkzE1M8cmO53vmGgbTxb4WKsC3lXSXlx"],
  ["Actualités sur la Polyarthrite Rhumatoide (1eme Partie)", "Wednesday, October 26, 2022", "https://youtube.com/playlist?list=PLhkzE1M8cmO45bBQKB-bBF0RRsagyILoh"],
  ["Rhumatisme Psoriasique", "Wednesday, September 21, 2022", "https://youtube.com/playlist?list=PLhkzE1M8cmO6_4myC-zZPwzIQ3Al-5SvI"],
  ["Imagerie Du Rachis", "Monday, February 28, 2022", "https://youtube.com/playlist?list=PLhkzE1M8cmO7onUKKO1SR11eN_2XDOJcW"],
  ["Osteoporose", "Saturday, July 17, 2021", "https://youtube.com/playlist?list=PLhkzE1M8cmO5FiHNN8OKi2zU0sSIM2oxd"],
].map(([title, date, href]) => ({ title, date, href }));

const msusPeople: SigPerson[] = [
  { name: "Waleed AlShehhi", credentials: "MD", role: "President · Secretary General of ArLAR", country: "United Arab Emirates", image: "/images/sig-members/1f2182_01eb615c823e4694b5b1b7217c4fa268~mv2.jpg" },
  { name: "Ahmed Abogamal", credentials: "MD, PhD", role: "Scientific Director", country: "United Arab Emirates", image: "/images/sig-members/1f2182_f7f18bc07b4a43e1b8ef96d16f1de404~mv2.png" },
  { name: "Ghita Harifi", credentials: "MD", role: "Co-Scientific Director", country: "United Arab Emirates", image: "/images/sig-members/1f2182_7168218188714bfebcbc9d5c17cf53f3~mv2.jpg" },
  { name: "Basant Elnady", credentials: "MD", role: "Board Member", country: "Egypt", image: "/images/sig-members/1f2182_cd3925fb0b16455a9410768c3a46fc2e~mv2.jpg" },
  { name: "Hala Fayed", credentials: "MD", role: "Board Member", country: "Egypt", image: "/images/sig-members/1f2182_8d0f05a8d08f40d8ba03a3e1b70a381d~mv2.jpg" },
  { name: "Izzat Khangar", credentials: "MD", role: "Board Member", country: "Qatar", image: "/images/sig-members/1f2182_4d8c1faddf7a4a9f9ffe87fa42959751~mv2.jpg" },
  { name: "Kawther Ben Abdelghani", credentials: "MD", role: "Board Member", country: "Tunisia", image: "/images/college-members/kawther-ben-abdelghani.jpg" },
  { name: "Mohamed Mortada", credentials: "MD", role: "Board Member", country: "Egypt", image: "/images/sig-members/1f2182_c5ac72efb35a46258821a355234ddeb3~mv2.jpg" },
  { name: "Nora Alosaimi", credentials: "MD", role: "Board Member", country: "Saudi Arabia" },
  { name: "Nouran Abaza", credentials: "MD, PhD", role: "Board Member", country: "Egypt", image: "/images/sig-members/1f2182_dd858248959a43afbc2037925e74e535~mv2.jpg" },
  { name: "Rachid Bahiri", credentials: "MD", role: "Board Member", country: "Morocco", image: "/images/sig-members/7cc206_a42e41c8aa4b45868eda3c0c80fead91~mv2.jpg" },
  { name: "Radwa Alkholy", credentials: "MD", role: "Board Member", country: "Egypt", image: "/images/sig-members/1f2182_9edb29c8d0d34997a92fb6b5184aeb22~mv2.jpg" },
  { name: "Samy Slimani", credentials: "MD", role: "Board Member", country: "Algeria", image: "/images/college-members/samy-slimani.jpg" },
];

const pediatricSteering: SigPerson[] = [
  { name: "Sulaiman Al Mayouf", credentials: "MD", role: "Founder and member of the PRAG Steering Committee", country: "Saudi Arabia", image: "/images/college-members/sulaiman-al-mayouf.jpeg", bio: ["Professor and Consultant of Pediatric Rheumatology, King Faisal Specialist Hospital & Research Center", "College of Medicine, Alfaisal University, Riyadh"] },
  { name: "Reem Abdwani", credentials: "MD", country: "Oman", image: "/images/sig-members/1f2182_9889dbe42bcb4a44b51be6a02d91a8b8~mv2.jpg" },
  { name: "Mohammed Muzaffer", credentials: "MD", country: "Saudi Arabia", image: "/images/sig-members/1f2182_6f12ebc91b20412ca233d670b489ce43~mv2.jpg", bio: ["Associate Professor in Pediatric Rheumatology, KAU College of Medicine, Jeddah", "Member of SSR; advisory board member for AbbVie, Sobi, and Bristol Myers Squibb"] },
  { name: "Adel Al Wahadenah", credentials: "MD", country: "Jordan", image: "/images/sig-members/1f2182_5147e035712f4b02a8a7cc51b1a3091d~mv2.webp" },
  { name: "Wafaa Al Suwairi", credentials: "MD", country: "Saudi Arabia", image: "/images/sig-members/7cc206_4292ecf01d364c00b8ccbef9104bd9c3~mv2.jpg", bio: ["Pediatric rheumatology consultant, King Abdullah Specialized Children Hospital, National Guard Health Affairs", "Assistant Professor in Pediatrics and Associate Dean, College of Medicine, King Saud Bin Abdulaziz University for Health Sciences", "Fellow of the Royal College of Physicians, London", "Co-founder and deputy chair of the Charitable Association for Rheumatology", "Member of PReS and PRINTO"] },
];

const pediatricExecutive: SigPerson[] = [
  { name: "Djohra Hadef", credentials: "MD", role: "President of PRAG", country: "Algeria", image: "/images/sig-members/1f2182_2e9773c4aad34cbaa0f96a4f0ee0db5d~mv2.jpg", bio: ["Associate Professor of Pediatrics, Faculty of Medicine, University of Batna 2", "Head of Pediatrics, University Hospital Center of Batna", "Pediatric rheumatologist, Paris-Descartes University", "Vice President of PAFLAR", "Member of the pediatric global musculoskeletal task force"] },
  { name: "Muna Al Mutairi", credentials: "MD", country: "Kuwait", image: "/images/scientific-committee/muna-almutairi.jpg", bio: ["Consultant of Pediatric Rheumatology, Al Adan Hospital, State of Kuwait"] },
  { name: "Abdullah Al Jaser", credentials: "MD", country: "Saudi Arabia", image: "/images/sig-members/1f2182_6e42aaa482cf4b469ef371e88fbf4e9d~mv2.png" },
  { name: "Ashwaq Al E’ed", credentials: "MD", country: "Saudi Arabia", bio: ["Associate Professor and Consultant of Pediatric Rheumatology, Department of Pediatrics, College of Medicine, Qassim University", "Vice Dean of Academic Affairs, Unaizah College of Medicine and Medical Sciences, Qassim University"] },
  { name: "Buthaina Al Adba", credentials: "MD", country: "Qatar", image: "/images/sig-members/1f2182_dab9267e392e49519aa52068d437d466~mv2.jpg", bio: ["Pediatric rheumatologist at Sidra Medicine in Doha", "Arab Board certified in general pediatrics (CABP)"] },
  { name: "Soah Hashad", credentials: "MD", country: "Libya", image: "/images/board/soad-hashad.png", bio: ["Pediatrics consultant and Head of the Pediatric Rheumatology Clinic, Tripoli Children Hospital", "Associate Professor, Tripoli University", "National coordinator of PRINTO in Libya", "Head of the Scientific Committee, Libyan Rheumatology Society", "Research coordinator and residency-program coordinator, Libyan Medical Council of Specialty"] },
  { name: "Motasem Alsuweiti", credentials: "MD", country: "Jordan", image: "/images/sig-members/1f2182_42305243c1754ecd8f6406c4af728119~mv2.jpg", bio: ["Pediatric Immunology, Allergy and Rheumatology Specialist, Queen Rania Children Hospital, King Hussein Medical Center, Amman"] },
  { name: "Najla Aljaberi", credentials: "MD", country: "United Arab Emirates", image: "/images/sig-members/1f2182_021e3805b16b4aab9b967cf8e236cfe2~mv2.jpg", bio: ["Pediatric rheumatologist and Assistant Professor of Pediatrics, College of Medicine, UAE University"] },
  { name: "Hala M Lotfy Maarouf", credentials: "MD", country: "Egypt", image: "/images/sig-members/1f2182_c95297e5aacf4e3d988771f975d9b9a4~mv2.jpg", bio: ["Professor of Pediatrics and Pediatric Rheumatology, Cairo University"] },
];

const pediatricReplays: SigReplay[] = [
  ["Challenges in Early Referral of Patients with Juvenile Idiopathic Arthritis", "Wednesday, February 21, 2024", "https://youtu.be/sPLxwu7v0wY"],
  ["AID — Let's Start from the Beginning", "Tuesday, July 4, 2023", "https://www.youtube.com/playlist?list=PLhkzE1M8cmO6XWrRVF6CgVoO-eqKxZjDN"],
  ["Childhood Inflammatory Myopathies: Case-Based Presentation", "Wednesday, October 19, 2022", "https://youtube.com/playlist?list=PLhkzE1M8cmO7euptonfKWnYggsNK1TzGC"],
  ["Variants of Autoinflammatory Diseases", "Wednesday, May 25, 2022", "https://youtube.com/playlist?list=PLhkzE1M8cmO77dFt2uyJhzH2q_ULxD_eL"],
  ["Adolescents with Rheumatic Diseases: Issues to Consider", "Wednesday, March 17, 2021", "https://youtube.com/playlist?list=PLhkzE1M8cmO7e-2NisQvJnpJmgQEjtRjv"],
  ["Children with Rheumatic Diseases in COVID Pandemic Era", "Wednesday, October 6, 2021", "https://youtube.com/playlist?list=PLhkzE1M8cmO7Jxpo0rXljqLrXmjj1a1SO"],
  ["Treatment Updates in Juvenile Idiopathic Arthritis (JIA)", "Monday, November 29, 2021", "https://youtube.com/playlist?list=PLhkzE1M8cmO6PmcjLG95exUaF0B5pnyrw"],
].map(([title, date, href]) => ({ title, date, href }));

export const sigProfiles: SigProfile[] = [
  {
    slug: "francophone",
    abbreviation: "ArFG",
    name: "ArLAR Francophone Group",
    description: "Connecting francophone rheumatologists across the Arab region through communication, education, and collaborative research.",
    logo: "/images/special-interest-groups/francophone.jpg",
    sourceUrl: "https://www.arabrheumatology.org/arlar-francophone-group",
    intro: ["The ArLAR Francophone Group is an autonomous group working under the umbrella of ArLAR, in keeping with Article 7 of the basic regulations of the Special Interest Groups of ArLAR.", "The group was created on 10 December 2018 and validated by the ArLAR Board of Directors."],
    tabs: [
      { id: "overview", label: "Overview", kind: "sections", sections: [
        { title: "Who are the members of ArFG?", paragraphs: ["Partially or totally francophone Arab countries are represented at ArFG: Algeria, Lebanon, Morocco, Syria, and Tunisia.", "ArFG is also open to francophone rheumatologists practicing in non-francophone Arab countries.", "The steering committee was elected in Paris on 9 December 2019 for a three-year term (2019–2022)."] },
        { title: "Missions", items: ["Inform members about scientific events in the countries of the Francophone Group.", "Communicate scientific information to francophone rheumatologists.", "Communicate scientific information to the general francophone public.", "Promote collaborative research projects between francophone Arab countries."] },
        { title: "How ArFG works", items: ["Use the ArLAR website platform.", "Use other ArLAR platforms, particularly social media.", "Organize regular meetings alongside ArLAR meetings and other scientific congresses.", "Plan Francophone Scientific Days in member countries every two years, at some distance from the ArLAR Congress.", "Initiate and coordinate collaborative research projects between francophone Arab countries in collaboration with the ArLAR Scientific Committee."] },
      ] },
      { id: "committee", label: "Steering Committee", kind: "people", people: francophonePeople },
      { id: "activities", label: "Activities", kind: "replays", replays: francophoneReplays },
    ],
  },
  {
    slug: "musculoskeletal-sonography",
    abbreviation: "MSUS",
    name: "ArLAR Musculoskeletal Sonography Group",
    description: "Advancing musculoskeletal ultrasound teaching, standards, accreditation, and research across the Arab region.",
    logo: "/images/special-interest-groups/musculoskeletal-sonography.png",
    sourceUrl: "https://www.arabrheumatology.org/arlar-mssg",
    tabs: [
      { id: "overview", label: "Overview", kind: "sections", sections: [
        { title: "Aim", paragraphs: ["Establish an Arabic MSUS-accredited body under ArLAR as a platform for cooperation among Arab MSUS experts, and enhance MSUS teaching and accreditation for rheumatologists in the region to an international level."] },
        { title: "Objectives", items: ["Spread MSUS skills among rheumatologists in the region.", "Facilitate the training of fellows and trainees within the Arab region.", "Standardize MSUS practice in the Arab region according to international guidelines.", "Establish an accredited ArLAR-MSUS certification programme for rheumatologists in the region.", "Conduct regional MSUS-related research projects."] },
        { title: "Plan", items: ["Provide regular accredited MSUS courses in the region, progressing from basic to intermediate and advanced levels.", "Collaborate with international MSUS bodies such as EULAR and ACR to implement their guidelines and accreditation standards.", "Participate with Arab Journal of Rheumatology editors to publish regular articles related to MSUS practice and research."] },
      ] },
      { id: "board", label: "Group Board", kind: "people", people: msusPeople },
      { id: "activities", label: "Activities", kind: "replays", replays: [{ title: "Basic MSUS Assessment for the Upper Limb", date: "Monday, December 20, 2021", href: "https://youtube.com/playlist?list=PLhkzE1M8cmO72Dz7kM_hD2E3_cKFmYDRY" }] },
    ],
  },
  {
    slug: "pediatric-rheumatology",
    abbreviation: "PRAG",
    name: "Pediatric Rheumatologist Arab Group",
    description: "Promoting excellence in pediatric rheumatology care, research, education, and regional collaboration.",
    logo: "/images/special-interest-groups/pediatric-rheumatology.png",
    sourceUrl: "https://www.arabrheumatology.org/pediatric-rheumatologist-arab-group",
    intro: ["Pediatric Rheumatology of Arab Group (PRAG) was established and officially recognized in 2016 as a Special Interest Group of ArLAR."],
    tabs: [
      { id: "overview", label: "Overview", kind: "sections", sections: [
        { title: "Vision", paragraphs: ["To be internationally recognized as a professional body representing Arab pediatric rheumatologists."] },
        { title: "Mission", items: ["Promote excellence in pediatric rheumatology clinical care and research through collaborative work among PRAG members.", "Foster scientific partnership and collaboration with international pediatric rheumatology associations and networks.", "Facilitate translation of research advances into daily clinical care and adoption of best practices and guidelines.", "Support regional education and training in pediatric rheumatology.", "Empower patients and their families by addressing their needs to governing bodies."] },
        { title: "PRAG membership", paragraphs: ["All certified pediatric rheumatologists from Arab countries are welcome to become members of PRAG.", "The steering committee members are the founders of PRAG. The executive committee is nominated from different Arab countries and develops webinars, symposia, scientific workshops, and research activities during each elected term."] },
        { title: "Previous PRAG meetings", items: ["PRAG 1 — Jeddah, Saudi Arabia, February 2016; Chair: Dr Wafaa Al Suwairi.", "PRAG 2 — Amman, Jordan, July 2017; Chair: Dr Adel Al Wahadenah.", "PRAG 3 — Muscat, Oman, February 2018; Chair: Dr Reem Abdwani.", "PRAG 4 — Luxor, Egypt, April 2019; Chair: Dr Samia Salah.", "PRAG 5 — Online webinar series during the COVID-19 pandemic, UAE; Chair: Dr Al Sadeq Sharif.", "PRAG 6 — Kuwait, February 2023; Chair: Dr Muna Al Mutairi.", "PRAG 7 — Algeria, February 2025; Chair: Dr Djohra Hadef."] },
        { title: "Activities, 2021–2023", items: ["Delivered a pandemic-era webinar series with Dr Sherif Alsadeq covering adolescents with rheumatic diseases, COVID-19, JIA treatment updates, autoinflammatory diseases, and childhood inflammatory myopathies.", "Established and updated the PRAG website through ArLAR.", "Revised the PRAG vision and mission.", "Arranged the PRAG scientific programme for ArLAR Kuwait 2023.", "The ArLAR Kuwait 2023 programme ran from 2–4 March and included 2 Meet the Expert sessions, 20 lectures, 6 oral abstracts, 5 case challenges, 2 francophone sessions, and 8 posters."] },
      ] },
      { id: "steering", label: "Steering Committee", kind: "people", people: pediatricSteering },
      { id: "executive", label: "Executive Committee", kind: "people", people: pediatricExecutive },
      { id: "webinars", label: "Past Webinars", kind: "replays", intro: "PRAG organizes regular 30–45 minute webinars and multi-session short courses under the purview of its board.", replays: pediatricReplays },
    ],
  },
];

const archPeople: SigPerson[] = [
  { name: "Nelly Ziade Zoghbi", credentials: "MD, PhD, FRCP", role: "ARCH President", country: "Lebanon", image: "/images/board/nelly-ziade-zoghbi.jpg", bio: ["Consultant Rheumatologist", "Assistant Professor of Rheumatology, Public Health and Epidemiology, Hôtel-Dieu de France Hospital and Saint-Joseph University, Beirut"] },
  { name: "Fatemah Abutiban", credentials: "MD", country: "Kuwait", image: "/images/aaaa-group/members/fatemah-abutiban.jpg", bio: ["President of ArLAR", "Consultant of medicine and rheumatology at Jaber Alahmed Hospital, Shiekhan Alfaresi Rheumatology Centre, and Kuwait Oil Company", "President of the Kuwait Association of Rheumatology and Treasurer of the Kuwait Osteoporosis Society"] },
  { name: "Basel Masri", credentials: "MD", country: "Jordan", image: "/images/board/basel-masri.jpg", bio: ["Immediate-Past President of ArLAR", "Senior Consultant Rheumatologist, Jordan Hospital & Medical Center, Amman", "President of the Jordanian Society of Rheumatology"] },
  { name: "Manal El Rakawi", credentials: "MD, PhD", country: "Algeria", image: "/images/board/manal-el-rakaawi.jpg", bio: ["Professor of Rheumatology, Douera Algiers University Hospital Center / Saad Dahlab Blida Unit", "Coordinator of the Pain Section, Algerian Society of Rheumatology", "Member of the Pan Arab Osteoporosis Society and Algerian Menopause Society", "Secretary General of the ArLAR Francophone Group and member of AAAA", "ArLAR President-Elect 2023–2025"] },
  { name: "Nizar AbdulLateef Jasim", credentials: "MD", country: "Iraq", image: "/images/scientific-committee/nizar-abdullateef-jasim.jpg", bio: ["Chairman of the Scientific Committee", "Senior Consultant Rheumatologist and Professor of Medicine, University of Baghdad College of Medicine", "President of the Iraqi League for Bone and Joint Health", "President of the Pan-Arab Osteoporosis Society"] },
  { name: "Lina El Kibbi", credentials: "MD", country: "Saudi Arabia", image: "/images/aaaa-group/members/lina-el-kibbi.jpg", bio: ["Assistant Professor of Rheumatology, Alfaisal University", "Rheumatology Consultant and Director of Medical Academic Affairs", "Designated Institutional Official / Saudi Board Residency Program and Program Director of Internship, Alfaisal University, Specialized Medical Center, Riyadh", "Founder of AAAA and ex-officio member of ARCH"] },
  { name: "Chafika Haouichet", credentials: "MD", country: "Algeria", image: "/images/sig-members/1f2182_47010230dbc14c668a4ffc7fd1338af8~mv2.jpg", bio: ["Professor at Saad Dahlab University of Medicine, Blida", "Head of Rheumatology, Djillali Bounaama Hospital, Douera", "Member of the local ethics committee and Ministry of Pharmaceutical Industry clinical experts committee", "General Secretary of the Algerian Society of Rheumatology"] },
  { name: "Walaa Abdelrahman", credentials: "MD", country: "Egypt", image: "/images/sig-members/1f2182_e80b9a1479f5454ca24726e1bf50a2ad~mv2.jpg", bio: ["Consultant and Lecturer of Rheumatology and Clinical Immunology, Kasr Al Ainy Faculty of Medicine, Cairo University", "Organizer at the Egyptian Society of Rheumatic Diseases"] },
  { name: "Faiq Isho Gorial", credentials: "MD", country: "Iraq", image: "/images/sig-members/1f2182_7fd30fc435254436be922587c04ca615~mv2.jpg", bio: ["Professor and Consultant Rheumatologist, College of Medicine, University of Baghdad"] },
  { name: "Manal Al Mashaleh", credentials: "MD", country: "Jordan", image: "/images/sig-members/1f2182_f0b039884e114809b3ac00cc17b4a9ef~mv2.jpg", bio: ["Consultant Rheumatologist, JBM, JBR", "Head of Rheumatology, Internal Medicine, King Hussein Medical Center, Royal Medical Services"] },
  { name: "Fatemah Baroun", credentials: "MD, MBBCh, MRCP (UK), KBIM, RCPI Rheumatology Fellowship", country: "Kuwait", image: "/images/board/fatemah-baroun.jpg", bio: ["Specialist in adult rheumatology and internal medicine at Jahra Hospital, Kuwait"] },
  { name: "Soad Hashad", credentials: "MD", country: "Libya", image: "/images/board/soad-hashad.png", bio: ["Pediatrics consultant and Head of the Pediatric Rheumatology Clinic, Tripoli Children Hospital", "Associate Professor, Tripoli University", "National coordinator of PRINTO in Libya", "Head of the Scientific Committee, Libyan Rheumatology Society", "Research and residency-program coordinator, Libyan Medical Council of Specialty"] },
  { name: "Ihsane Hmamouchi", credentials: "MD, PhD", country: "Morocco", image: "/images/aaaa-group/members/ihsane-hmamouchi.jpg", bio: ["Rheumatologist, Biostatistician and Clinical Epidemiologist, Centre Hospitalier Provincial Skhirat-Temara and Laboratory of Epidemiology and Clinical Research, Faculty of Medicine", "Board member of the Moroccan and French rheumatology societies", "Member of the AFLAR Executive Committee"] },
  { name: "Batool Al Lawati", credentials: "MB ChB, DM, FRCP", country: "Oman", image: "/images/sig-members/1f2182_ba473585ea6247ca8320882d7b8a4886~mv2.jpg", bio: ["Senior Consultant and Associate Professor of Rheumatology and Medicine, Sultan Qaboos University College of Medicine and Health Sciences", "Rheumatology training at Queen's Medical Centre and Nottingham City Hospital", "Member of the College Examination Committee, Chair of its Written Paper Group, and Coordinator of Final MD Exams"] },
  { name: "Saed Atawnah", credentials: "MD", country: "Palestine", image: "/images/sig-members/1f2182_71409a490d5d421294c8d93397f9bef3~mv2.jpg", bio: ["Internist, rheumatologist and Assistant Professor of Medicine, Al-Quds University", "Program Director of Internal Medicine Residency, Al-Ahli Hospital, Hebron"] },
  { name: "Samar Al Emadi", credentials: "MD, PhD, FACR, ABIM, FRCPC, EMBA", country: "Qatar", image: "/images/aaaa-group/members/samar-al-emadi.jpg", bio: ["Senior Consultant and Division Chief of Rheumatology, and Program Director of the Rheumatology Fellowship, Hamad Medical Corporation", "President of the Qatar Rheumatology Association and Qatar Osteoporosis Society", "Assistant Professor, Weill Cornell Medical College in Qatar"] },
  { name: "Hanan Al-Rayes", credentials: "MD", country: "Saudi Arabia", image: "/images/scientific-committee/hanan-al-rayes.jpg", bio: ["Consultant Rheumatologist, Lupus subspecialty", "Associate Professor, King Faisal University College of Medicine", "President of the Saudi Society for Rheumatology"] },
  { name: "Suad Abd Ellateif Eltaybe Mohammed", credentials: "MD", country: "Sudan", image: "/images/sig-members/1f2182_665662bc99634133b459fb88df7004ee~mv2.jpg", bio: ["Consultant Physician and Rheumatologist, Almoalem Medical City", "Director of the Rheumatology Fellowship Training Program, Sudan Medical Specialization Board"] },
  { name: "Salwa Alcheikh", credentials: "MD", country: "Syria", image: "/images/sig-members/1f2182_6871e4a500f145a0b6c7e7579f8b05da~mv2.jpg", bio: ["Professor of Medicine and Rheumatology and former Dean, Damascus University", "American Board certified in Internal Medicine", "President of the Arab Board scientific council for internal medicine and rheumatology", "Founder and former president of ArLAR, the Syrian Association of Rheumatology, and the Syrian Association for Prevention of Osteoporosis"] },
  { name: "Elyes Bouajina", credentials: "MD", country: "Tunisia", image: "/images/scientific-committee/elyes-bouajina.jpg", bio: ["Head of Rheumatology, Farhat Hached Hospital of Sousse since February 2005", "Responsible for rheumatology teaching at the Faculty of Medicine of Sousse since 2006"] },
  { name: "Suad Hennawi", credentials: "MD, PhD", country: "United Arab Emirates", image: "/images/college-members/suad-hanawi.jpg", bio: ["Consultant Rheumatologist, UAE Ministry of Health and Prevention", "Chair of Rheumatology at MOHAP", "Deputy Chair of the Central Research Ethics Committee and Chair of the Dubai Health District Research Ethics Committee"] },
];

const archNetwork = [
  ["Dr Abir Mokbel","Egypt"],["Dr Avin Maroof","Iraq"],["Dr Batool Hassan Al Lawati","Oman"],["Dr Elyes Bouajina","Tunisia"],["Dr Fatima Abu Tiban","Kuwait"],["Dr Gehan Elolemy","Egypt / Kuwait"],["Dr Hussein Halabi","Saudi Arabia"],["Dr Kawther Ben Abdelghani","Tunisia"],["Dr Laila Ayoub","Libya"],["Dr Malik Djennane","Algeria"],["Dr Mariam Erraoui","Morocco"],["Dr Nelly Ziade","Lebanon"],["Dr Omar Al Taani","Jordan / USA"],["Dr Rawdha Tekaya","Tunisia"],["Dr Salwa Alcheikh","Syria"],["Dr Sherif Gamal","Egypt"],["Dr Suad Mohammed","Sudan"],["Dr Walaa Abdelrahman","Egypt"],["Dr Ahmad Abogamal","UAE"],["Dr Basel Masri","Jordan"],["Dr Chafia Dahou-Makhloufi","Algeria"],["Dr Faiq Isho Gorial","Iraq"],["Dr Fatima Alnaimat","Jordan"],["Dr Hanan Al Rayes","Saudi Arabia"],["Dr Ihsane Hmamouchi","Morocco"],["Dr Khalid Alnaqbi","UAE"],["Dr Lina El Kibbi","Saudi Arabia"],["Dr Manal Al Mashaleh","Jordan"],["Dr Mohamad Ali Rida","Lebanon"],["Dr Nesreen Moustafa","UAE"],["Dr Ouafi Ikram","Algeria"],["Dr Saed Attawna","Jordan"],["Dr Samar Al Emadi","Qatar"],["Dr Soad Hashad","Libya"],["Dr Sulaiman Al-Mayouf","Saudi Arabia"],["Dr Zineb Ammor","Morocco"],["Dr Asal Adnan","Iraq"],["Dr Bassel Elzorkany","Egypt"],["Dr Chafika Haouichat","Algeria"],["Dr Fatemah Baron","Kuwait"],["Dr Fatma Zohra Yasmina Heddi","Algeria"],["Dr Hela Sahli","Tunisia"],["Dr Kamel Mroueh","Lebanon"],["Dr Krystel Aouad","Lebanon"],["Dr Mahmoud Adly","Kuwait"],["Dr Manal El Rakawi","Algeria"],["Dr Nada Al Chama","Syria"],["Dr Nizar Abdulateef Jassim","Iraq"],["Dr Rachid Bahiri","Morocco"],["Dr Sahar Saad","Bahrain"],["Dr Selma Abdellaoui","Algeria"],["Dr Suad Hannawi","UAE"],["Dr Wafa Hamdi","Tunisia"],["Dr Ziryab Imad Taha","Sudan"],
].map(([name,country]) => ({ name, country }));

const archReplays: SigReplay[] = [
  ["Authorship Criteria in Research: Who Qualifies as an Author?","Wednesday, June 10, 2026","https://youtu.be/QIRODmUjPGs"],["Top Reasons for Acceptance and Rejection of a Scientific Article: The Editor’s Point of View","Tuesday, June 24, 2025","https://www.youtube.com/watch?v=rexlmzsWOcw"],["Challenges in Early Referral in Rheumatoid Arthritis Patients to Rheumatology","Wednesday, October 25, 2023","https://youtu.be/pfBKgbo1tUA"],["When to Refer a Patient with Early Arthritis or Inflammatory Low Back Pain to Rheumatology?","Wednesday, October 23, 2024","https://youtu.be/7d-X7etYZOA"],["Quand Référer les Patients Ayant une Arthrite Précoce ou une Lombalgie Inflammatoire en Rhumatologie?","Monday, October 21, 2024","https://youtu.be/x5UQHKHmqxU"],["Advancing Rheumatology Research through Artificial Intelligence","Tuesday, May 14, 2024","https://youtu.be/k-IeLMLD93o"],["Strengths and Weaknesses of an International Scientific Study in Rheumatology","Monday, April 29, 2024","https://youtu.be/xd-079RTnn8"],["Challenges in Early Referral of Patients with Juvenile Idiopathic Arthritis","Wednesday, February 21, 2024","https://youtu.be/sPLxwu7v0wY"],["Challenges in Early Referral of Psoriatic Arthritis Patients to Rheumatology","Tuesday, January 16, 2024","https://youtu.be/nlLrRxJuG_k"],["Challenges in Early Referral of Axial Spondyloarthritis Patients to Rheumatology","Monday, December 4, 2023","https://youtu.be/jti5XmCF0ig"],["Outcome Measures in Rheumatology","Tuesday, November 1, 2022","https://youtu.be/efqt2l52Z0s"],["International Cohort GRA","Thursday, September 15, 2022","https://youtu.be/7TETZsLlD3U"],
].map(([title,date,href])=>({title,date,href}));

sigProfiles.push({
  slug: "research", abbreviation: "ARCH", name: "ArLAR Research Group",
  description: "Leading collaborative, high-quality rheumatology research across the Arab countries.",
  logo: "/images/special-interest-groups/arch.png", sourceUrl: "https://www.arabrheumatology.org/arch",
  intro: ["ARCH was founded in June 2021 as a Special Interest Group of ArLAR."],
  video: "/videos/special-interest-groups/arch-research-group.mp4",
  document: { title: "ARCH Mission, Vision & Standard Operating Procedure", href: "https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/documents/wix/1f2182_1903bd45612d41728166162d46d7d023.pdf", action: "Read full document" },
  tabs: [
    { id:"overview", label:"Overview", kind:"sections", sections:[
      { title:"Vision", paragraphs:["ARCH aspires to lead collaborative rheumatology research in the Arab countries."] },
      { title:"Mission", paragraphs:["The mission of the Rheumatic Diseases Research Group rests on four main pillars:"], items:["Research projects — plan and conduct research on behalf of ArLAR to serve patients with rheumatic and musculoskeletal diseases in Arab countries.","Quality and infrastructure — support high-quality collaborative research and compliance with international standards in infrastructure and standard operating procedures.","Motivation and support — assist young researchers in the Arab countries to conduct successful, high-standard projects.","Research networking — connect with international research teams, institutions, and companies to participate in global clinical trials."] },
      { title:"ARCH values", items:["Excellence — pursue excellence from research design to outcome while ensuring high-standard infrastructure.","Ethics and integrity — prioritize ethical conduct and research integrity.","Education — invest in young Arab researchers and strengthen their capabilities.","Motivation — inspire and motivate research in the Arab region.","Teamwork — promote collaboration between researchers and clinical rheumatologists across Arab countries."] },
    ]},
    { id:"members", label:"ARCH Members", kind:"people", people:archPeople },
    { id:"network", label:"ARCH Network", kind:"network", members:archNetwork },
    { id:"webinars", label:"Webinars", kind:"replays", replays:archReplays },
    { id:"newsletters", label:"Newsletters", kind:"resources", resources:[
      { title:"ARCH Newsletter Issue #3", description:"Vision and mission; TACTIC, ALFA and PROSPA research projects; educational webinars; publications in numbers; and how to participate.", date:"2025-12", href:"https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/documents/wix/bba2f0_bd00cefc9dbb4de29466372d7fc34361.pdf", action:"View newsletter" },
      { title:"ARCH Newsletter Issue #2", description:"Vision and mission; TACTIC, ALFA and PROSPA research projects; educational webinars; publications in numbers; and how to participate.", date:"2024-12", href:"https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/documents/wix/bba2f0_22079f7d75694c26896edf3ae31247b9.pdf", action:"View newsletter" },
      { title:"ARCH Newsletter Issue #1", description:"Vision and mission; 2021–2023 and 2023–2025 research projects; educational webinars; research education; and how to participate.", date:"2023-12", href:"https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/documents/wix/1f2182_41d0eda43c924f8b8ec06d702058cb11.pdf", action:"View newsletter" },
    ]},
    { id:"manuscripts", label:"Manuscripts", kind:"resources", resources:[
      { title:"The rheumatology workforce in the Arab countries: current status, challenges, opportunities, and future needs from an ArLAR cross-sectional survey", href:"https://pubmed.ncbi.nlm.nih.gov/37624401/", action:"View publication" },
      { title:"Burnout syndrome among rheumatologists and rheumatology fellows in Arab countries: an ArLAR multinational study", href:"https://pubmed.ncbi.nlm.nih.gov/38012468/", action:"View publication" },
      { title:"Is the patient-perceived impact of psoriatic arthritis a global concept? An international study in 13 Arab countries (TACTIC study)", href:"https://pubmed.ncbi.nlm.nih.gov/38498150/", action:"View publication" },
      { title:"Shaping awareness about rheumatic and musculoskeletal diseases in the Arab region: The Arab Adult Arthritis Awareness Group initiative", href:"https://journals.lww.com/ajrh/fulltext/2024/02010/shaping_awareness_about_rheumatic_and.1.aspx", action:"View publication" },
    ]},
    { id:"abstracts", label:"Abstracts", kind:"gallery", items:[
      { title:"Burnout — SFR 2023", image:"https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/images/wix-sig/1f2182_43b74e0ef0b645efb8febf22de5b8d82.png" },
      { title:"IMPACT — ACR 2024", image:"https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/images/wix-sig/1f2182_7440a784d9044362a1bf431da499a17a.png" },
      { title:"ALFA — ACR 2024", image:"https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/images/wix-sig/1f2182_22a61f0933334cc1bd54155b9d921625.png" },
      { title:"MACRO — ArLAR 2023", image:"https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/images/wix-sig/1f2182_c731cfd6059a4fa4aaf2b78d46de8719.png" },
      { title:"TACTIC — EULAR 2023", image:"https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/images/wix-sig/1f2182_398d1bcaa0a34dfb8dd622ae0cb774b9.jpg" },
      { title:"TACTIC Concordance — ACR 2023", image:"https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/images/wix-sig/1f2182_af845f13f3ed4e038cca113eac3ad52c.png" },
    ]},
    { id:"projects", label:"Projects", kind:"gallery", items:[
      { title:"ARCH upcoming research project", image:"https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/images/wix-sig/1f2182_04f6f715eb80475c9610cadee90b1ed7.jpg" },
      { title:"ARCH upcoming project", image:"https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/images/wix-sig/1f2182_2feaf0ed39f74788bdfc4add814e4a42.jpg" },
    ]},
  ],
});

const womenPeople: SigPerson[] = [
  { name:"Fatemah Baroun", credentials:"MD", role:"WhRA President", country:"Kuwait", image:"/images/board/fatemah-baroun.jpg", bio:["Specialist in adult rheumatology and internal medicine at Jahra Hospital, Kuwait"] },
  { name:"Assia Haddouche", country:"Algeria", image:"/images/sig-members/bba2f0_d43fef5617e743a5b9371b61073ea0c3~mv2.jpg", bio:["Professor of Rheumatology, Ben Aknoun Specialized Hospital Center", "General Secretary, Algerian Anti-Rheumatic League", "Holder of the EULAR Ultrasound Teacher Diploma since June 2015"] },
  { name:"Dalia Dorgham", credentials:"MD", country:"Egypt" },
  { name:"Asal Adnan", credentials:"MD", country:"Iraq", image:"/images/sig-members/1f2182_04bda4a65d234601b138eb9da868bca6~mv2.jpg", bio:["Specialist Rheumatologist in the Rheumatology Unit and Teacher of Rheumatology, Internal Medicine and Clinical Immunology, College of Medicine, University of Baghdad", "Head of the Scientific Committee, Iraqi League for Bone and Joint Health"] },
  { name:"Fatima Ababneh", credentials:"MD", country:"Jordan", image:"/images/sig-members/bba2f0_57948ca5239e4b35824051d496e7e01e~mv2.avif" },
  { name:"Nathalie El Khoury", credentials:"MD", country:"Lebanon", image:"/images/sig-members/bba2f0_6ac6633247a94c7e98435a20ad41145c~mv2.jpg", bio:["Rheumatologist, University Hospital Notre Dame de Secours, Keserwan Medical Center, and CHN Zgharta", "Graduated from Saint Joseph University and specialized at Hôtel-Dieu de France and AP-HP Paris", "Instructor, Faculty of Medicine, Holy Spirit University of Kaslik", "Board member, Lebanese Society of Rheumatology, 2024–2026"] },
  { name:"Laila Said Ayoub", credentials:"MD", country:"Libya" },
  { name:"Mariama Erraoui", credentials:"MD", country:"Morocco" },
  { name:"Khoula Al Maqbali", credentials:"MD", country:"Oman", image:"/images/sig-members/bba2f0_0827a6a8af474f0dbf3010dbff349e82~mv2.jpg", bio:["Consultant Rheumatologist, Sohar Hospital", "BhS, MD and OMSB Internal Medicine, Oman; Rheumatology Fellow, Canberra", "Master in Clinical Epidemiology, University of Newcastle; PhD candidate in Medical Education", "Graduate Certificate in Sports Medicine, University of Melbourne"] },
  { name:"Sima Abu Al-Saoud", credentials:"MD", country:"Palestine", image:"/images/aaaa-group/members/sima-abu-al-sa-oud.jpg", bio:["Consultant Pediatric Rheumatologist and Assistant Professor of Pediatrics, Faculty of Medicine, Al-Quds University", "Al-Makassed Hospital, Jerusalem"] },
  { name:"Seham Alebbi", credentials:"MD", country:"Qatar", bio:["Associate Consultant in Rheumatology, Hamad General Hospital", "Graduated from Weill Cornell Medicine–Qatar in 2016", "Completed internal medicine residency and rheumatology fellowship at Hamad Medical Corporation", "Arab Board certified in Internal Medicine and MRCP in Rheumatology"] },
  { name:"Fahidah Alenzi", credentials:"MD", country:"Saudi Arabia" },
  { name:"Sara Hamza Almubarak", credentials:"MD", country:"Sudan" },
  { name:"Layla Kazkaz", credentials:"MD", country:"Syria", image:"/images/aaaa-group/members/layla-kazkaz.jpg", bio:["Honorary President of the Syrian Association for Rheumatology since November 2024 and former president, 2018–2024", "Member of the British Society for Rheumatology and Royal College of Physicians of London", "Editor-in-Chief of the Arab Journal of Rheumatology", "Member of ArLAR and APLAR"] },
  { name:"Hela Sahli", credentials:"MD", country:"Tunisia", image:"/images/sig-members/1f2182_adcb2bf3a40b4cb7b1143cf6299b1718~mv2.webp", bio:["Rheumatology Fellow, Sheikh Shakhbout Medical City in partnership with Mayo Clinic, Abu Dhabi"] },
  { name:"Afra Aldhaheri", credentials:"MD", country:"United Arab Emirates" },
];

sigProfiles.push({
  slug:"women-health-rheumatology", abbreviation:"WHrA", name:"Arab Women Health in Rheumatology Group",
  description:"Improving reproductive-health knowledge, support, clinical care, and collaborative research for women with rheumatic diseases.",
  logo:"/images/special-interest-groups/women-health.jpg", sourceUrl:"https://www.arabrheumatology.org/arab-women-health-in-rheumatology-group",
  intro:["Reproductive health can be a source of uncertainty and anxiety for women with rheumatic and musculoskeletal diseases. Underlying disease, culture, and treatment create additional challenges. The group addresses those uncertainties and provides Arabic-language information while encouraging routine reproductive-health discussions in rheumatology clinics.","The group connects interested rheumatologists across the Arab League to improve care and collaborate on preconception, pregnancy, fertility, postpartum, and menopause support for physicians and patients in Arabic."],
  video:"https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/videos/wix-sig/bba2f0_38eec54fe0c74637a062206ac0da432e.mp4",
  tabs:[
    { id:"overview", label:"Overview", kind:"sections", sections:[
      { title:"Mission", items:["Promote awareness among rheumatologists and patients about reproductive health in rheumatic and musculoskeletal diseases.","Promote Arabic-language awareness about preconception, pregnancy, postpartum care, fertility, and menopause.","Advocate early and regular discussion of reproductive-health concerns during rheumatology visits.","Motivate and support patients in Arabic.","Promote multidisciplinary care and reproductive-health clinics within rheumatology across Arab countries.","Motivate rheumatologists to address reproductive-health concerns with adult patients.","Create a platform for rheumatologists interested in women's and reproductive health and raise care to international standards.","Encourage regional collaboration, experience sharing, data collection, analysis, and research."] },
      { title:"Vision", items:["Reach adult patients with rheumatic disease across Arab countries and ensure reliable, current, accessible reproductive-health information in Arabic.","Connect rheumatologists interested in reproductive health to improve care and empower shared resources."] },
      { title:"Objectives for patients", items:["Encourage patients to raise preconception, pregnancy, fertility, and postpartum concerns with their physicians.","Emphasize the importance of family planning in rheumatology.","Provide support and reliable Arabic-language resources."] },
      { title:"Objectives for rheumatologists", items:["Advance awareness, education, and support for reproductive-health discussions with adult patients.","Create a platform for interested rheumatologists to share experience and improve care.","Enable combined analysis of data from regional institutions and expand research opportunities."] },
    ]},
    { id:"programme", label:"Programme", kind:"sections", sections:[
      { title:"1. Empowering reproductive health in rheumatology", items:["Advance awareness, education, and support for rheumatologists.","Provide reliable resources for patients in Arabic.","Run regular public engagement sessions addressing reproductive health and rheumatic disease.","Highlight access to contraception across the region and use social media to reach the public.","Build a supportive community for sharing pregnancy experiences.","Emphasize contraception and preconception planning.","Reinforce integrated care by rheumatologists, obstetricians, gynecologists, and reproductive endocrinologists throughout family planning, pregnancy, and early parenthood."] },
      { title:"2. A supportive platform for rheumatologists", items:["Build a regional platform for collaboration and better care.","Provide regular educational sessions across the Arab region.","Encourage specialist services and local multidisciplinary collaboration, sharing existing MDT clinic experience.","Share challenging cases, current recommendations, clinical practice, and local data.","Interact effectively with international organizations to improve regional care and practice."] },
      { title:"3. Collaboration", paragraphs:["The group provides a space for shared experience and mutual support, and promotes prospective regional collection and analysis of pregnancy data across inflammatory rheumatic diseases.","Close collaboration with the ArLAR Registry Group can support combined analysis of reasonably homogeneous data from different regional institutions."] },
      { title:"4. Research", paragraphs:["International data on reproductive health, medication safety, and neonatal and fetal outcomes remain limited. The group aims to increase the contribution of Arab-world data.","It will collaborate with ARCH to facilitate research and help rheumatologists produce regional recommendations, guidance, and studies on reproductive health and rheumatic disease."] },
    ]},
    { id:"members", label:"Group Members", kind:"people", people:womenPeople },
  ],
});

export function getSigProfile(slug: string) {
  return sigProfiles.find((profile) => profile.slug === slug);
}

const journalPeople: SigPerson[] = [
  { name:"Layla Kazkaz", credentials:"MD, PhD, FRCP", role:"AJR President", country:"Syria", image:"/images/aaaa-group/members/layla-kazkaz.jpg", bio:["Senior Consultant Rheumatologist and President of the Syrian Association for Rheumatology", "Chair of the Scientific Committee, Syrian Association for Osteoporosis Prevention", "Member of the Ministry of Health scientific council and examination board for locomotor-system diseases", "Member of the British Society for Rheumatology, Fellow of the Royal College of Physicians of London, and member of ArLAR"] },
  { name:"Fatemah Abutiban", credentials:"MD · Ex Officio", country:"Kuwait", image:"/images/aaaa-group/members/fatemah-abutiban.jpg", bio:["President of ArLAR", "Consultant of medicine and rheumatology at Jaber Alahmed Hospital, Shiekhan Alfaresi Rheumatology Centre, and Kuwait Oil Company", "President of the Kuwait Association of Rheumatology and Treasurer of the Kuwait Osteoporosis Society"] },
  { name:"Nizar AbdulLateef Jasim", credentials:"MD · Ex Officio", country:"Iraq", image:"/images/scientific-committee/nizar-abdullateef-jasim.jpg", bio:["Chairman of the Scientific Committee and Senior Consultant Rheumatologist", "Professor of Medicine, University of Baghdad College of Medicine", "President of the Iraqi League for Bone and Joint Health and Pan-Arab Osteoporosis Society"] },
  { name:"Malik Djennane", credentials:"MD", country:"Algeria", image:"/images/sig-members/1f2182_8d49b3cd20694d90ae9e02d3b570d1b5~mv2.jpg", bio:["Professor, Mouloud Mammeri University, Tizi Ouzou", "Head of Rheumatology, CHU Tizi Ouzou", "Board member, Algerian Society of Rheumatology", "Scientific Committee member, African Society for the Fight Against Osteoporosis"] },
  { name:"Lobna Ahmed Maged", credentials:"MD", country:"Egypt", image:"/images/sig-members/1f2182_4108424c0675429ea16bdbf1f9d10487~mv2.jpg", bio:["Lecturer and Consultant of Rheumatology and Clinical Immunology, Cairo University since 2017", "Member and organizer, Egyptian Society of Rheumatic Diseases", "Reviewer, Egyptian Rheumatology and Rehabilitation Journal"] },
  { name:"Yasameen Abbas Humadi", credentials:"MD", country:"Iraq", image:"/images/sig-members/1f2182_06ac1f89a9954bb9b3b9dd554b5c4586~mv2.jpg", bio:["Lecturer, Al-Nahrain College of Medicine, Department of Internal Medicine", "Fellow of the Iraqi Board for Medical Specializations in Rheumatology and Medical Rehabilitation, 2019", "Rheumatology consult clinic, Baghdad Teaching Hospital", "Member of the Iraqi League for Bone and Joint Health since 2016"] },
  { name:"Wafa Madanat", credentials:"MD, PhD, FRCP", country:"Jordan", image:"/images/board/wafa-madanat.jpg", bio:["Consultant Rheumatologist", "Co-founder of the Jordanian Society of Rheumatology and Chair of its Scientific Committee, 2004–2010", "Council member, International Society for Behçet's Disease", "Editorial board member and reviewer for local and international journals"] },
  { name:"Mira Merashli", credentials:"MD, FRCP", country:"Lebanon", image:"/images/college-members/mira-merhachly.jpg", bio:["Assistant Professor in Rheumatology, American University of Beirut"] },
  { name:"Khaled Elmuntaser", credentials:"Professor", country:"Libya", image:"/images/sig-members/7cc206_6a6119f6c8e5406d8e910be7b74f4944~mv2.jpg", bio:["Medical graduate, University of Heidelberg; internal medicine and rheumatology training, University of Essen", "Founder and former President, Libyan Rheumatology Society", "Former Head of Rheumatology, Tripoli University", "Consultant Rheumatologist, MVZentrum for Rheumatology and Autoimmune Diseases, Hamburg"] },
  { name:"Imad Ghozlani", credentials:"MD, PhD", country:"Morocco", image:"/images/sig-members/1f2182_f4a5243a988546b2af54c4ecb4b4465a~mv2.jpg", bio:["Professor of Rheumatology, Ibn Zohr University of Agadir", "Head of Rheumatology, Military Hospital", "Secretary General, Moroccan Society of Rheumatology", "Principal Editor, Revue Marocaine de Rhumatologie"] },
  { name:"Farida Al Balushi", credentials:"MD, FRCP", country:"Oman", image:"/images/sig-members/1f2182_72ec08a7947341a0a4fed68b591ba32f~mv2.png", bio:["Senior Consultant Rheumatologist and Head of Rheumatology, Royal Hospital, Muscat since 2013", "Vice President, Oman Society of Rheumatology, 2019–2021", "Associate Program Director, Oman Medical Specialty Board Internal Medicine Residency, 2014–2018"] },
  { name:"Muaath Itmaizeh", credentials:"MD", country:"Palestine", image:"/images/sig-members/1f2182_fd406178ec4345acb9304e1a4937e336~mv2.png", bio:["Head of Rheumatology, Al-Makassed Charitable Islamic Hospital, Jerusalem"] },
  { name:"Mohammad Hammoudeh", credentials:"MD", country:"Qatar", image:"/images/college-members/mohammed-hamoudeh.jpg", bio:["Consultant in internal medicine and rheumatology", "Editorial board member, Egyptian Rheumatology Journal and World Journal of Rheumatology"] },
  { name:"Fehaid Ghali Alanazi", credentials:"MD", country:"Saudi Arabia", image:"/images/sig-members/1f2182_097c9620cd9247f1a77f4b0f919f292c~mv2.png", bio:["Assistant Professor and Consultant Rheumatologist, College of Medicine, Majmaah University", "Vice Dean for Graduate Studies and Scientific Research and Head of Medicine, College of Medicine, Majmaah University", "Secretary General, Saudi Society for Rheumatology"] },
  { name:"Abubakr Gumaa Balal Saad", credentials:"MD", country:"Sudan", image:"/images/sig-members/1f2182_afccc68279794a3f975f9bf3095b8187~mv2.jpg", bio:["Consultant in internal medicine and adult rheumatology, Khartoum Teaching Hospital", "Member of the Rheumatology Council, Sudan Medical Specialization Board"] },
  { name:"Saoussen Zrour", credentials:"MD", country:"Tunisia", image:"/images/sig-members/1f2182_fae00352575a4830b616be116b63d5ea~mv2.jpg", bio:["Professor of Rheumatology, University of Monastir", "Rheumatologist, Fattouma Bourguiba Teaching Hospital, Monastir", "Member of the Tunisian League Against Rheumatism"] },
  { name:"Khalid Alnaqbi", credentials:"MD", country:"United Arab Emirates", image:"/images/scientific-committee/khalid-alnaqbi.jpg", bio:["Chief of Rheumatology and Assistant Professor, UAE University, Al Ain"] },
];

sigProfiles.push({
  slug:"arab-journal", abbreviation:"AJR", name:"Arab Journal of Rheumatology",
  description:"The official peer-reviewed journal of ArLAR, advancing clinical and scientific knowledge across rheumatology and related fields.",
  logo:"/images/special-interest-groups/arab-journal.jpg", sourceUrl:"https://www.arabrheumatology.org/arabjournalofrheumatology",
  tabs:[
    { id:"overview", label:"Mission & Vision", kind:"sections", sections:[{ title:"Mission and vision", paragraphs:["The Arab Journal of Rheumatology is the official journal of the Arab League of Associations for Rheumatology.","It accepts and publishes high-quality medical articles related to rheumatology, immune disorders, osteoporosis, and rehabilitation medicine to disseminate scientific and clinical research and advance knowledge and practice.","The peer-reviewed journal welcomes original articles, experimental research, interesting cases, and smaller studies from clinicians and researchers. Acceptance is based on research quality and originality."] }] },
    { id:"editorial-board", label:"Editorial Board", kind:"people", people:journalPeople },
  ],
});

const youngPeople: SigPerson[] = [
  { name:"Amna AlMuhairi", credentials:"MD, MBBS, MSc-MHSA, ABIM", country:"United Arab Emirates", image:"/images/sig-members/1f2182_1d48b0c282ce4b1cb67920819cabfb95~mv2.jpg", bio:["Rheumatology Fellow, Sheikh Shakhbout Medical City in partnership with Mayo Clinic, Abu Dhabi"] },
  { name:"Nizar AbdulLateef Jasim", credentials:"MD", country:"Iraq", image:"/images/scientific-committee/nizar-abdullateef-jasim.jpg", bio:["Chairman of the Scientific Committee; Senior Consultant Rheumatologist", "Professor of Medicine, University of Baghdad College of Medicine", "President of the Iraqi League for Bone and Joint Health and Pan-Arab Osteoporosis Society"] },
  { name:"Rahmouni Hafida", credentials:"MD", country:"Algeria", image:"/images/sig-members/1f2182_75dc4b5be0764a6297f1020985bc533a~mv2.jpeg", bio:["Assistant, Rheumatology Department, CHU Douera, University of Blida", "Member of the Algerian Society of Rheumatology and Rheumatoid Arthritis Unit"] },
  { name:"Zeinab Ahmed Mohamed Aboelfetoh", country:"Egypt", image:"/images/sig-members/1f2182_d9cf1ef2cfeb47f29bbea9ff8f7fe227~mv2.jpg", bio:["Demonstrator in Rheumatology and Rehabilitation, Kasr Al Ainy Teaching Hospital, Faculty of Medicine, Cairo University", "Member of the Egyptian Society of Rheumatic Diseases"] },
  { name:"Asal Adnan", credentials:"MD", country:"Iraq", image:"/images/sig-members/1f2182_04bda4a65d234601b138eb9da868bca6~mv2.jpg", bio:["Board-certified rheumatologist, Rheumatology Unit, Department of Medicine, Baghdad Teaching Hospital, Medical City", "Member of the Iraqi League for Bone and Joint Health"] },
  { name:"Ola Hijjawi", credentials:"MD", country:"Jordan", image:"/images/sig-members/1f2182_67c9a49299594b84b50b459f5bb5eab4~mv2.jpg", bio:["Rheumatology Consultant", "Jordanian boards in internal medicine and rheumatology"] },
  { name:"Anwar Al Basri", credentials:"MD, BMBCh, FRCPC", country:"Kuwait", image:"/images/sig-members/1f2182_a98b637d5f35445c9ae5ce417de9fe38~mv2.jpg", bio:["Specialist in internal medicine and rheumatology, Al-Sabah Hospital"] },
  { name:"Nadeen Hilal", credentials:"MD, MPH", country:"Lebanon", image:"/images/sig-members/1f2182_724f478def39445f820113faa866e1c1~mv2.jpg", bio:["Rheumatology Consultant", "Technical Advisor to the Lebanese Minister of Public Health"] },
  { name:"Magda Eltofeel", credentials:"MD, MBBCh", country:"Libya", image:"/images/sig-members/1f2182_963b56c949324f4ea390adbf4f1e6ac7~mv2.jpg", bio:["Specialist Pediatric Rheumatologist, Tripoli Children's Hospital", "Member of PAFLAR, PRAG, PReS, and PRINTO"] },
  { name:"Ahmed Mougui", credentials:"MD", country:"Morocco", image:"/images/sig-members/1f2182_b0c57723c2d946e7b4677eefba8110d8~mv2.jpg", bio:["Assistant in Rheumatology, University Hospital Mohammed VI, Marrakesh"] },
  { name:"Ahmed Salim Rashid Al Maqbali", credentials:"MD, OMSB, ABIM, FRCP", country:"Oman", image:"/images/sig-members/1f2182_031c3669e1224f19ae08e9ab939b0a3d~mv2.jpg", bio:["Consultant in internal medicine and rheumatology"] },
  { name:"Rawand Alardah", credentials:"MD", country:"Palestine", image:"/images/sig-members/1f2182_9549e846439e4f749da2d4a9f171e650~mv2.jpg", bio:["Rheumatology Fellow, Al-Makassed Hospital, Jerusalem"] },
  { name:"Karima Becetti", credentials:"MD, MS", country:"Qatar", image:"/images/sig-members/1f2182_c0dd820a54f34bcabc89060eddabc1f6~mv2.jpg", bio:["Rheumatology Consultant, Hamad Medical Corporation", "Assistant Professor in Medicine, Weill Cornell Medicine in Qatar"] },
  { name:"Hussam Abdulrahman AlSulmi", credentials:"MD", country:"Saudi Arabia", image:"/images/sig-members/1f2182_a016ac93a16a4451a88183ad12130222~mv2.jpg", bio:["Consultant internist and rheumatologist", "Vice Dean of Educational Affairs and Assistant Professor, College of Medicine, Qassim University"] },
  { name:"Nasereldin Hamednalla Elasha Hamednalla", credentials:"MD", country:"Sudan", image:"/images/sig-members/1f2182_a3391873ee9745d59521873996db6f42~mv2.jpg", bio:["Rheumatology Fellowship, Sudan Medical Specialization Board", "Clinical Lecturer, Karary University and Al Ahfad University for Women"] },
  { name:"Ahmad Asaad", credentials:"MD", country:"Syria", image:"/images/sig-members/1f2182_20e417329e3e41f89daaad66598648d6~mv2.jpg", bio:["Rheumatology Consultant, Ibn Al-Nafees Governmental Hospital, Damascus", "Syrian Board Certificate in Rheumatology"] },
  { name:"Mouna Brahem", credentials:"MD", country:"Tunisia", image:"/images/sig-members/1f2182_69db60b0b0a54e31b063927e5a97a11e~mv2.jpg", bio:["Hospital University Assistant, Rheumatology Department, Taher Sfar Teaching Hospital, Mahdia"] },
];

sigProfiles.push({
  slug:"young-rheumatologists", abbreviation:"YRG", name:"Young Rheumatologist Group",
  description:"Supporting the education, research, clinical practice, and international connections of emerging Arab rheumatologists.",
  logo:"/images/special-interest-groups/young-rheumatologists.jpeg", sourceUrl:"https://www.arabrheumatology.org/young-rheumatologist-group",
  tabs:[
    { id:"overview", label:"Overview", kind:"sections", sections:[
      { title:"Mission", paragraphs:["The YRG mission and objectives are aligned with ArLAR's objectives and bylaws. Its mission is to stimulate and promote excellence in awareness, knowledge, prevention, and treatment of rheumatic and musculoskeletal diseases."] },
      { title:"Objectives", items:["Inspire young rheumatologists and medical trainees to commit to continuing medical education through webinars, workshops, and training in collaboration with ArLAR entities.","Encourage fellows in training and young rheumatologists to participate actively in scientific research.","Promote patient education and awareness.","Contribute to efficient, high-quality rheumatology practice.","Collaborate and network with trainees in the International League of Associations for Rheumatology."] },
    ]},
    { id:"members", label:"YRG Members", kind:"people", people:youngPeople },
    { id:"activities", label:"Activities", kind:"replays", replays:[
      { title:"Challenging Cases, Rheumatoid Arthritis and Beyond", date:"Wednesday, April 24, 2024", href:"https://www.youtube.com/playlist?list=PLhkzE1M8cmO4BZh9WVgtfulfq1T8Aa5M-" },
      { title:"Challenging Cases in Connective Tissue Disease", date:"Wednesday, November 30, 2022", href:"https://youtube.com/playlist?list=PLhkzE1M8cmO5c41xZ-Vv4fDbCXwUCr_L5" },
    ]},
    { id:"cases", label:"YRG Cases", kind:"cases", cases:[
      { title:"YRG Case #2 — Delayed and difficult walking", prompt:["A 3-year-old girl is brought to clinic with delayed and difficult walking, frequent falls, and difficulty standing from sitting. There is no trauma, chronic illness, or history suggesting neuromuscular disease.","Her diet is poor in vitamin D-rich foods and she has limited sun exposure. Examination shows a waddling gait, bowing of both lower limbs, and widening of the wrists and ankles, without muscle weakness, sensory loss, or cranial nerve involvement."], answer:"Nutritional rickets (vitamin D deficiency rickets)", treatment:["Vitamin D supplementation.","Adequate calcium intake.","Nutritional counselling."], learningPoints:["Delayed walking in toddlers is not always neurological.","Rickets remains a common and preventable cause.","X-ray metaphyseal changes are diagnostic.","Early treatment prevents permanent deformity and growth failure.","Always assess nutrition and vitamin D status in gait delay."], images:["https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/images/wix-sig/bba2f0_c642e2ec4a6c4154bcee18699f7f21e8.png","https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/images/wix-sig/bba2f0_cdab52d2b9604fdf963711b91aa80c30.jpg"] },
      { title:"YRG Case #1 — Progressive left buttock pain", prompt:["A 47-year-old housewife presented with four months of left buttock pain that progressively worsened until she was unable to walk.","There was no prior trauma, genitourinary problem, or recent infection; she reported ovarian cystectomy four months earlier.","Examination showed tenderness over the left hip and severe left SIJ tenderness on pelvic compression. ESR was 81 mm/hr and CRP 110 mg/dl. MRI findings were provided. What is the next step in management?"], answer:"Start antibiotics.", images:["https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/images/wix-sig/1f2182_b259a371b2934129beb05f50a4ba1516.jpg","https://pub-2768431f8fd64f7b998c4e7d380e354d.r2.dev/images/wix-sig/1f2182_5641e3f097844359bfd474caea0e31e9.jpg"] },
    ]},
  ],
});

const registryPeople: SigPerson[] = [
  { name:"Adeeba Al Herz", credentials:"MD, FRCPC, FACP", role:"RArLAR President", country:"Kuwait", image:"/images/sig-members/bba2f0_3215a6e221cc4527af4d01faccc33627~mv2.jpg", bio:["Consultant in internal medicine and rheumatology, Al-Amiri Hospital, Kuwait City", "Consultant rheumatologist, Medical One Polyclinic, Kuwait City"] },
  { name:"Nizar AbdulLateef Jasim", credentials:"MD", country:"Iraq", image:"/images/scientific-committee/nizar-abdullateef-jasim.jpg", bio:["Chairman of the Scientific Committee; Senior Consultant Rheumatologist", "Professor of Medicine, University of Baghdad College of Medicine", "President of the Iraqi League for Bone and Joint Health and Pan-Arab Osteoporosis Society"] },
  { name:"Houria Ayed", credentials:"MD", country:"Algeria", image:"/images/sig-members/bba2f0_0ba6b25263154cf0872cc58f27492fd6~mv2.jpg", bio:["Professor of Rheumatology", "Head of University Hospital Service, CHU Annaba"] },
  { name:"Nehal Elghobashy", credentials:"MD", country:"Egypt", image:"/images/sig-members/bba2f0_4c897477a2a94312af53837e2de2d507~mv2.jpg", bio:["Lecturer and Consultant of Rheumatology and Clinical Immunology, Cairo University", "Member of the Egyptian Society of Rheumatic Diseases"] },
  { name:"Asal Adnan Ridha", credentials:"MD", country:"Iraq", image:"/images/sig-members/bba2f0_a8254cdf106149ae9b41927a805d1a80~mv2.jpg", bio:["Board-certified rheumatologist", "Specialist at Baghdad Teaching Hospital, Medical City, Baghdad"] },
  { name:"Fatima A Alnaimat", credentials:"MD, FACR", country:"Jordan", image:"/images/sig-members/bba2f0_832150ddac9240e193450281beabd878~mv2.jpg", bio:["Diplomate of the American Board of Internal Medicine and American Board of Rheumatology", "Assistant Professor of Medicine and Rheumatology, University of Jordan"] },
  { name:"Jamil Misseykeh", credentials:"MD", country:"Lebanon", image:"/images/sig-members/bba2f0_8571234ec04042539b3721c6b85a3688~mv2.jpg", bio:["Rheumatologist with a master's in clinical biology", "Vice President of the Lebanese Society of Rheumatology"] },
  { name:"Laila Said Ayoub", credentials:"MD", country:"Libya", image:"/images/sig-members/bba2f0_ccfb452b9c9b45029808b60fb2189ed3~mv2.jpg", bio:["Specialist in internal medicine and rheumatology", "Member of the Libyan Society of Rheumatology and Lecturer at Tripoli University", "Internal medicine trainer and Head of Rheumatology, Tripoli Central Hospital"] },
  { name:"Radouane Niamane", credentials:"MD", country:"Morocco", image:"/images/sig-members/bba2f0_00dc6d78e35148b48ea917fbfe41cbf2~mv2.jpg", bio:["Professor of Rheumatology since 2009, Cadi Ayyad University Faculty of Medicine and Pharmacy, Marrakech", "Head of Rheumatology, Avicenne Military Hospital", "Former Vice President and board member of the Moroccan Society of Rheumatology"] },
  { name:"Tariq AlFanna Al Araimi", credentials:"MD, ABIM, FRCPC", country:"Oman", image:"/images/scientific-committee/tariq-al-araimi.jpg", bio:["Rheumatologist and internist at the Royal Hospital; Vice President of the Oman Society of Rheumatology", "Trained at the University of Toronto", "Dual board-certified by ABIM and the Royal College of Physicians and Surgeons of Canada; FACR"] },
  { name:"Refaat AlHanbli", credentials:"MD", country:"Palestine" },
  { name:"Eman Hassan Satti", credentials:"MD", country:"Qatar", image:"/images/sig-members/bba2f0_8945cbd1f7d648a497d810d7de6e0216~mv2.jpg", bio:["Consultant Rheumatologist, Hamad General Hospital", "Arab Board certified in Internal Medicine; MRCP rheumatology specialty certification", "Assistant Professor at WCMC-Qatar; Harvard Chan PPCR teaching assistant", "Master of Clinical Research, Dresden University"] },
  { name:"Hanan Al Rayes", credentials:"MD", country:"Saudi Arabia", image:"/images/scientific-committee/hanan-al-rayes.jpg", bio:["Senior Consultant in Rheumatology and Lupus", "Rheumatology and lupus fellowship, University of Toronto; Saudi rheumatology fellowship", "President of the Saudi Society for Rheumatology 2018–2021", "Deputy Director of Medicine, Prince Sultan Military Medical City; Board member, Saudi Osteoporosis Society"] },
  { name:"Elwaleid Ibrahim", credentials:"MD", country:"Not specified" },
  { name:"Imad Hamdoun", credentials:"MD", country:"Kuwait", image:"/images/sig-members/bba2f0_089e26f7ca0b4260a6c6391af8595ed2~mv2.jpg", bio:["Head of Rheumatology, Ibn Alnafis Hospital, Damascus", "DIS in Rheumatology, Reims University, France"] },
  { name:"Kawther Ben Abdelghani", credentials:"MD, PhD", country:"Tunisia", image:"/images/college-members/kawther-ben-abdelghani.jpg", bio:["Associate Professor of Rheumatology, Mongi Slim Hospital", "General Secretary of the Tunisian League Against Rheumatism", "National coordinator for the Tunisian MSUS University Certificate, BINAR biologics registry, and therapeutic patient education project", "Head of the Rheumatology Department research unit, Mongi Slim Hospital"] },
  { name:"Hiba Ibrahim Khogali Ahmed", credentials:"MD, Sc Rheumatology UK, MRCPgs, MRCPI, MBBS", country:"United Arab Emirates", image:"/images/sig-members/bba2f0_25cdca85f2f74c50a4c23c62c8fc120c~mv2.jpg", bio:["Rheumatologist at Tawam Hospital since 2012", "Founded specialized SLE and joint rheumatology-obstetrics high-risk pregnancy clinics", "Member of the Sudanese Society of Rheumatology, Emirates Medical Association, Emirates Society of Rheumatology, and American College of Rheumatology"] },
];

sigProfiles.push({
  slug:"registry", abbreviation:"RArLAR", name:"Registry of ArLAR",
  description:"Building connected regional and national rheumatology registries to improve research and patient care.",
  logo:"/images/special-interest-groups/registry.jpg", sourceUrl:"https://www.arabrheumatology.org/registry-of-arlar",
  tabs:[
    { id:"overview", label:"Objectives", kind:"sections", sections:[{ title:"RArLAR objectives", items:["Generate representative data about patients across Arab countries.","Create a regional Pan-Arab registry.","Create local sub-registries for individual Arab countries.","Publish in well-recognized journals.","Present findings at regional and international conferences.","Strengthen collaboration between Arab countries to improve patient care through the registry."] }] },
    { id:"members", label:"Registry Members", kind:"people", people:registryPeople },
  ],
});
