import { Metadata } from "next";
import { InfoPageShell } from "../info-page-shell";
import { OrganizationSchema } from "@/components/schemas/organization-schema";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact Us - AirportMatrix",
  description: "Get in touch with the AirportMatrix team. We're here to help with any questions about airport parking, our service, or partnership opportunities.",
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
  keywords: ["contact airportmatrix", "airport parking support", "parking partnership"],
  openGraph: {
    title: "Contact AirportMatrix - We're Here to Help",
    description: "Get in touch with the AirportMatrix team for questions, feedback, or partnership inquiries.",
    type: "website",
    siteName: "AirportMatrix",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact AirportMatrix - We're Here to Help",
    description: "Get in touch with the AirportMatrix team for questions, feedback, or partnership inquiries.",
    images: ["/og-image.png"],
  },
};

export default function ContactPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://airportmatrix.com" },
      { "@type": "ListItem", position: 2, name: "Contact Us", item: "https://airportmatrix.com/contact" },
    ],
  };

  const iLangMetadata = {
    "@context": "https://ilang.ai", "@type": "ContentLayer", protocol: "I-Lang_v2.0",
    passage: "AirportMatrix.Contact", temporal: "T[0]", narrative_voice: "support_channel",
    layers: {
      text: { h1: "Contact Us", h2: ["General Inquiries", "Partnerships", "Response Time"], state: { system: "AirportMatrix", purpose: "customer_support" } },
      business: { discover: "support_channel_discovery", emotion_field: { approachability: 0.95, responsiveness: 0.9 } },
    },
    origin: { author: "@SYSTEM{AirportMatrix}", project: "airport-parking-aggregator", license: "commercial", hash: "λ_contact_0xC3D" },
  };

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact AirportMatrix",
    description: "Get in touch with the AirportMatrix team for questions, feedback, or partnership inquiries.",
    about: {
      "@type": "Organization",
      name: "AirportMatrix",
      url: "https://airportmatrix.com",
      image: "https://airportmatrix.com/og-image.png",
      contactPoint: [
        { "@type": "ContactPoint", email: "contact@airportmatrix.com", contactType: "customer service" },
        { "@type": "ContactPoint", email: "partners@airportmatrix.com", contactType: "sales" },
      ],
    },
  };

  return (
    <>
      <OrganizationSchema />
      <InfoPageShell title="Contact Us">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }} />
      <script type="application/ilang+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(iLangMetadata) }} />
      <div className="space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-600">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Inquiries */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">General Inquiries</h2>
            <p className="text-sm text-gray-600 mb-4">
              For questions about our service, parking options, or general feedback.
            </p>
            <a
              href="mailto:contact@airportmatrix.com"
              className="inline-flex items-center gap-2 text-[#6366f1] font-medium hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              contact@airportmatrix.com
            </a>
          </div>

          {/* Partnerships */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Partnerships</h2>
            <p className="text-sm text-gray-600 mb-4">
              Interested in listing your parking facility on AirportMatrix? We&apos;d love to partner with you.
            </p>
            <a
              href="mailto:partners@airportmatrix.com"
              className="inline-flex items-center gap-2 text-[#6366f1] font-medium hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              partners@airportmatrix.com
            </a>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Response Time</h2>
          <p className="text-sm text-gray-600">
            We typically respond to all inquiries within 24-48 hours during business days. 
            For urgent matters related to an existing parking reservation, please contact the 
            parking provider directly using the contact information provided on their listing.
          </p>
        </div>

        {/* FAQ Link */}
        <div className="bg-[#6366f1]/5 rounded-lg border border-[#6366f1]/20 p-6 text-center">
          <p className="text-gray-700 mb-3">
            Looking for quick answers? Check our Frequently Asked Questions.
          </p>
          <a
            href="/faq"
            className="inline-block px-4 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-[#5558e0] transition-colors"
          >
            View FAQ
          </a>
        </div>
      </div>
    </InfoPageShell>
    </>
  );
}
