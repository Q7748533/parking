import { Metadata } from "next";
import { InfoPageShell } from "../info-page-shell";
import { OrganizationSchema } from "@/components/schemas/organization-schema";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Frequently Asked Questions - Airport Parking | AirportMatrix",
  description: "Find answers to common questions about airport parking. Learn about reservation policies, shuttle services, cancellation, and how to save money on airport parking.",
  alternates: { canonical: "/faq" },
  robots: { index: true, follow: true },
  keywords: ["airport parking faq", "parking questions", "how airport parking works"],
  openGraph: {
    title: "Airport Parking FAQ - Answers to Your Parking Questions",
    description: "Find answers to common questions about airport parking reservations, pricing, cancellation policies, and more.",
    type: "website",
    siteName: "AirportMatrix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airport Parking FAQ - Answers to Your Parking Questions",
    description: "Find answers to common questions about airport parking reservations, pricing, cancellation policies, and more.",
  },
};

const faqs = [
  {
    q: "How does AirportMatrix work?",
    a: "AirportMatrix is a free parking comparison tool. Simply search for your airport, and we'll show you all nearby parking options sorted by price. You can compare distance, amenities, shuttle service, and more before choosing the best option for your trip.",
  },
  {
    q: "Is AirportMatrix free to use?",
    a: "Yes! AirportMatrix is completely free. We may earn a small commission when you book through our partner links, but this does not affect the price you pay. In fact, our partners often offer exclusive discounts through our platform.",
  },
  {
    q: "How much can I save on airport parking?",
    a: "Travelers can save up to 60% compared to on-airport parking rates. Off-airport parking facilities typically offer significantly lower daily rates while providing free shuttle service to the terminal.",
  },
  {
    q: "How far in advance should I book airport parking?",
    a: "We recommend booking at least 1-2 weeks before your trip. Popular parking lots near major airports can fill up quickly, especially during holidays and peak travel seasons. Booking early also gives you access to the best rates.",
  },
  {
    q: "What is the cancellation policy for airport parking?",
    a: "Cancellation policies vary by provider. Most offer free cancellation up to the minute before your check-in time, but we recommend checking the specific policy on each parking detail page before booking.",
  },
  {
    q: "How does airport parking shuttle service work?",
    a: "Most off-airport parking facilities offer free round-trip shuttle service. Shuttles typically run every 10-20 minutes and drop you off directly at your terminal. When you return, simply call or wait at the designated pickup area.",
  },
  {
    q: "Is my car safe at off-airport parking?",
    a: "Yes. All parking providers listed on AirportMatrix offer secure facilities. Most feature 24/7 security personnel, camera surveillance, gated access, and well-lit parking areas. Check individual listings for specific security features.",
  },
  {
    q: "What types of airport parking are available?",
    a: "We list several types: Self-parking (you park and keep your keys), Valet parking (attendant parks for you), Covered parking (protected from weather), Outdoor parking (open-air lots), and Shuttle parking (includes free shuttle to terminal).",
  },
  {
    q: "Are there extra fees for SUVs or large vehicles?",
    a: "Some parking providers charge a small surcharge for oversized vehicles like SUVs, trucks, or vans. Any additional fees are typically noted in the parking access section of the detail page.",
  },
  {
    q: "Can I extend my parking if my trip is extended?",
    a: "Most providers allow extensions, but additional days are typically charged at the facility's standard rate (which may be higher than your pre-booked rate). Contact the parking provider directly if you need to extend your stay.",
  },
];

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://airportmatrix.com" },
      { "@type": "ListItem", position: 2, name: "FAQ", item: "https://airportmatrix.com/faq" },
    ],
  };

  const iLangMetadata = {
    "@context": "https://ilang.ai", "@type": "ContentLayer", protocol: "I-Lang_v2.0",
    passage: "AirportMatrix.FAQ", temporal: "T[0]", narrative_voice: "knowledge_base",
    layers: {
      text: { h1: "Frequently Asked Questions", state: { system: "AirportMatrix", purpose: "user_education" } },
      business: { discover: "common_parking_questions", emotion_field: { helpfulness: 0.95, clarity: 0.9 } },
    },
    origin: { author: "@SYSTEM{AirportMatrix}", project: "airport-parking-aggregator", license: "commercial", hash: "λ_faq_0xA2C" },
  };

  return (
    <OrganizationSchema />
    <InfoPageShell title="FAQ">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script type="application/ilang+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(iLangMetadata) }} />
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600">
            Everything you need to know about airport parking with AirportMatrix.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h2>
              <p className="text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#6366f1]/5 rounded-lg border border-[#6366f1]/20 p-6 text-center">
          <p className="text-gray-700 mb-3">
            Still have questions? We&apos;re here to help.
          </p>
          <a
            href="/contact"
            className="inline-block px-4 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-[#5558e0] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </InfoPageShell>
  );
}
