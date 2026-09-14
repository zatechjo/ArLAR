export type PatientFaqCategory =
  | "rheumatology"
  | "daily-life"
  | "treatment"
  | "covid";

export type PatientFaq = {
  id: string;
  category: PatientFaqCategory;
  question: string;
  answer: string[];
  sourceLabel?: string;
  sourceHref?: string;
  urgent?: boolean;
};

export const patientFaqCategories = [
  {
    id: "all",
    label: "All questions",
    shortLabel: "All",
    description: "Browse the complete patient information centre.",
  },
  {
    id: "rheumatology",
    label: "Understanding rheumatology",
    shortLabel: "Rheumatology",
    description: "The specialty, common symptoms, referrals, and appointments.",
  },
  {
    id: "daily-life",
    label: "Living with a rheumatic disease",
    shortLabel: "Daily life",
    description: "Movement, food, fatigue, pregnancy, work, and flare planning.",
  },
  {
    id: "treatment",
    label: "Treatment and medicine safety",
    shortLabel: "Treatment",
    description: "Medicines, vaccines, side effects, and safer decision-making.",
  },
  {
    id: "covid",
    label: "COVID-19 and rheumatic diseases",
    shortLabel: "COVID-19",
    description: "Updated answers for people with rheumatic conditions.",
  },
] as const;

const whoCovid =
  "https://www.who.int/news-room/questions-and-answers/item/coronavirus-disease-covid-19-masks";
const cdcTreatment = "https://www.cdc.gov/covid/treatment/index.html";
const cdcImmunocompromised =
  "https://www.cdc.gov/covid/hcp/clinical-care/considerations-special-groups.html";
const eularCovid =
  "https://www.eular.org/rheumatic-musculoskeletal-diseases-and-covid-19-repository-for-clinicians";

