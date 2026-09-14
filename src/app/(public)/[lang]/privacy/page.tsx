import { createStaticPageMetadata } from "@/lib/seo";

import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import type { Locale } from "@/i18n/config";

export const generateMetadata = createStaticPageMetadata("/privacy");

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    paragraphs: [
      "The Arab League of Associations for Rheumatology (ArLAR) is a regional professional organisation connecting national rheumatology associations and supporting education, research, scientific exchange, and professional collaboration.",
      "For questions about this policy or the use of personal information, contact the ArLAR Secretariat at info.arlar@arabrheumatology.org.",
    ],
  },
  {
    id: "information-we-handle",
    title: "Information we may handle",
    paragraphs: [
      "The information involved depends on how you use the website and which ArLAR activity you choose to access.",
    ],
    bullets: [
      "Contact details such as your name, email address, telephone number, country, role, and organisation.",
      "The content of enquiries, submissions, membership communications, or partnership requests.",
      "Newsletter preferences and event, webinar, or programme registration details.",
      "Routine technical information such as IP address, browser and device type, access time, requested pages, referring page, and security logs.",
    ],
    notice:
      "Please do not send confidential medical records or request medical advice through this website. ArLAR is a professional organisation and does not provide diagnosis, treatment, referrals, or emergency care.",
  },
  {
    id: "forms-and-email",
    title: "Forms, email, and subscriptions",
    paragraphs: [
      "The website contact form prepares an email in your own email application. The form content is not submitted to a website database by that action; it reaches ArLAR only if you choose to send the prepared message through your email provider.",
      "If you subscribe to updates, register for an event, or submit information through another ArLAR or partner form, the details requested by that service may be processed to administer the relevant communication or activity. A third-party registration service may also apply its own privacy notice.",
    ],
  },
  {
    id: "how-we-use-information",
    title: "How information is used",
    bullets: [
      "Responding to enquiries and communicating with members, speakers, partners, and other professional contacts.",
      "Administering congresses, webinars, educational programmes, publications, and organisational activities.",
      "Sending requested news and announcements and managing subscription preferences.",
      "Operating, securing, maintaining, and improving the website and investigating misuse or technical problems.",
      "Meeting legal, regulatory, governance, accounting, or record-keeping obligations where applicable.",
    ],
    paragraphs: [
      "Where a legal basis is required, processing may rely on your consent, steps connected with a requested service, ArLAR's legitimate organisational interests, or compliance with a legal obligation. The basis depends on the activity and the law that applies.",
    ],
  },
  {
    id: "sharing-information",
    title: "When information may be shared",
    paragraphs: [
      "Access is limited to people and organisations that reasonably need the information for the relevant purpose. This may include authorised ArLAR officers, committees and Secretariat personnel; website, email, security, registration, or event-service providers; and an event or programme partner when necessary to fulfil your request.",
      "Information may also be disclosed when required by law, to protect rights or safety, or in connection with an organisational restructuring. ArLAR does not sell or trade personal information.",
    ],
  },
  {
    id: "external-services",
    title: "External websites and embedded content",
    paragraphs: [
      "The website includes links to social networks, member associations, journals, registration services, and other external websites. It also displays video content using YouTube's privacy-enhanced embed domain. External services may receive technical information when their content loads or when you interact with it.",
      "Those services operate under their own terms and privacy policies. ArLAR does not control their data practices, availability, or security.",
    ],
  },
  {
    id: "retention-and-security",
    title: "Retention and security",
    paragraphs: [
      "Personal information is kept only for as long as reasonably necessary for the purpose for which it was received, for legitimate organisational records, or to meet an applicable legal requirement. Retention periods vary by activity. Information that is no longer required is deleted, anonymised, or securely archived as appropriate.",
      "ArLAR and its service providers use reasonable administrative and technical safeguards. No internet transmission or storage system can, however, be guaranteed to be completely secure.",
    ],
  },
  {
    id: "international-use",
    title: "International processing",
    paragraphs: [
      "ArLAR works across multiple countries, and its website and service providers may operate in different jurisdictions. Personal information may therefore be accessed or processed outside the country where it was provided. Where required, appropriate safeguards will be used for such transfers.",
    ],
  },
  {
    id: "your-choices",
    title: "Your rights and choices",
    paragraphs: [
      "Depending on the law that applies to you, you may have rights to request access to personal information, correct inaccurate information, request deletion or restriction, object to certain processing, withdraw consent, or receive a portable copy of information you supplied.",
      "You may unsubscribe from promotional updates using the method provided in the message or by contacting the Secretariat. A request may require reasonable identity verification, and some information may need to be retained where the law permits or requires it.",
    ],
  },
  {
    id: "children-and-updates",
    title: "Children and policy updates",
    paragraphs: [
      "The website is primarily intended for healthcare professionals, member organisations, partners, and adults seeking general public information. ArLAR does not knowingly invite children to submit personal information directly through the website.",
      "This policy may be updated when the website, ArLAR services, or legal requirements change. The current version and its update date will remain available on this page.",
    ],
  },
];

export default async function PrivacyPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  return (
    <LegalPage
      locale={lang}
      title="Privacy Policy"
      description="How personal information may be handled when you use the ArLAR website, contact the Secretariat, or access an ArLAR activity."
      updated="16 August 2026"
      grainId="privacy-hero-grain"
      introduction="ArLAR respects the privacy of its members, healthcare professionals, partners, and website visitors. This policy explains the information that may be involved, why it may be used, and the choices available to you."
      sections={sections}
      relatedHref="/terms"
      relatedLabel="Read the terms and conditions"
    />
  );
}
