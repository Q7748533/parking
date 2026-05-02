import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Plane } from "lucide-react";
import { turso } from "@/lib/db";
import { OrganizationSchema } from "@/components/schemas/organization-schema";

export const revalidate = 3600;

// Map URL slugs to state codes
const SLUG_TO_STATE: Record<string, { code: string; name: string }> = {
  alabama: { code: "AL", name: "Alabama" },
  alaska: { code: "AK", name: "Alaska" },
  arizona: { code: "AZ", name: "Arizona" },
  arkansas: { code: "AR", name: "Arkansas" },
  california: { code: "CA", name: "California" },
  colorado: { code: "CO", name: "Colorado" },
  connecticut: { code: "CT", name: "Connecticut" },
  delaware: { code: "DE", name: "Delaware" },
  florida: { code: "FL", name: "Florida" },
  georgia: { code: "GA", name: "Georgia" },
  hawaii: { code: "HI", name: "Hawaii" },
  idaho: { code: "ID", name: "Idaho" },
  illinois: { code: "IL", name: "Illinois" },
  indiana: { code: "IN", name: "Indiana" },
  iowa: { code: "IA", name: "Iowa" },
  kansas: { code: "KS", name: "Kansas" },
  kentucky: { code: "KY", name: "Kentucky" },
  louisiana: { code: "LA", name: "Louisiana" },
  maine: { code: "ME", name: "Maine" },
  maryland: { code: "MD", name: "Maryland" },
  massachusetts: { code: "MA", name: "Massachusetts" },
  michigan: { code: "MI", name: "Michigan" },
  minnesota: { code: "MN", name: "Minnesota" },
  mississippi: { code: "MS", name: "Mississippi" },
  missouri: { code: "MO", name: "Missouri" },
  montana: { code: "MT", name: "Montana" },
  nebraska: { code: "NE", name: "Nebraska" },
  nevada: { code: "NV", name: "Nevada" },
  "new-hampshire": { code: "NH", name: "New Hampshire" },
  "new-jersey": { code: "NJ", name: "New Jersey" },
  "new-mexico": { code: "NM", name: "New Mexico" },
  "new-york": { code: "NY", name: "New York" },
  "north-carolina": { code: "NC", name: "North Carolina" },
  "north-dakota": { code: "ND", name: "North Dakota" },
  ohio: { code: "OH", name: "Ohio" },
  oklahoma: { code: "OK", name: "Oklahoma" },
  oregon: { code: "OR", name: "Oregon" },
  pennsylvania: { code: "PA", name: "Pennsylvania" },
  "rhode-island": { code: "RI", name: "Rhode Island" },
  "south-carolina": { code: "SC", name: "South Carolina" },
  "south-dakota": { code: "SD", name: "South Dakota" },
  tennessee: { code: "TN", name: "Tennessee" },
  texas: { code: "TX", name: "Texas" },
  utah: { code: "UT", name: "Utah" },
  vermont: { code: "VT", name: "Vermont" },
  virginia: { code: "VA", name: "Virginia" },
  washington: { code: "WA", name: "Washington" },
  "west-virginia": { code: "WV", name: "West Virginia" },
  wisconsin: { code: "WI", name: "Wisconsin" },
  wyoming: { code: "WY", name: "Wyoming" },
};

interface AirportRow {
  id: string;
  code: string;
  name: string;
  city: string;
  providerCount: number;
}

