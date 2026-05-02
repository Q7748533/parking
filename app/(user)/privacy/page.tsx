import { Metadata } from "next";
import { InfoPageShell } from "../info-page-shell";
import { OrganizationSchema } from "@/components/schemas/organization-schema";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Policy - AirportMatrix",
  description: "Privacy Policy for AirportMatrix. Learn how we collect, use, and protect your personal information when you use our airport parking comparison service.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
  keywords: ["privacy policy", "airportmatrix privacy", "data protection"],
  openGraph: {
    title: "Privacy Policy - AirportMatrix",
    description: "Learn how AirportMatrix collects, uses, and protects your personal information.",
    type: "website",
    siteName: "AirportMatrix",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy - AirportMatrix",
    description: "Learn how AirportMatrix collects, uses, and protects your personal information.",
  },
};

export default function PrivacyPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://airportmatrix.com" },
      { "@type": "ListItem", position: 2, name: "Privacy Policy", item: "https://airportmatrix.com/privacy" },
    ],
  };

  const iLangMetadata = {
    "@context": "https://ilang.ai", "@type": "ContentLayer", protocol: "I-Lang_v2.0",
    passage: "AirportMatrix.Privacy", temporal: "T[0]", narrative_voice: "legal_disclosure",
    layers: {
      text: { h1: "Privacy Policy", state: { system: "AirportMatrix", purpose: "data_protection_compliance" } },
      business: { gene_immutable: { id: "data_privacy", constraint: "transparent_data_handling", violation: "privacy_breach → trust_loss" } },
    },
    origin: { author: "@SYSTEM{AirportMatrix}", project: "airport-parking-aggregator", license: "commercial", hash: "λ_privacy_0xD4E" },
  };

  return (
    <OrganizationSchema />
    <InfoPageShell title="Privacy Policy">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ilang+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(iLangMetadata) }} />
      <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: April 24, 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>
              When you use AirportMatrix, we may collect the following types of information:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Usage Data:</strong> Pages visited, time spent, search queries, and interaction with parking listings. This helps us improve our service.</li>
              <li><strong>Device Information:</strong> Browser type, device type, operating system, and IP address for analytics and security purposes.</li>
              <li><strong>Cookies:</strong> Small text files stored on your device to remember preferences and improve your experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Provide and maintain our parking comparison service</li>
              <li>Analyze usage patterns to improve search results and user experience</li>
              <li>Display relevant airport parking options based on your search queries</li>
              <li>Monitor and prevent fraudulent activity</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Cookies and Tracking</h2>
            <p>
              We use essential cookies to ensure the website functions properly. We may also use analytics cookies 
              (such as Google Analytics) to understand how visitors interact with our site. You can control cookie 
              preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Third-Party Links</h2>
            <p>
              Our website contains links to third-party parking providers and booking platforms. When you click 
              on these links and leave our site, we are not responsible for the privacy practices of those 
              websites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your information. However, no method of 
              transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Children&apos;s Privacy</h2>
            <p>
              Our service is not directed to children under 13. We do not knowingly collect personal 
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page 
              with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please visit our{" "}
              <a href="/contact" className="text-[#6366f1] hover:underline">Contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </InfoPageShell>
  );
}
