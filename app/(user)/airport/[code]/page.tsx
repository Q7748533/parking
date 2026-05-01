import { Metadata } from "next";
import { notFound } from "next/navigation";
import { turso } from "@/lib/db";
import { AirportParkingClient } from "./airport-parking-client";
import { AirportSeoContent } from "./airport-seo-content";
import { AirportFaq } from "./airport-faq";

export const revalidate = 3600;

interface AirportPageProps {
  params: Promise<{
    code: string;
  }>;
}

async function getAirportByCode(code: string) {
  try {
    const result = await turso.execute({
      sql: "SELECT * FROM airports WHERE LOWER(code) = LOWER(?) LIMIT 1",
      args: [code],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: String(row.id),
      code: String(row.code),
      name: String(row.name),
      city: String(row.city),
      state: String(row.state),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
    };
  } catch (error) {
    console.error("Failed to get airport:", error);
    return null;
  }
}

async function getParkingProviders(airportId: string) {
  try {
    const result = await turso.execute({
      sql: `SELECT * FROM parking_providers 
            WHERE airport_id = ? 
            ORDER BY price_per_day ASC`,
      args: [airportId],
    });

    return result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      airportId: String(row.airport_id),
      type: String(row.type),
      pricePerDay: Number(row.price_per_day),
      distance: String(row.distance),
      features: String(row.features),
      affiliateUrl: String(row.affiliate_url),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
    }));
  } catch (error) {
    console.error("Failed to get parking providers:", error);
    return [];
  }
}

export async function generateMetadata({ params }: AirportPageProps): Promise<Metadata> {
  const { code } = await params;
  const airport = await getAirportByCode(code);

  if (!airport) {
    return {
      title: "Airport Not Found - AirportMatrix",
    };
  }

  return {
    title: `${airport.name} (${airport.code}) Parking - Compare & Book Deals | AirportMatrix`,
    description: `Find cheap ${airport.name} (${airport.code}) parking. Compare prices, shuttle services, covered and valet parking options near ${airport.city}, ${airport.state}. Save up to 60% on airport parking.`,
    robots: { index: true, follow: true },
    keywords: [
      `${airport.code} parking`,
      `${airport.name} parking`,
      `airport parking ${airport.city}`,
      "airport parking deals",
      "cheap airport parking",
      "long term parking",
    ],
    openGraph: {
      title: `${airport.name} Parking - Compare & Book Deals`,
      description: `Find the best parking deals at ${airport.name}. Save up to 60%.`,
      type: "website",
      locale: "en_US",
      siteName: "AirportMatrix",
    },
    twitter: {
      card: "summary_large_image",
      title: `${airport.name} Parking - Compare & Book Deals`,
      description: `Find the best parking deals at ${airport.name}. Save up to 60%.`,
    },
    alternates: {
      canonical: `/airport/${code.toLowerCase()}`,
    },
  };
}

