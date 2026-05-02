import { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { turso } from "@/lib/db";
import { InfoPageShell } from "../info-page-shell";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const airports = await getAirports();
  return {
    title: `${airports.length} US Airports with Parking | AirportMatrix`,
    description: `Browse all ${airports.length} US airports with parking options. Compare airport parking at JFK, LAX, Chicago ORD, Atlanta ATL, Dallas DFW, Miami MIA and more.`,
    alternates: { canonical: "/airports" },
    robots: { index: true, follow: true },
    openGraph: {
      title: `All US Airports — Airport Parking Directory`,
      description: `Browse ${airports.length} US airports with available parking options.`,
      type: "website",
      locale: "en_US",
      siteName: "AirportMatrix",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `All US Airports — Airport Parking Directory`,
      description: `Browse ${airports.length} US airports with available parking options.`,
      images: ["/og-image.png"],
    },
    keywords: ["US airports", "airport parking directory", "airport list", "JFK parking", "LAX parking", "ORD parking"],
  };
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://airportmatrix.com" },
    { "@type": "ListItem", position: 2, name: "All Airports", item: "https://airportmatrix.com/airports" },
  ],
};

function buildItemListSchema(airports: { code: string; name: string; city: string; state: string; providerCount: number }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "US Airports with Parking",
    numberOfItems: airports.length,
    itemListElement: airports.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Airport",
        "@id": `https://airportmatrix.com/airport/${a.code.toLowerCase()}`,
        name: a.name,
        iataCode: a.code,
        address: { "@type": "PostalAddress", addressLocality: a.city, addressRegion: a.state, addressCountry: "US" },
        url: `https://airportmatrix.com/airport/${a.code.toLowerCase()}`,
      },
    })),
  };
}

const iLangMetadata = (count: number) => ({
  "@context": "https://ilang.ai",
  "@type": "ContentLayer",
  protocol: "I-Lang_v2.0",
  passage: "AirportMatrix.AllAirports",
  temporal: "T[0]",
  narrative_voice: "directory_index",
  layers: {
    text: {
      h1: "All US Airports",
      h2: ["Airport Parking Directory"],
      state: { system: "AirportMatrix", purpose: "airport_parking_directory", coverage: `${count}+ airports` },
      act: { actor: "@SYSTEM{AirportMatrix}", action: "LIST_ALL(airports → grouped_by_code)", target: "@HUMAN{traveler}" },
    },
    business: {
      discover: "airport_parking_coverage_map",
      gene_immutable: { id: "comprehensive_coverage", constraint: "list_all_airports_with_parking", violation: "missing_airports → incomplete_index" },
      emotion_field: { confidence: 0.9 },
    },
    user_journey: {
      entry: "browse_all_airports",
      pattern: "scan_list → find_airport → click_to_view_parking → compare_options",
      decision_factors: ["airport_proximity", "code_recognition", "parking_availability"],
    },
  },
  origin: { author: "@SYSTEM{AirportMatrix}", project: "airport-parking-aggregator", license: "commercial", hash: "λ_airport_directory_0xD2F" },
});

async function getAirports() {
  const result = await turso.execute(`
    SELECT a.*, COUNT(p.id) as provider_count 
    FROM airports a 
    LEFT JOIN parking_providers p ON a.id = p.airport_id 
    GROUP BY a.id 
    ORDER BY a.code ASC
  `);
  return result.rows.map(row => ({
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    city: String(row.city),
    state: String(row.state),
    providerCount: Number(row.provider_count),
  }));
}

export default async function AirportsPage() {
  const airports = await getAirports();
  const itemListSchema = buildItemListSchema(airports);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AirportMatrix",
    url: "https://airportmatrix.com",
    description: "Leading airport parking comparison platform helping travelers save up to 60% on parking at 500+ US airports.",
  };

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "US Airports with Parking",
    description: `Browse ${airports.length} airports with available parking options across the United States.`,
    mainEntity: itemListSchema,
  };

  return (
    <InfoPageShell title="All US Airports">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ilang+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(iLangMetadata(airports.length)) }}
      />
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All US Airports</h1>
          <p className="text-gray-700 text-sm leading-relaxed max-w-3xl">
            Browse our complete directory of {airports.length} US airports with available parking options.
            Compare parking prices, shuttle services, and amenities at major airports including JFK, LAX,
            Chicago ORD, Atlanta ATL, Dallas DFW, Miami MIA, and hundreds more across the United States.
            Click any airport below to view its parking providers, sorted by price and distance.
          </p>
        </div>

        <article className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <h2 className="sr-only" id="airport-directory-heading">Airport Parking Directory</h2>
          <table className="w-full hidden md:table" aria-label="Airport parking directory">
            <thead>
              <tr className="px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="text-left px-5 py-3 w-3/10">Airport</th>
                <th className="text-left px-5 py-3 w-3/10">Location</th>
                <th className="text-left px-5 py-3 w-2/10">Parking Options</th>
                <th className="text-right px-5 py-3 w-2/10">Action</th>
              </tr>
            </thead>
            <tbody>
              {airports.map((airport) => (
                <tr
                  key={airport.id}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-medium text-gray-900">{airport.name}</span>
                    <span className="text-sm text-gray-500 ml-1">({airport.code})</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {airport.city}, {airport.state}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {airport.providerCount > 0 ? (
                      <span className="text-sm text-gray-600">
                        {airport.providerCount} parking option{airport.providerCount !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">No parking yet</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {airport.providerCount > 0 ? (
                      <Link
                        href={`/airport/${airport.code.toLowerCase()}`}
                        className="text-sm font-medium text-[#6366f1] hover:text-[#5558e0] transition-colors"
                      >
                        View Parking &rarr;
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">Coming soon</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Mobile card view — same data, stacked layout */}
          <div className="md:hidden divide-y divide-gray-100">
            {airports.map((airport) => (
              <div key={airport.id} className="px-5 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{airport.name}</span>
                    <span className="text-sm text-gray-500 ml-1">({airport.code})</span>
                  </div>
                  {airport.providerCount > 0 ? (
                    <Link href={`/airport/${airport.code.toLowerCase()}`} className="text-sm font-medium text-[#6366f1]">
                      View &rarr;
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">Coming soon</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {airport.city}, {airport.state}
                  <span className="mx-2 text-gray-300">|</span>
                  {airport.providerCount > 0
                    ? `${airport.providerCount} parking option${airport.providerCount !== 1 ? "s" : ""}`
                    : "No parking yet"}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </InfoPageShell>
  );
}
