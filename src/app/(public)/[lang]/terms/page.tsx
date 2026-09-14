import { createStaticPageMetadata } from "@/lib/seo";
import Link from "next/link";

import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { localizePath, type Locale } from "@/i18n/config";

export const generateMetadata = createStaticPageMetadata("/terms");

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    paragraphs: [
      "These terms apply to your use of the ArLAR website and the material, links, tools, and services made available through it. By using the website, you agree to these terms and the Privacy Policy. If you do not agree, please do not use the website.",
    ],
  },
  {
    id: "about-arlar",
    title: "About ArLAR and this website",
    paragraphs: [
      "The Arab League of Associations for Rheumatology (ArLAR) is a regional professional organisation supporting rheumatology education, research, scientific exchange, and collaboration among national associations and healthcare professionals.",
      "The website provides organisational information, educational resources, publications, news, professional directories, event information, and selected public information. Features and content may change as ArLAR's activities develop.",
    ],
  },
  {
    id: "medical-disclaimer",
    title: "No medical advice or emergency service",
    paragraphs: [
      "Website content is provided for general information, professional education, and scientific communication. It is not personalised medical advice and must not be used as a substitute for consultation, diagnosis, or treatment by an appropriately qualified healthcare professional.",
      "ArLAR does not provide patient consultations, physician referrals, prescriptions, emergency assistance, or individual treatment recommendations through this website or its contact channels.",
    ],
    notice:
      "If you have a medical concern, contact a qualified healthcare professional. For an emergency, contact the emergency service available in your location.",
  },
  {
    id: "professional-use",
    title: "Professional and educational use",
    paragraphs: [
      "Clinical, scientific, and educational material may discuss evolving evidence, off-label uses, differing guidelines, or practices that vary by country. Healthcare professionals remain responsible for exercising independent professional judgment, checking current primary sources and local requirements, and considering the circumstances of each patient.",
      "A speaker's, author's, committee's, partner's, or external contributor's views are their own unless ArLAR expressly states otherwise.",
    ],
  },
  {
    id: "accuracy",
    title: "Accuracy and availability of information",
    paragraphs: [
      "ArLAR aims to present useful and reliable information but does not guarantee that every item is complete, current, error-free, or suitable for a particular purpose. Dates, programmes, speakers, availability, links, and other details may change without notice.",
      "Archived material is retained for reference and may not reflect the latest evidence, guidance, or organisational position. Publication on the website does not itself constitute endorsement of every statement or linked resource.",
    ],
  },
  {
    id: "permitted-use",
    title: "Permitted use",
    paragraphs: ["You may browse and use the website for lawful personal, educational, and professional purposes."],
    bullets: [
      "Do not interfere with the website, its security, or another visitor's access.",
      "Do not introduce malicious code, scrape at a harmful rate, or attempt unauthorised access.",
      "Do not impersonate ArLAR or another person, misrepresent affiliation, or submit unlawful or misleading material.",
      "Do not reproduce, sell, or commercially exploit protected material without the necessary permission.",
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    paragraphs: [
      "Unless stated otherwise, the website design, ArLAR name and marks, original text, graphics, databases, and other ArLAR-created material are owned by or licensed to ArLAR and are protected by applicable intellectual-property laws.",
      "Materials credited to speakers, authors, publishers, member associations, partners, or other third parties remain subject to their respective rights and licence terms. Limited downloading or printing for personal professional reference does not transfer ownership or permit republication, modification, or commercial distribution.",
    ],
  },
  {
    id: "submissions",
    title: "Enquiries and submitted material",
    paragraphs: [
      "You are responsible for ensuring that information you send is accurate, lawful, and appropriate to share. Do not submit confidential medical records, material that infringes another person's rights, or content you are not authorised to disclose.",
      "If you provide material for possible publication or programme use, any publication, editing, attribution, or reuse will be subject to the permissions and arrangements agreed for that submission.",
    ],
  },
  {
    id: "events",
    title: "Events, registrations, and certificates",
    paragraphs: [
      "Congress, webinar, course, and event participation may be governed by additional registration, payment, accreditation, cancellation, attendance, and conduct terms supplied for that activity. If activity-specific terms conflict with these website terms, the activity-specific terms govern that activity.",
      "Registration does not guarantee admission, accreditation, certification, speaker availability, or an unchanged programme unless expressly confirmed by the relevant organiser.",
    ],
  },
  {
    id: "external-services",
    title: "External links and embedded services",
    paragraphs: [
      "The website links to and embeds content from third parties, including video platforms, journals, member associations, social networks, registration providers, and partner websites. These services are provided for convenience and operate under their own terms and privacy practices.",
      "ArLAR is not responsible for external content, availability, security, transactions, or changes. A link, logo, or embedded item does not necessarily imply endorsement unless explicitly stated.",
    ],
  },
  {
    id: "availability-and-security",
    title: "Website availability and security",
    paragraphs: [
      "ArLAR may update, suspend, restrict, or discontinue any part of the website for maintenance, security, legal, or organisational reasons. Continuous or error-free access is not guaranteed.",
      "You are responsible for using suitable device security and for deciding whether a download or external resource is appropriate for your systems.",
    ],
  },
  {
    id: "liability",
    title: "Disclaimers and limitation of liability",
    paragraphs: [
      "To the maximum extent permitted by applicable law, the website and its content are provided on an as-available basis without warranties of accuracy, fitness for a particular purpose, uninterrupted access, or non-infringement.",
      "To the maximum extent permitted by law, ArLAR is not liable for indirect or consequential loss arising from reliance on website content, inability to access the website, use of external services, or unauthorised interference beyond ArLAR's reasonable control. Nothing in these terms excludes or limits liability that cannot lawfully be excluded or limited.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    paragraphs: [
      <>
        Personal information associated with website use is addressed in the{" "}
        <Link href="/privacy" className="font-semibold text-crimson-700 underline decoration-crimson-200 underline-offset-4 hover:text-crimson-900">
          ArLAR Privacy Policy
        </Link>
        . External services apply their own privacy notices.
      </>,
    ],
  },
  {
    id: "changes-and-contact",
    title: "Changes, interpretation, and contact",
    paragraphs: [
      "ArLAR may revise these terms when the website, services, or applicable requirements change. Continued use after an updated version is published means the new terms apply from that point forward.",
      "If part of these terms is found unenforceable, the remaining provisions continue to apply. Any issue will be considered under the applicable laws and competent procedures relevant to the circumstances.",
      "Questions about these terms may be sent to info.arlar@arabrheumatology.org.",
    ],
  },
];