export const patientFaqs: PatientFaq[] = [
  {
    id: "what-is-rheumatology",
    category: "rheumatology",
    question: "What is rheumatology?",
    answer: [
      "Rheumatology is the medical specialty concerned with rheumatic and musculoskeletal diseases. These conditions can affect joints, bones, muscles, ligaments, and soft tissues.",
      "Some rheumatic diseases are systemic, meaning they may also involve the immune system and organs such as the skin, eyes, kidneys, heart, lungs, nervous system, or digestive system—with or without visible joint inflammation.",
    ],
  },
  {
    id: "what-is-rheumatologist",
    category: "rheumatology",
    question: "What is a rheumatologist?",
    answer: [
      "A rheumatologist is a physician with specialist training in diagnosing and treating rheumatic and musculoskeletal diseases. Adult rheumatologists train through internal medicine; pediatric rheumatologists first train in pediatrics and then specialize further.",
    ],
  },
  {
    id: "what-diseases-include",
    category: "rheumatology",
    question: "What do rheumatic and musculoskeletal diseases include?",
    answer: [
      "There are more than 200 rheumatic and musculoskeletal diseases. Examples include rheumatoid arthritis, ankylosing spondylitis, systemic lupus erythematosus, connective-tissue diseases, vasculitis, Behçet disease, psoriatic arthritis, and osteoporosis.",
      "The specialty also evaluates many causes of joint and muscle pain, including persistent pain in the back, neck, shoulders, hips, knees, ankles, and feet.",
    ],
  },
  {
    id: "joint-pain-arthritis",
    category: "rheumatology",
    question: "Does joint pain always mean I have arthritis?",
    answer: [
      "No. Joint pain can come from injury, overuse, tendons, muscles, infections, nerve problems, or many other causes. Arthritis specifically means inflammation or structural disease involving a joint.",
      "A clinician can use your history, examination, and—when needed—tests or imaging to identify the likely cause.",
    ],
  },
  {
    id: "when-see-rheumatologist",
    category: "rheumatology",
    question: "When should I ask to see a rheumatologist?",
    answer: [
      "Consider medical assessment for persistent joint swelling, prolonged morning stiffness, unexplained muscle weakness, recurring inflammation, or joint pain accompanied by symptoms such as rash, eye inflammation, mouth ulcers, fever, or marked fatigue.",
      "Seek urgent care for a suddenly hot and swollen joint with fever, severe breathing difficulty, chest pain, new weakness, or other rapidly worsening symptoms.",
    ],
    urgent: true,
  },
  {
    id: "first-appointment",
    category: "rheumatology",
    question: "What happens at a first rheumatology appointment?",
    answer: [
      "The rheumatologist will usually ask when your symptoms began, how they change through the day, what makes them better or worse, and whether other body systems are affected. They will examine relevant joints and other areas.",
      "Bring your medication list, allergies, previous laboratory and imaging reports, relevant medical history, and a short timeline of your symptoms. Not every patient needs every test.",
    ],
  },
  {
    id: "normal-blood-tests",
    category: "rheumatology",
    question: "Can I have a rheumatic disease even if my blood tests are normal?",
    answer: [
      "Yes. Blood tests are only one part of diagnosis, and some rheumatic conditions do not have a single confirmatory test. Results must be interpreted alongside symptoms, examination findings, and sometimes imaging.",
      "A positive test also does not always mean that a person has a disease, so avoid interpreting results without clinical context.",
    ],
  },
  {
    id: "children-rheumatic-disease",
    category: "rheumatology",
    question: "Can children develop rheumatic diseases?",
    answer: [
      "Yes. Children can develop inflammatory arthritis and other rheumatic diseases. Persistent joint swelling, stiffness, unexplained limping, recurring fever, rash, or reduced activity should be discussed with a pediatric clinician, who may refer to a pediatric rheumatologist.",
    ],
  },
  {
    id: "contagious",
    category: "daily-life",
    question: "Are rheumatic diseases contagious?",
    answer: [
      "Most rheumatic diseases are not contagious and cannot be passed from one person to another. Some infections can cause joint symptoms, but that is different from a chronic autoimmune rheumatic disease.",
    ],
  },
  {
    id: "cure-control",
    category: "daily-life",
    question: "Can rheumatic diseases be cured?",
    answer: [
      "Some conditions resolve, while many inflammatory rheumatic diseases are long-term. Even when there is no permanent cure, early diagnosis and appropriate treatment can control inflammation, reduce pain and damage, and help people maintain active lives.",
      "Treatment goals and outlook differ by condition and by person.",
    ],
  },
  {
    id: "exercise",
    category: "daily-life",
    question: "Is exercise safe when I have arthritis or another rheumatic disease?",
    answer: [
      "For most people, suitable movement helps preserve strength, joint function, balance, sleep, and general health. The right type and intensity depend on your condition, current inflammation, and fitness.",
      "Start gradually and ask your clinician or physiotherapist how to adapt activity during a flare, after surgery, or when a joint is acutely swollen.",
    ],
  },
  {
    id: "diet",
    category: "daily-life",
    question: "Is there a special diet that treats rheumatic disease?",
    answer: [
      "No single diet has been proven to cure rheumatic disease. A varied eating pattern built around vegetables, fruit, whole grains, legumes, appropriate protein, and unsaturated fats can support overall health and a healthy weight.",
      "Discuss major restrictions, fasting, or supplements with your healthcare team—especially if you have kidney disease, osteoporosis, gout, diabetes, or medicines that interact with food or supplements.",
    ],
  },
  {
    id: "fatigue",
    category: "daily-life",
    question: "Why can rheumatic disease cause so much fatigue?",
    answer: [
      "Fatigue may be related to inflammation, pain, poor sleep, anemia, mood, reduced activity, medication effects, or another health condition. It is real and can persist even when joint symptoms are less obvious.",
      "Tell your clinical team if fatigue is new, severe, or worsening so treatable causes can be considered.",
    ],
  },
  {
    id: "flare-plan",
    category: "daily-life",
    question: "What should I do when I think I am having a flare?",
    answer: [
      "Follow the flare plan agreed with your rheumatology team. Note which symptoms changed, when they began, possible triggers, temperature if relevant, and whether you missed medicine.",
      "Do not increase steroids or restart, stop, or double prescription medicines unless your clinician has already given you a specific plan. Contact your team if the flare is unusual, severe, or not settling.",
    ],
  },
  {
    id: "pregnancy",
    category: "daily-life",
    question: "Can I plan a pregnancy while living with a rheumatic disease?",
    answer: [
      "Many people with rheumatic diseases have successful pregnancies. Planning matters because disease activity and some medicines can affect pregnancy, while stopping treatment without a plan can cause a flare.",
      "Speak with your rheumatologist before trying to conceive—and as early as possible if pregnancy occurs unexpectedly—so medicines and disease control can be reviewed safely. This applies to patients of any sex whose medicines may affect conception or pregnancy.",
    ],
  },
  {
    id: "work-travel",
    category: "daily-life",
    question: "Can I continue working and travelling?",
    answer: [
      "Many people can continue both with sensible planning. Workplace adjustments, movement breaks, ergonomic equipment, medicine storage, insurance, vaccination, and carrying a medication summary may help.",
      "Discuss long travel, live vaccines, recent surgery, clot risk, or significant immune suppression with your healthcare team in advance.",
    ],
  },
  {
    id: "medicine-when-well",
    category: "treatment",
    question: "Why should I keep taking medicine when I feel well?",
    answer: [
      "Feeling well may mean the treatment is controlling the disease. Stopping suddenly can allow inflammation to return and may make future control more difficult.",
      "Do not stop or change prescription medicine without discussing the benefits, risks, and alternatives with your rheumatology team.",
    ],
  },
  {
    id: "side-effects",
    category: "treatment",
    question: "What should I do if I think a medicine is causing side effects?",
    answer: [
      "Contact your prescribing team or pharmacist and explain the medicine, dose, timing, and symptoms. They can advise whether you need monitoring, a dose change, an alternative, or urgent assessment.",
      "Seek urgent care for difficulty breathing, swelling of the face or throat, fainting, a severe widespread rash, or other signs of a serious reaction. Do not stop long-term corticosteroids suddenly unless a clinician directs you.",
    ],
    urgent: true,
  },
  {
    id: "vaccinations",
    category: "treatment",
    question: "Can I receive vaccines while taking rheumatology medicine?",
    answer: [
      "Vaccination is an important part of preventive care. Many non-live vaccines can be given safely, but immune-suppressing medicines may affect timing or the immune response. Live vaccines require special consideration.",
      "Ask your rheumatology team to review your vaccine plan before starting a new immune-suppressing treatment and before receiving a live vaccine.",
    ],
  },
  {
    id: "supplements",
    category: "treatment",
    question: "Are vitamins, herbs, or supplements safe with my medicines?",
    answer: [
      "Natural does not always mean safe. Supplements can affect the liver or kidneys, alter bleeding risk, or interact with prescription medicines. Product quality and dose may also vary.",
      "Show your clinician or pharmacist the exact product and dose before starting it. Supplements should not replace disease-modifying treatment.",
    ],
  },
  {
    id: "pain-relief",
    category: "treatment",
    question: "Which pain reliever should I use?",
    answer: [
      "The safest option depends on your diagnosis, age, pregnancy status, kidney and liver health, stomach or bleeding risk, heart disease, allergies, and other medicines. Anti-inflammatory drugs are not appropriate for everyone.",
      "Ask a clinician or pharmacist for individual advice instead of combining over-the-counter products or taking someone else’s prescription.",
    ],
  },
  {
    id: "monitoring-tests",
    category: "treatment",
    question: "Why do some rheumatology medicines require regular blood tests?",
    answer: [
      "Monitoring can check whether treatment is working and identify changes in blood counts, liver function, kidney function, or inflammation before they cause symptoms. The schedule depends on the medicine and your health.",
      "Keep the agreed appointments and ask your team what to do if a test is delayed.",
    ],
  },
  {
    id: "covid-no-symptoms-medicine",
    category: "covid",
    question: "I take immunosuppressive treatment but have no infection symptoms. Should I stop it to lower my COVID-19 risk?",
    answer: [
      "Do not stop or reduce rheumatology medicine on your own. Interrupting treatment can trigger a disease flare. Continue it as prescribed unless your rheumatologist gives you a different plan for your specific medicine or situation.",
      "Keep vaccinations and preventive measures appropriate to your risk up to date with advice from your local health authority and clinical team.",
    ],
    sourceLabel: "EULAR rheumatology guidance",
    sourceHref: eularCovid,
  },
  {
    id: "covid-workplace",
    category: "covid",
    question: "I work with many people. Should I ask to work from home?",
    answer: [
      "Risk depends on your health, treatment, local respiratory-virus activity, ventilation, and the amount of close contact at work. If you are at higher risk of severe illness, discuss practical adjustments with your clinician and employer.",
      "Options may include improved ventilation, a well-fitting mask during higher-risk periods, flexible hours, avoiding close contact with unwell colleagues, or remote work when medically appropriate.",
    ],
    sourceLabel: "WHO public guidance",
    sourceHref: whoCovid,
  },
  {
    id: "covid-household-risk",
    category: "covid",
    question: "I live with someone at high risk from COVID-19. What precautions should we take?",
    answer: [
      "Use layered precautions when someone has symptoms, a recent exposure, or a positive test: improve indoor ventilation, avoid close face-to-face contact where possible, consider well-fitting masks in shared spaces, and follow local advice on testing.",
      "Have a plan for contacting a clinician promptly because high-risk people may benefit from early treatment.",
    ],
    sourceLabel: "WHO public guidance",
    sourceHref: whoCovid,
  },
  {
    id: "covid-symptoms-medicine",
    category: "covid",
    question: "If I develop fever, cough, or other COVID-19 symptoms, should I stop my rheumatology medicine?",
    answer: [
      "Contact your rheumatology team or another qualified clinician promptly for medicine-specific advice. The correct decision differs between medicines, infection severity, and individual risk.",
      "Do not stop corticosteroids suddenly. If you are at increased risk of severe COVID-19, seek testing and treatment advice early because antiviral treatment works best when started within the first few days of symptoms.",
    ],
    sourceLabel: "Current CDC treatment guidance",
    sourceHref: cdcTreatment,
  },
  {
    id: "covid-severity-risk",
    category: "covid",
    question: "Are people with rheumatic disease or those taking prednisone, DMARDs, biologics, or JAK inhibitors at greater risk?",
    answer: [
      "Risk is not the same for everyone. Age, vaccination status, other medical conditions, the rheumatic disease itself, disease activity, corticosteroid dose, and some immune-suppressing treatments can all matter.",
      "People who are moderately or severely immunocompromised may have a higher risk of severe COVID-19 and a weaker vaccine response. Ask your clinician for a personalized prevention and early-treatment plan.",
    ],
    sourceLabel: "Current guidance for immunocompromised people",
    sourceHref: cdcImmunocompromised,
  },
  {
    id: "covid-prevention-treatment",
    category: "covid",
    question: "Are medicines available to prevent or treat COVID-19?",
    answer: [
      "Yes. Vaccination remains important, early antiviral treatments are available for eligible people at higher risk, and some moderately or severely immunocompromised people may qualify for additional preventive medicine where available.",
      "Eligibility, availability, interactions, and timing vary by country. Contact a clinician promptly after symptoms or a positive test—treatment generally needs to begin within five to seven days of symptom onset.",
    ],
    sourceLabel: "Current CDC treatment guidance",
    sourceHref: cdcTreatment,
  },
  {
    id: "covid-protection",
    category: "covid",
    question: "What can I do to reduce my chance of catching or spreading COVID-19?",
    answer: [
      "Stay up to date with locally recommended vaccination, improve ventilation in shared indoor spaces, stay away from others when unwell, practise hand and respiratory hygiene, and consider a well-fitting mask in crowded or poorly ventilated settings or when your personal risk is high.",
      "No single measure is perfect; combining measures provides better protection during higher-risk situations.",
    ],
    sourceLabel: "WHO public guidance",
    sourceHref: whoCovid,
  },
  {
    id: "covid-other-vaccines",
    category: "covid",
    question: "What should patients and healthcare providers do about vaccination?",
    answer: [
      "Review COVID-19 and routine vaccinations with your clinical team. Influenza, pneumococcal, shingles, and other vaccines may be recommended according to your age, condition, medicine, and national schedule.",
      "Some treatments affect vaccine timing or response, so coordinate rather than pausing medicine on your own.",
    ],
    sourceLabel: "EULAR patient guidance",
    sourceHref: eularCovid,
  },
  {
    id: "covid-hydroxychloroquine",
    category: "covid",
    question: "Can hydroxychloroquine prevent COVID-19?",
    answer: [
      "Hydroxychloroquine is not recommended to prevent COVID-19. If it is prescribed for your rheumatic disease, continue it according to your clinician’s instructions; do not change the dose to try to prevent or treat an infection.",
    ],
    sourceLabel: "Current CDC treatment guidance",
    sourceHref: cdcTreatment,
  },
  {
    id: "covid-biologics-treatment",
    category: "covid",
    question: "Have biologic or immune-modifying medicines been used to treat COVID-19?",
    answer: [
      "Certain immune-modifying medicines are used by hospital teams for selected patients with severe COVID-19, alongside other treatment. This does not mean that a person’s regular rheumatology biologic prevents or treats COVID-19.",
      "Never take or change a biologic for COVID-19 without specialist medical direction.",
    ],
    sourceLabel: "Current COVID-19 clinical guidance",
    sourceHref: cdcTreatment,
  },
  {
    id: "covid-biologic-immunity",
    category: "covid",
    question: "If I take a biologic, am I immunocompromised—and can I ‘boost’ my immunity?",
    answer: [
      "Some biologics and other rheumatology medicines suppress or modify parts of the immune system, but the degree varies. Your rheumatology team can explain your individual risk.",
      "There is no food or supplement that reliably ‘boosts’ immunity against COVID-19. Vaccination, sleep, movement, balanced nutrition, avoiding smoking, and a personal prevention plan are more useful. Check supplements for medicine interactions.",
    ],
    sourceLabel: "Current guidance for immunocompromised people",
    sourceHref: cdcImmunocompromised,
  },
  {
    id: "covid-testing-no-symptoms",
    category: "covid",
    question: "If I have no symptoms, should I test for COVID-19?",
    answer: [
      "Testing may be useful after a known exposure, before close contact with a highly vulnerable person, during an outbreak, or when required by local guidance. Recommendations vary by country and change over time.",
      "If you are high risk and develop even mild symptoms, seek testing or treatment advice promptly rather than waiting for symptoms to become severe.",
    ],
    sourceLabel: "Current CDC treatment guidance",
    sourceHref: cdcTreatment,
  },
  {
    id: "covid-basic-measures",
    category: "covid",
    question: "What are the basic protective measures against COVID-19?",
    answer: [
      "Improve indoor air by opening windows or using appropriate ventilation, avoid close contact when someone is unwell, clean your hands, cover coughs and sneezes, and stay home when sick. Masks add protection in crowded, enclosed, or poorly ventilated spaces.",
      "Follow your national public-health guidance because recommendations should reflect local conditions.",
    ],
    sourceLabel: "WHO public guidance",
    sourceHref: whoCovid,
  },
  {
    id: "covid-mask",
    category: "covid",
    question: "Do I need to wear a mask regularly?",
    answer: [
      "Mask use should reflect the situation and your personal risk. WHO recommends considering a well-fitting mask in crowded, enclosed, or poorly ventilated places; when you are unwell or recently exposed; when sharing space with someone who may have COVID-19; or when you are at high risk of severe illness.",
      "Use clean hands when handling the mask, make sure it fits over the nose and mouth, and replace it when wet, damaged, or dirty.",
    ],
    sourceLabel: "WHO mask guidance",
    sourceHref: whoCovid,
  },
  {
    id: "covid-emergency",
    category: "covid",
    question: "What should I do if I have fever, cough, and difficulty breathing?",
    answer: [
      "Seek urgent medical assessment, especially for trouble breathing, persistent chest pain or pressure, new confusion, inability to stay awake, bluish or pale lips, or rapid deterioration. Follow your local emergency-care instructions.",
      "Tell the treating team about your rheumatic disease, immune-suppressing medicines, allergies, and when symptoms began.",
    ],
    sourceLabel: "Current CDC treatment guidance",
    sourceHref: cdcTreatment,
    urgent: true,
  },
];

export const patientInformationSources = [
  { label: "WHO: COVID-19 masks and prevention", href: whoCovid },
  { label: "CDC: COVID-19 treatment", href: cdcTreatment },
  { label: "CDC: Immunocompromised people", href: cdcImmunocompromised },
  { label: "EULAR: RMD and COVID-19 guidance repository", href: eularCovid },
] as const;
