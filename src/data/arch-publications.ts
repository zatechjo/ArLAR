export type ArchPublication = {
  id: string;
  title: string;
  journal: string;
  year: string;
  identifier: string;
  href: string;
  authors: string[];
};

export const archPublications: ArchPublication[] = [
  {
    id: "arch-rheumatology-workforce",
    title:
      "The rheumatology workforce in the Arab countries: current status, challenges, opportunities, and future needs from an ArLAR cross-sectional survey",
    journal: "Rheumatology International",
    year: "2023",
    identifier: "PMID 37624401",
    href: "https://pubmed.ncbi.nlm.nih.gov/37624401/",
    authors: [
      "Nelly Ziadé",
      "Ihsane Hmamouchi",
      "Chafika Haouichat",
      "Fatemah Baron",
      "Sulaiman Al Mayouf",
      "Nizar Abdulateef",
      "Basel Masri",
      "Manal El Rakawi",
      "Lina El Kibbi",
      "Manal El Mashaleh",
      "Bassel Elzorkany",
      "Jamal Al Saleh",
      "Christian Dejaco",
      "Fatemah Abutiban",
    ],
  },
  {
    id: "arch-rheumatologist-burnout",
    title:
      "Burnout syndrome among rheumatologists and rheumatology fellows in Arab countries: an ArLAR multinational study",
    journal: "Clinical Rheumatology",
    year: "2023",
    identifier: "PMID 38012468",
    href: "https://pubmed.ncbi.nlm.nih.gov/38012468/",
    authors: [
      "Rita Naim",
      "Nelly Ziadé",
      "Chafika Haouichat",
      "Fatemah Baron",
      "Sulaiman M Al-Mayouf",
      "Nizar Abdulateef",
      "Basel Masri",
      "Manal El Rakawi",
      "Lina El Kibbi",
      "Manal Al Mashaleh",
      "Fatemah Abutiban",
      "Ihsane Hmamouchi",
    ],
  },
  {
    id: "arch-tactic-psaid",
    title:
      "Is the patient-perceived impact of psoriatic arthritis a global concept? An international study in 13 Arab countries (TACTIC study)",
    journal: "Rheumatology",
    year: "2024",
    identifier: "PMID 38498150",
    href: "https://pubmed.ncbi.nlm.nih.gov/38498150/",
    authors: [
      "Nelly Ziadé",
      "Noura Abbas",
      "Ihsane Hmamouchi",
      "Lina El Kibbi",
      "Avin Maroof",
      "Bassel Elzorkany",
      "Nizar Abdulateef",
      "Asal Adnan",
      "Nabaa Ihsan Awadh",
      "Faiq Isho Gorial",
      "Nada Alchama",
      "Chafika Haouichat",
      "Fatima Alnaimat",
      "Suad Hannawi",
      "Saed Atawnah",
      "Hussein Halabi",
      "Manal Al Mashaleh",
      "Laila Aljazwi",
      "Ahmed Abogamal",
      "Laila Ayoub",
      "Elyes Bouajina",
      "Rachid Bahiri",
      "Sahar Saad",
      "Maha Sabkar",
      "Krystel Aouad",
      "Laure Gossec",
    ],
  },
  {
    id: "arch-aaaa-awareness",
    title:
      "Shaping awareness about rheumatic and musculoskeletal diseases in the Arab region: The Arab Adult Arthritis Awareness Group initiative",
    journal: "Arab Journal of Rheumatology",
    year: "2024",
    identifier: "DOI 10.4103/ajr.ajr_3_24",
    href: "https://journals.lww.com/ajrh/fulltext/2024/02010/shaping_awareness_about_rheumatic_and.1.aspx",
    authors: [
      "Lina El Kibbi",
      "Hussein Halabi",
      "Basel Masri",
      "Ihsane Hmamouchi",
      "Mona Metawee",
      "Khalid Alnaqbi",
      "Wafa Hamdi",
      "Fatemah Abutiban",
      "Sima Abu Al-Saoud",
      "Nasra Al Adhoubi",
      "Samar Al Emadi",
      "Sahar Saad",
      "Malak M. Aburas",
      "Nelly Ziade",
    ],
  },
];

export default archPublications;
