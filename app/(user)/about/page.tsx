import { Metadata } from "next";
import { InfoPageShell } from "../info-page-shell";
import { OrganizationSchema } from "@/components/schemas/organization-schema";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Us - AirportMatrix",
  description: "Learn about AirportMatrix, the leading airport parking comparison platform. We help travelers save up to 60% on parking at 500+ US airports.",
  alternates: { canonical: "/about" },
  robots: { index: true, follow: true },
  keywords: ["about airportmatrix", "airport parking comparison", "save on airport parking"],
  openGraph: {
    title: "About AirportMatrix - Your Airport Parking Comparison Tool",
    description: "We help travelers find and compare the best airport parking deals across 500+ US airports.",
    type: "website",
    siteName: "AirportMatrix",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About AirportMatrix - Your Airport Parking Comparison Tool",
    description: "We help travelers find and compare the best airport parking deals across 500+ US airports.",
    images: ["/og-image.png"],
  },
};

export default function AboutPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://airportmatrix.com" },
      { "@type": "ListItem", position: 2, name: "About Us", item: "https://airportmatrix.com/about" },
    ],
  };

  const iLangMetadata = {
    "@context": "https://ilang.ai", "@type": "ContentLayer", protocol: "I-Lang_v2.0",
    passage: "AirportMatrix.About", temporal: "T[0]", narrative_voice: "brand_story",
    layers: {
      text: { h1: "About AirportMatrix", h2: ["Our Mission", "How It Works", "Why Choose AirportMatrix"], state: { system: "AirportMatrix", purpose: "transparent_parking_comparison" } },
      business: { discover: "airport_parking_value_proposition", emotion_field: { trust: 0.95, reliability: 0.9 } },
    },
    origin: { author: "@SYSTEM{AirportMatrix}", project: "airport-parking-aggregator", license: "commercial", hash: "λ_about_0xB1A" },
  };

  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About AirportMatrix",
    description: "AirportMatrix is a free airport parking comparison platform helping travelers find the best parking deals at 500+ US airports.",
    about: {
      "@type": "Organization",
      name: "AirportMatrix",
      url: "https://airportmatrix.com",
      description: "Leading airport parking comparison platform helping travelers save up to 60% on parking at 500+ US airports.",
      image: "https://airportmatrix.com/og-image.png",
      foundingDate: "2025",
      contactPoint: { "@type": "ContactPoint", email: "contact@airportmatrix.com", contactType: "customer service" },
    },
  };

  return (
    <>
      <OrganizationSchema />
      <InfoPageShell title="About Us">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }} />
      <script type="application/ilang+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(iLangMetadata) }} />
      <div className="space-y-8">
        {/* Hero */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">About AirportMatrix</h1>
          <p className="text-gray-700 leading-relaxed">
            AirportMatrix is a free airport parking comparison platform designed to help travelers 
            find the best parking deals at airports across the United States. We aggregate parking 
            options from trusted providers and present them in a clear, easy-to-compare format.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            We believe airport parking should be simple, transparent, and affordable. Too many 
            travelers overpay for parking because they don&apos;t know about better options. Our mission 
            is to bring transparency to airport parking pricing, helping you save time and money.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#6366f1]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-[#6366f1]">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Search</h3>
              <p className="text-sm text-gray-600">Enter your airport to see all nearby parking options in one place.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#6366f1]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-[#6366f1]">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Compare</h3>
              <p className="text-sm text-gray-600">Compare prices, distance, shuttle service, and amenities side-by-side.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#6366f1]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-[#6366f1]">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Book &amp; Save</h3>
              <p className="text-sm text-gray-600">Book directly with the provider and save up to 60% on airport parking.</p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Choose AirportMatrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <span className="text-[#6366f1] text-lg mt-0.5">&#10003;</span>
              <div>
                <h3 className="font-medium text-gray-900">500+ Airports</h3>
                <p className="text-sm text-gray-600">Coverage across all major US airports and regional hubs.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-[#6366f1] text-lg mt-0.5">&#10003;</span>
              <div>
                <h3 className="font-medium text-gray-900">Save Up to 60%</h3>
                <p className="text-sm text-gray-600">Off-airport parking often costs a fraction of on-airport rates.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-[#6366f1] text-lg mt-0.5">&#10003;</span>
              <div>
                <h3 className="font-medium text-gray-900">Free Comparison</h3>
                <p className="text-sm text-gray-600">No fees, no sign-up required. Compare as many times as you want.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-[#6366f1] text-lg mt-0.5">&#10003;</span>
              <div>
                <h3 className="font-medium text-gray-900">Real-Time Pricing</h3>
                <p className="text-sm text-gray-600">Updated prices and availability from verified parking providers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InfoPageShell>
    </>
  );
}
