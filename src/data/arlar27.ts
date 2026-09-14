import {
  BookOpen,
  CalendarDays,
  FileText,
  Globe,
  MapPin,
  Users,
} from "@/components/icons";

export const arlar27 = {
  title: "ArLAR27 Iraq",
  shortTitle: "ArLAR27",
  theme: "Shaping the Future of Rheumatology",
  dates: "24–27 March 2027",
  location: "Baghdad, Iraq",
  logo: "/images/arlar27-congress-logo.jpeg",
  heroImage: "/images/iraq-congress-cta.png",
  saveTheDateImage: "/images/arlar27-save-the-date.jpg",
  honoraryPresident: {
    name: "Ziad Shafiq Al-Rawi, MD",
    role: "Honorary President of ArLAR27",
    image: "/images/college-members/ziad-al-rawi.jpg",
  },
  president: {
    name: "Nizar AbdulLateef Jasim, MD",
    role: "President of ArLAR",
    image: "/images/scientific-committee/nizar-abdullateef-jasim.jpg",
  },
} as const;

export const arlar27Navigation = [
  { label: "Home", href: "/congresses/arlar27" },
  { label: "Welcome", href: "/congresses/arlar27/welcome" },
  { label: "Committee", href: "/congresses/arlar27/committee" },
  { label: "Faculty", href: "/congresses/arlar27/faculty" },
  { label: "Abstracts", href: "/congresses/arlar27/abstracts" },
  { label: "Programme", href: "/congresses/arlar27/programme" },
  { label: "About Iraq", href: "/congresses/arlar27/about-iraq" },
] as const;

export const arlar27GatewayCards = [
  {
    index: "01",
    title: "Welcome message",
    description: "A welcome to Baghdad and the vision guiding ArLAR27.",
    href: "/congresses/arlar27/welcome",
    icon: Globe,
  },
  {
    index: "02",
    title: "Congress committee",
    description: "Meet the people shaping the scientific and congress experience.",
    href: "/congresses/arlar27/committee",
    icon: Users,
  },
  {
    index: "03",
    title: "Faculty",
    description: "Discover the regional and international voices joining the congress.",
    href: "/congresses/arlar27/faculty",
    icon: Users,
  },
  {
    index: "04",
    title: "Abstract submission",
    description: "Prepare your research for the ArLAR27 scientific programme.",
    href: "/congresses/arlar27/abstracts",
    icon: FileText,
  },
  {
    index: "05",
    title: "Registration",
    description: "Plan your attendance and watch for registration announcements.",
    href: "/congresses/arlar27/registration",
    icon: CalendarDays,
  },
  {
    index: "06",
    title: "Programme",
    description: "Explore the four congress days as the programme takes shape.",
    href: "/congresses/arlar27/programme",
    icon: BookOpen,
  },
  {
    index: "07",
    title: "About Iraq",
    description: "Start planning your time in Baghdad, the host city of ArLAR27.",
    href: "/congresses/arlar27/about-iraq",
    icon: MapPin,
  },
] as const;

export const arlar27Days = [
  { day: "Day 01", date: "Wednesday, 24 March", state: "Programme to be announced" },
  { day: "Day 02", date: "Thursday, 25 March", state: "Programme to be announced" },
  { day: "Day 03", date: "Friday, 26 March", state: "Programme to be announced" },
  { day: "Day 04", date: "Saturday, 27 March", state: "Programme to be announced" },
] as const;

export const arlar27Welcome = {
  pageTitle: "Welcome to ArLAR27",
  pageDescription: "A new chapter for regional science, collaboration, and rheumatology education begins in Baghdad.",
  greeting: "Dear Colleagues, Partners, and Guests,",
  paragraphs: [
    "ArLAR is pleased to welcome the rheumatology community to Baghdad for its 27th annual congress. From 24 to 27 March 2027, colleagues from across the Arab region and beyond will come together around a shared commitment to stronger science, closer collaboration, and better care.",
    "ArLAR27 is being shaped as a place to exchange ideas, strengthen professional relationships, and look confidently toward the future of rheumatology. Its scientific programme, faculty, and participation opportunities will be announced as preparations progress.",
    "We invite you to save the date, follow the congress updates, and prepare to join us in Iraq for four memorable days of learning and connection.",
  ],
  closing: "We look forward to welcoming you to Baghdad.",
  signoff: "Warm regards,",
  authorDoctorId: "nizar-abdullateef-jasim",
  authorRoles: [
    "President of ArLAR",
    "President of the Iraqi League for Bone and Joint Health",
  ],
} as const;

export type Arlar27PersonPlacement = {
  id: string;
  doctorId: string;
  role: string;
  group: string;
  published: boolean;
};

