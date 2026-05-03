import { Metadata } from "next";
import { SearchPageClient } from "./search-page-client";
import { SeoContent } from "./(user)/seo-content";
import { getAirportsWithParking } from "./(user)/search/actions";
import { turso } from "@/lib/db";
import { Header } from "@/components/user/header";
import { Footer } from "@/components/user/footer";

// ISR: Regenerate page at most every 1 hour (3600 seconds)
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  let count = 500;
  try {
    const r = await turso.execute("SELECT COUNT(*) as cnt FROM airports");
    count = Number(r.rows[0]?.cnt ?? 500);
  } catch { /* fallback */ }

  return {
    title: `AirportMatrix — Compare ${count}+ Airport Parking Deals`,
    description: `Compare airport parking prices at ${count}+ US airports. Find cheap long-term parking with free shuttle, secure lots, and instant confirmation. Save up to 60% vs drive-up rates.`,
    keywords: ["airport parking", "cheap airport parking", "long term parking", "airport parking deals", "airport shuttle parking", "airport parking reservations"],
    openGraph: {
      title: "AirportMatrix — Find & Book Airport Parking Deals",
      description: `Compare ${count}+ airport parking options. Save up to 60% at JFK, LAX, Chicago, and more.`,
      type: "website",
      locale: "en_US",
      siteName: "AirportMatrix",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "AirportMatrix — Find & Book Airport Parking Deals",
      description: `Find the best airport parking deals at ${count}+ US airports. Save up to 60%.`,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: "/",
    },
  };
}

// Schema.org structured data for Google SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AirportMatrix",
  url: "https://airportmatrix.com",
  description: "Compare airport parking prices and book deals at 500+ airports",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://airportmatrix.com/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

// Breadcrumb structured data
const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://airportmatrix.com",
    },
  ],
};

// I-Lang structured content metadata — built dynamically
function buildILangMetadata(totalAirports: number) {
  return {
    "@context": "https://ilang.ai",
    "@type": "ContentLayer",
    protocol: "I-Lang_v2.0",
    passage: "AirportMatrix.Homepage",
    temporal: "T[0]",
    narrative_voice: "service_provider",
    layers: {
      text: {
        h1: "Find & Book Airport Parking Deals — Price Comparison",
        h2: [
          "Why Book Airport Parking in Advance",
          "How to Find Cheap Airport Parking",
          "Airport Parking Options Explained",
          "Top Airports We Cover",
        ],
        h3: null,
        state: {
          system: "AirportMatrix",
          purpose: "airport_parking_price_comparison",
          coverage: `${totalAirports}+ US airports`,
          value_proposition: "save_up_to_60_percent_vs_drive_up",
        },
        act: {
          actor: "@SYSTEM{AirportMatrix}",
          action: "COMPARE_AND_DISPLAY(parking_options → sorted_by_price)",
          target: "@HUMAN{traveler}",
        },
      },
      business: {
        discover: "airport_parking_price_disparity",
        gene_immutable: {
          id: "price_transparency",
          constraint: "show_all_fees_upfront",
          violation: "hidden_fees → trust_loss",
        },
        emotion_field: {
          anxiety: 0.3,
          trust: 0.9,
          savings_satisfaction: 0.95,
        },
      },
      user_journey: {
        entry: "search_airport_parking_near_me",
        pattern: "compare_prices → view_details → click_book → complete_reservation",
        decision_factors: ["price", "distance", "shuttle_frequency", "security"],
      },
    },
    origin: {
      author: "@SYSTEM{AirportMatrix}",
      project: "airport-parking-aggregator",
      license: "commercial",
      hash: "λ_parking_compare_0xC4B",
    },
  };
}

// Organization structured data for E-E-A-T
const organizationData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AirportMatrix",
  url: "https://airportmatrix.com",
  description: "Leading airport parking comparison platform helping travelers save up to 60% on parking at 500+ US airports.",
  foundingDate: "2025",
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@airportmatrix.com",
    contactType: "customer service",
  },
};

export default async function HomePage() {
  const result = await getAirportsWithParking();
  const airportsWithParking = result.success && result.data ? result.data : [];

  let totalAirports = 0;
  let totalProviders = 0;
  let topAirportsForSeo: { code: string; name: string; city: string; state: string }[] = [];

  try {
    const [statsResult, topResult] = await Promise.all([
      turso.execute(`
        SELECT
          (SELECT COUNT(*) FROM airports) as airport_count,
          (SELECT COUNT(*) FROM parking_providers) as provider_count
      `),
      turso.execute(
        "SELECT code, name, city, state FROM airports ORDER BY code ASC LIMIT 8"
      ),
    ]);

    if (statsResult.rows.length > 0) {
      totalAirports = Number(statsResult.rows[0].airport_count);
      totalProviders = Number(statsResult.rows[0].provider_count);
    }

    topAirportsForSeo = topResult.rows.map((row) => ({
      code: String(row.code),
      name: String(row.name),
      city: String(row.city),
      state: String(row.state),
    }));
  } catch {
    totalAirports = airportsWithParking.length;
    totalProviders = airportsWithParking.reduce((sum, a) => sum + a.parkingProviders.length, 0);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      <Header />
      <main className="flex-1" role="main">
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Organization structured data for E-E-A-T */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        />
        {/* Breadcrumb structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        {/* I-Lang metadata */}
        <script
          type="application/ilang+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildILangMetadata(totalAirports)) }}
        />
        {/* ItemList schema for displayed parking providers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Popular Airport Parking Options",
              numberOfItems: airportsWithParking.reduce((sum, a) => sum + a.parkingProviders.length, 0),
              itemListElement: airportsWithParking.flatMap((airport) =>
                airport.parkingProviders.map((p, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  item: {
                    "@type": "Product",
                    name: p.name,
                    description: `Parking at ${airport.name} (${airport.code})`,
                    image: "https://airportmatrix.com/og-image.png",
                    brand: { "@type": "Brand", name: "AirportMatrix" },
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: p.rating || 0,
                      reviewCount: p.ratingCount || 0,
                      bestRating: 5,
                    },
                    review: {
                      "@type": "Review",
                      author: { "@type": "Organization", name: "AirportMatrix" },
                      reviewRating: {
                        "@type": "Rating",
                        ratingValue: p.rating || 0,
                        bestRating: 5,
                      },
                    },
                    offers: {
                      "@type": "Offer",
                      price: p.pricePerDay,
                      priceCurrency: "USD",
                      availability: "https://schema.org/InStock",
                      hasMerchantReturnPolicy: {
                        "@type": "MerchantReturnPolicy",
                        applicableCountry: "US",
                        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                        merchantReturnDays: 0,
                      },
                    },
                    url: `https://airportmatrix.com/airport/${airport.code.toLowerCase()}/${p.slug}`,
                  },
                }))
              ),
            }),
          }}
        />
        <SearchPageClient
          airportsWithParking={airportsWithParking}
          totalAirports={totalAirports}
          totalProviders={totalProviders}
          error={result.success ? undefined : (result.error || "Failed to load data")}
        />
        <SeoContent topAirports={topAirportsForSeo} totalAirports={totalAirports} />
      </main>
      <Footer />
    </div>
  );
}
