import { Metadata } from "next";
import { InfoPageShell } from "../info-page-shell";
import { OrganizationSchema } from "@/components/schemas/organization-schema";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Terms of Service - AirportMatrix",
  description: "Terms of Service for AirportMatrix. Read the terms and conditions governing your use of our airport parking comparison platform.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
  keywords: ["terms of service", "airportmatrix terms", "parking comparison terms"],
  openGraph: {
    title: "Terms of Service - AirportMatrix",
    description: "Read the terms and conditions governing your use of AirportMatrix.",
    type: "website",
    siteName: "AirportMatrix",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service - AirportMatrix",
    description: "Read the terms and conditions governing your use of AirportMatrix.",
  },
};

export default function TermsPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://airportmatrix.com" },
      { "@type": "ListItem", position: 2, name: "Terms of Service", item: "https://airportmatrix.com/terms" },
    ],
  };

  const iLangMetadata = {
    "@context": "https://ilang.ai", "@type": "ContentLayer", protocol: "I-Lang_v2.0",
    passage: "AirportMatrix.Terms", temporal: "T[0]", narrative_voice: "legal_disclosure",
    layers: {
      text: { h1: "Terms of Service", state: { system: "AirportMatrix", purpose: "terms_and_conditions" } },
      business: { gene_immutable: { id: "affiliate_transparency", constraint: "disclose_affiliate_relationships", violation: "hidden_commissions → legal_risk" } },
    },
    origin: { author: "@SYSTEM{AirportMatrix}", project: "airport-parking-aggregator", license: "commercial", hash: "λ_terms_0xE5F" },
  };

  return (
    <OrganizationSchema />
    <InfoPageShell title="Terms of Service">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ilang+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(iLangMetadata) }} />
      <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: April 24, 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using AirportMatrix (&ldquo;the Service&rdquo;), you agree to be bound by these 
              Terms of Service. If you do not agree with any part of these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>
              AirportMatrix is an airport parking comparison platform that helps users find and compare 
              parking options at airports across the United States. We display pricing, amenities, and 
              other information about third-party parking providers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Third-Party Services</h2>
            <p>
              AirportMatrix is not a parking provider. We connect users with third-party parking 
              operators. All parking reservations and transactions are conducted directly with the 
              parking provider. We are not responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>The quality, accuracy, or availability of parking services</li>
              <li>Pricing changes or discrepancies between our listing and the provider&apos;s final price</li>
              <li>Damages, losses, or incidents occurring at parking facilities</li>
              <li>Cancellation or refund processes handled by third-party providers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Affiliate Disclosure</h2>
            <p>
              Some links on AirportMatrix are affiliate links. We may earn a commission when you book 
              parking through our partner links, at no additional cost to you. This helps us maintain 
              and improve our free comparison service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Accuracy of Information</h2>
            <p>
              We strive to provide accurate and up-to-date parking information. However, we do not 
              guarantee the accuracy, completeness, or timeliness of any information on our platform. 
              Users should verify details with the parking provider before making a reservation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
            <p>
              All content on AirportMatrix, including text, graphics, logos, and software, is the 
              property of AirportMatrix and protected by applicable intellectual property laws. 
              You may not reproduce, distribute, or create derivative works without our permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p>
              AirportMatrix shall not be liable for any direct, indirect, incidental, or consequential 
              damages arising from your use of the Service. This includes but is not limited to damages 
              for loss of profits, data, or goodwill.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will be 
              effective immediately upon posting. Continued use of the Service constitutes acceptance 
              of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Contact</h2>
            <p>
              For questions about these Terms, please visit our{" "}
              <a href="/contact" className="text-[#6366f1] hover:underline">Contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </InfoPageShell>
  );
}