export const arlar27Committee: Arlar27PersonPlacement[] = [
  {
    id: "honorary-president",
    doctorId: "ziad-al-rawi",
    role: "Honorary President of ArLAR27",
    group: "Congress leadership",
    published: true,
  },
  {
    id: "congress-president",
    doctorId: "nizar-abdullateef-jasim",
    role: "President of ArLAR",
    group: "Congress leadership",
    published: true,
  },
];

export const arlar27Faculty: Arlar27PersonPlacement[] = [];

export const arlar27ExternalDestinations = {
  abstracts: { label: "Abstract submission", url: "", enabled: false },
  registration: { label: "Registration", url: "", enabled: false },
} as const;

export const arlar27AboutIraq = {
  pageTitle: "About Iraq",
  pageDescription: "Meet in Baghdad—a historic capital and the host city for four days of regional scientific exchange.",
  destinationLabel: "Congress destination",
  destination: "Baghdad, Iraq",
  heading: "A meeting place with a long intellectual history.",
  paragraphs: [
    "Baghdad welcomes ArLAR27 as colleagues from across the region gather to exchange knowledge and shape what comes next for rheumatology. The Tigris, the city’s cultural life, and Iraq’s tradition of scholarship form a distinctive setting for the congress.",
    "Confirmed venue, accommodation, travel, and local congress information will be added here as planning advances.",
  ],
  planningTitle: "Travel information, as it is confirmed.",
  planningCards: [
    { id: "venue", title: "Venue", text: "The congress venue and recommended accommodation will be announced once arrangements are confirmed." },
    { id: "travel", title: "Travel", text: "Airport, transfer, and arrival guidance will be published for registered participants." },
    { id: "entry", title: "Entry requirements", text: "Travellers should verify current passport and visa requirements with the relevant Iraqi authorities before travel." },
    { id: "local", title: "Local information", text: "Practical guidance for your time in Baghdad will be added closer to the congress." },
  ],
  essentials: {
    eyebrow: "Good to know",
    title: "Iraq at a glance.",
    intro: "The practical details worth knowing before you pack for Baghdad.",
    cards: [
      { id: "currency", icon: "currency", label: "Currency", value: "Iraqi dinar (IQD)", note: "Cash is widely used; carry US dollars to exchange." },
      { id: "languages", icon: "languages", label: "Official languages", value: "Arabic and Kurdish", note: "The congress language is English." },
      { id: "timezone", icon: "clock", label: "Time zone", value: "UTC+3", note: "Iraq does not observe daylight saving." },
      { id: "power", icon: "power", label: "Electricity", value: "230 V · 50 Hz", note: "Plug types C, D and G." },
      { id: "dialling", icon: "phone", label: "Dialling code", value: "+964", note: "Local SIM cards are sold at the airport." },
      { id: "airport", icon: "plane", label: "Airport", value: "Baghdad International (BGW)", note: "About 16 km west of the city centre." },
    ],
  },
  gallery: {
    eyebrow: "Gallery",
    title: "Glimpses of Iraq.",
    intro: "A first look at the country hosting ArLAR27. Hover to pause the strip.",
  },
  visa: {
    eyebrow: "Entry and visas",
    title: "Arrange your visa before you travel.",
    lead: "Federal Iraq no longer issues visas on arrival. Eligible travellers apply online through the government portal and arrive with the visa already approved.",
    ctaLabel: "Open the official visa portal",
    portalUrl: "https://evisa.iq",
    facts: [
      { id: "apply", title: "Apply online, before you fly", text: "Around 37 nationalities can apply through the official portal. Visa on arrival ended for federal Iraq on 1 March 2025." },
      { id: "cost", title: "Cost", text: "Approximately US$160 for a single-entry visa, including the mandatory health insurance." },
      { id: "timing", title: "When to apply", text: "At least 24 hours before departure, though two weeks ahead leaves room for questions." },
      { id: "passport", title: "Passport", text: "Valid for at least six months from arrival, with at least one blank page." },
    ],
    note: "Entry rules change. Confirm the current requirements on the official portal, and with the Iraqi diplomatic mission in your country, before booking travel.",
  },
  weather: {
    eyebrow: "Weather",
    title: "March in Baghdad.",
    intro: "Spring arrives with warm afternoons and cool evenings — comfortable conditions for four days of congress, and for exploring the city between sessions. Bring a light jacket for the evenings.",
    stats: [
      { id: "high", label: "Average high", value: "25°C" },
      { id: "low", label: "Average low", value: "10°C" },
      { id: "rain", label: "Rainfall", value: "Low" },
      { id: "humidity", label: "Humidity", value: "27–43%" },
    ],
  },
} as const;