async function getStateAirports(stateCode: string): Promise<AirportRow[]> {
  const result = await turso.execute({
    sql: `SELECT a.id, a.code, a.name, a.city, COUNT(p.id) as provider_count
          FROM airports a
          LEFT JOIN parking_providers p ON a.id = p.airport_id
          WHERE UPPER(a.state) = ?
          GROUP BY a.id
          ORDER BY a.code ASC`,
    args: [stateCode],
  });
  return result.rows.map((row) => ({
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    city: String(row.city),
    providerCount: Number(row.provider_count),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const stateInfo = SLUG_TO_STATE[state.toLowerCase()];
  if (!stateInfo) return { title: "Not Found - AirportMatrix" };

  return {
    title: `Airport Parking in ${stateInfo.name} — Compare & Book Deals | AirportMatrix`,
    description: `Find cheap airport parking across ${stateInfo.name}. Browse parking at all ${stateInfo.code} airports and save up to 60%.`,
    robots: { index: true, follow: true },
    alternates: { canonical: `/airport-parking/${state.toLowerCase()}` },
    openGraph: {
      title: `Airport Parking in ${stateInfo.name}`,
      description: `Find the best airport parking deals in ${stateInfo.name}.`,
      type: "website",
      siteName: "AirportMatrix",
    },
  };
}

export default async function StateParkingPage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const stateInfo = SLUG_TO_STATE[state.toLowerCase()];
  if (!stateInfo) notFound();

  const airports = await getStateAirports(stateInfo.code);
  const totalProviders = airports.reduce((sum, a) => sum + a.providerCount, 0);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://airportmatrix.com" },
      { "@type": "ListItem", position: 2, name: `${stateInfo.name} Airport Parking`, item: `https://airportmatrix.com/airport-parking/${state.toLowerCase()}` },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Airports with Parking in ${stateInfo.name}`,
    numberOfItems: airports.length,
    itemListElement: airports.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Airport",
        "@id": `https://airportmatrix.com/airport/${a.code.toLowerCase()}`,
        name: a.name,
        iataCode: a.code,
        address: { "@type": "PostalAddress", addressLocality: a.city, addressRegion: stateInfo.code, addressCountry: "US" },
        url: `https://airportmatrix.com/airport/${a.code.toLowerCase()}`,
      },
    })),
  };

  const iLangMetadata = {
    "@context": "https://ilang.ai",
    "@type": "ContentLayer",
    protocol: "I-Lang_v2.0",
    passage: `AirportMatrix.StateParking.${stateInfo.code}`,
    temporal: "T[0]",
    narrative_voice: "directory_index",
    layers: {
      text: {
        h1: `Airport Parking in ${stateInfo.name}`,
        h2: [`${stateInfo.name} Airports`, "Nearby States"],
        state: { system: "AirportMatrix", purpose: "state_airport_parking_directory", coverage: `${airports.length} airports in ${stateInfo.code}` },
        act: { actor: "@SYSTEM{AirportMatrix}", action: "LIST_AIRPORTS_BY_STATE(${stateInfo.code})", target: "@HUMAN{traveler}" },
      },
      business: {
        discover: `${stateInfo.code}_airport_parking_coverage`,
        gene_immutable: { id: "regional_coverage", constraint: "list_all_state_airports_with_parking", violation: "missing_airports → incomplete_directory" },
        emotion_field: { confidence: 0.9 },
      },
      user_journey: {
        entry: `browse_${stateInfo.code.toLowerCase()}_airport_parking`,
        pattern: "scan_state_list → select_airport → view_parking_options → compare_and_book",
        decision_factors: ["airport_proximity", "parking_availability", "price_range"],
      },
    },
    origin: { author: "@SYSTEM{AirportMatrix}", project: "airport-parking-aggregator", license: "commercial", hash: `λ_state_${stateInfo.code}_0x${stateInfo.code}` },
  };

  return (
    <>
      <OrganizationSchema />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Airport Parking in ${stateInfo.name}`,
          description: `Browse ${airports.length} airports with parking in ${stateInfo.name}.`,
          mainEntity: itemListSchema,
        }),
      }} />
      <script type="application/ilang+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(iLangMetadata) }} />
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/airports" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            All Airports
          </a>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Airport Parking in {stateInfo.name}</h1>
          <p className="text-sm text-gray-600">
            {airports.length} airport{airports.length !== 1 ? "s" : ""} with {totalProviders} parking options across {stateInfo.name}.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {airports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {airports.map((airport) => (
                <Link
                  key={airport.id}
                  href={`/airport/${airport.code.toLowerCase()}`}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:border-[#6366f1] hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="font-semibold text-gray-900">
                      {airport.name} <span className="text-[#6366f1]">({airport.code})</span>
                    </h2>
                    <Plane className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" />
                    {airport.city}, {stateInfo.code}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {airport.providerCount > 0
                        ? `${airport.providerCount} parking option${airport.providerCount !== 1 ? "s" : ""}`
                        : "No parking yet"}
                    </span>
                    <span className="text-sm font-medium text-[#6366f1]">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No airports found in {stateInfo.name}. <Link href="/airports" className="text-[#6366f1] hover:underline">Browse all airports</Link>.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