export default async function AirportPage({ params }: AirportPageProps) {
  const { code } = await params;
  const airport = await getAirportByCode(code);

  if (!airport) {
    notFound();
  }

  let parkingProviders = await getParkingProviders(airport.id);
  let providersError: string | undefined;

  // If getParkingProviders returned empty and there might be data, it could be an error
  // The function catches errors internally and returns [], so we rely on a separate health check
  if (parkingProviders.length === 0) {
    try {
      // Quick check: does this airport have any providers in DB?
      const checkResult = await turso.execute({
        sql: "SELECT COUNT(*) as cnt FROM parking_providers WHERE airport_id = ?",
        args: [airport.id],
      });
      const hasProviders = Number(checkResult.rows[0]?.cnt ?? 0) > 0;
      if (hasProviders) {
        providersError = "Failed to load parking providers";
        parkingProviders = []; // keep empty but show error
      }
    } catch {
      providersError = "Failed to load parking providers";
    }
  }

  // Fetch detailed stats from DB for "By the Numbers" block
  let seoStats = {
    providerCount: 0,
    minPrice: 0,
    maxPrice: 0,
    avgPrice: 0,
    closestDistance: "",
    shuttleCount: 0,
    coveredCount: 0,
    freeCancelCount: 0,
    avgRating: 0,
    twentyFourSevenCount: 0,
    types: [] as string[],
  };

  try {
    const [countRow, avgPriceRow, closestRow, shuttleRow, coveredRow,
           freeCancelRow, avgRatingRow, allDayRow, typesRow] = await Promise.all([
      turso.execute({ sql: "SELECT COUNT(*) as cnt FROM parking_providers WHERE airport_id = ?", args: [airport.id] }),
      turso.execute({ sql: "SELECT COALESCE(AVG(price_per_day), 0) as avg FROM parking_providers WHERE airport_id = ?", args: [airport.id] }),
      turso.execute({ sql: "SELECT MIN(CAST(distance AS REAL)) as dist FROM parking_providers WHERE airport_id = ? AND distance != '' AND distance IS NOT NULL", args: [airport.id] }),
      turso.execute({ sql: "SELECT COUNT(*) as cnt FROM parking_providers WHERE airport_id = ? AND (type LIKE '%shuttle%' OR features LIKE '%shuttle%')", args: [airport.id] }),
      turso.execute({ sql: "SELECT COUNT(*) as cnt FROM parking_providers WHERE airport_id = ? AND type LIKE '%covered%'", args: [airport.id] }),
      turso.execute({ sql: "SELECT COUNT(*) as cnt FROM parking_providers WHERE airport_id = ? AND free_cancel_available = 1", args: [airport.id] }),
      turso.execute({ sql: "SELECT COALESCE(AVG(rating), 0) as avg FROM parking_providers WHERE airport_id = ?", args: [airport.id] }),
      turso.execute({ sql: "SELECT COUNT(*) as cnt FROM parking_providers WHERE airport_id = ? AND operating_hours IS NOT NULL AND operating_hours LIKE '%00:00:00%00:00:00%'", args: [airport.id] }),
      turso.execute({ sql: "SELECT type FROM parking_providers WHERE airport_id = ?", args: [airport.id] }),
    ]);

    seoStats = {
      providerCount: Number(countRow.rows[0]?.cnt ?? 0),
      minPrice: parkingProviders.length > 0 ? Math.min(...parkingProviders.map((p) => p.pricePerDay)) : 0,
      maxPrice: parkingProviders.length > 0 ? Math.max(...parkingProviders.map((p) => p.pricePerDay)) : 0,
      avgPrice: Number(avgPriceRow.rows[0]?.avg ?? 0),
      closestDistance: closestRow.rows[0]?.dist ? `${closestRow.rows[0].dist} miles` : "",
      shuttleCount: Number(shuttleRow.rows[0]?.cnt ?? 0),
      coveredCount: Number(coveredRow.rows[0]?.cnt ?? 0),
      freeCancelCount: Number(freeCancelRow.rows[0]?.cnt ?? 0),
      avgRating: Number(avgRatingRow.rows[0]?.avg ?? 0),
      twentyFourSevenCount: Number(allDayRow.rows[0]?.cnt ?? 0),
      types: typesRow.rows.map((r) => String(r.type)),
    };
  } catch {
    // Fallback: use in-memory calculations from parking providers
    if (parkingProviders.length > 0) {
      const prices = parkingProviders.map((p) => p.pricePerDay);
      seoStats.providerCount = parkingProviders.length;
      seoStats.minPrice = Math.min(...prices);
      seoStats.maxPrice = Math.max(...prices);
      seoStats.avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      seoStats.types = parkingProviders.map((p) => p.type);
    }
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://airportmatrix.com" },
      { "@type": "ListItem", position: 2, name: `${airport.code} Airport`, item: `https://airportmatrix.com/airport/${airport.code.toLowerCase()}` },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Parking Options at ${airport.name} (${airport.code})`,
    numberOfItems: parkingProviders.length,
    itemListElement: parkingProviders.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        offers: { "@type": "Offer", price: p.pricePerDay, priceCurrency: "USD", availability: "https://schema.org/InStock" },
        url: `https://airportmatrix.com/airport/${airport.code.toLowerCase()}/${p.slug}`,
      },
    })),
  };

  const iLangMetadata = {
    "@context": "https://ilang.ai",
    "@type": "ContentLayer",
    protocol: "I-Lang_v2.0",
    passage: `AirportMatrix.${airport.code}`,
    temporal: "T[0]",
    narrative_voice: "listing_directory",
    layers: {
      text: {
        h1: `${airport.name} (${airport.code}) Parking`,
        h2: [
          "About Airport Parking",
          `${airport.code} Parking Stats`,
          "Parking Options Comparison Table",
          `${airport.code} Parking FAQ`,
        ],
        state: { system: "AirportMatrix", location: airport.code, purpose: "airport_parking_listing" },
        act: { actor: "@SYSTEM{AirportMatrix}", action: "LIST(parking_options → sorted_by_price)", target: "@HUMAN{traveler}" },
      },
      business: {
        discover: `${airport.code}_parking_market`,
        gene_immutable: { id: "price_comparison", constraint: "show_lowest_price_first", violation: "wrong_order → trust_loss" },
        emotion_field: { price_sensitivity: 0.85, convenience_need: 0.7 },
      },
      user_journey: {
        entry: `search_${airport.code.toLowerCase()}_parking`,
        pattern: "scan_list → compare_price_distance → click_view → book",
        decision_factors: ["price", "distance", "shuttle", "rating"],
      },
    },
    origin: { author: "@SYSTEM{AirportMatrix}", project: "airport-parking-aggregator", license: "commercial", hash: `λ_${airport.code.toLowerCase()}_parking_0x${airport.code}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ilang+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(iLangMetadata) }} />
      {/* Airport Header — server-rendered for SEO */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to All Airports
          </a>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {airport.name} ({airport.code}) Parking
          </h1>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {airport.city}, {airport.state}
          </p>
        </div>
      </section>
      <AirportSeoContent
        airportCode={airport.code}
        airportName={airport.name}
        city={airport.city}
        state={airport.state}
        providerCount={seoStats.providerCount}
        minPrice={seoStats.minPrice}
        maxPrice={seoStats.maxPrice}
        avgPrice={seoStats.avgPrice}
        closestDistance={seoStats.closestDistance}
        shuttleCount={seoStats.shuttleCount}
        coveredCount={seoStats.coveredCount}
        freeCancelCount={seoStats.freeCancelCount}
        avgRating={seoStats.avgRating}
        twentyFourSevenCount={seoStats.twentyFourSevenCount}
        types={seoStats.types}
      />
      <AirportParkingClient airport={airport} parkingProviders={parkingProviders} error={providersError} />
      <AirportFaq
        airportCode={airport.code}
        airportName={airport.name}
        providerCount={seoStats.providerCount}
        minPrice={seoStats.minPrice}
        maxPrice={seoStats.maxPrice}
        avgPrice={seoStats.avgPrice}
        shuttleCount={seoStats.shuttleCount}
        hasShuttle={seoStats.shuttleCount > 0}
        hasCovered={seoStats.coveredCount > 0}
        uniqueTypes={[...new Set(seoStats.types.map((t) => t.trim()).filter(Boolean))]}
      />
      <NearbyAirports airportCode={airport.code} airportState={airport.state} airportName={airport.name} />
    </>
  );
}