export default async function TermsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const localizedSections = sections.map((section) =>
    section.id === "privacy"
      ? {
          ...section,
          paragraphs: [
            lang === "ar" ? (
              <>
                تُوضَّح كيفية التعامل مع المعلومات الشخصية المرتبطة باستخدام الموقع في{" "}
                <Link href={localizePath("/privacy", lang)} className="font-semibold text-crimson-700 underline decoration-crimson-200 underline-offset-4 hover:text-crimson-900">
                  سياسة خصوصية الرابطة
                </Link>
                . وتطبق الخدمات الخارجية إشعارات الخصوصية الخاصة بها.
              </>
            ) : (
              <>
                Personal information associated with website use is addressed in the{" "}
                <Link href={localizePath("/privacy", lang)} className="font-semibold text-crimson-700 underline decoration-crimson-200 underline-offset-4 hover:text-crimson-900">
                  ArLAR Privacy Policy
                </Link>
                . External services apply their own privacy notices.
              </>
            ),
          ],
        }
      : section,
  );
  return (
    <LegalPage
      locale={lang}
      title="Terms & Conditions"
      description="The conditions that apply when you browse the ArLAR website and use its professional, educational, and public resources."
      updated="16 August 2026"
      grainId="terms-hero-grain"
      introduction="These terms establish a clear, practical framework for using the ArLAR website. They protect the educational purpose of its content, distinguish organisational information from medical advice, and explain responsibilities when accessing ArLAR and third-party resources."
      sections={localizedSections}
      relatedHref="/privacy"
      relatedLabel="Read the privacy policy"
    />
  );
}
