import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getParkingDetail, getOtherParkingAtAirport, OtherParkingOption } from "../../../search/parking-actions";
import { ParkingDetailClient } from "./parking-detail-client";
import { OrganizationSchema } from "@/components/schemas/organization-schema";

export const revalidate = 3600;

interface ParkingPageProps {
  params: Promise<{
    code: string;
    parkingId: string;
  }>;
}

export async function generateMetadata({ params }: ParkingPageProps): Promise<Metadata> {
  const { parkingId } = await params;
  const result = await getParkingDetail(parkingId);

  if (!result.success || !result.data) {
    return { title: "Parking Not Found - AirportMatrix" };
  }

  const parking = result.data;
  const cleanName = parking.name.replace(/\s*\([^)]*\)\s*$/i, '').trim();

  const priceStr = `$${parking.pricePerDay.toFixed(2)}/day`;
  const desc = `${cleanName} at ${parking.airportCode} Airport — ${parking.type || "parking"} from ${priceStr}. ${parking.distance ? `${parking.distance} from terminal. ` : ""}${parking.shuttleService ? "Free shuttle included. " : ""}${parking.freeCancelAvailable ? "Free cancellation. " : ""}Book now at AirportMatrix.`;

  return {
    title: `${cleanName} at ${parking.airportCode} | AirportMatrix`,
    description: desc.substring(0, 160),
    keywords: [`${parking.airportCode} parking`, `${cleanName}`, `${parking.airportCode} ${parking.type} parking`, "airport parking"],
    robots: { index: true, follow: true },
    openGraph: {
      title: `${cleanName} — ${priceStr} at ${parking.airportCode}`,
      description: desc.substring(0, 200),
      type: "website",
      locale: "en_US",
      siteName: "AirportMatrix",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cleanName} — ${priceStr} at ${parking.airportCode}`,
      description: desc.substring(0, 200),
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `/airport/${parking.airportCode.toLowerCase()}/${parking.slug || parkingId}`,
    },
  };
}

export default async function ParkingPage({ params }: ParkingPageProps) {
  const { code, parkingId } = await params;
  const result = await getParkingDetail(parkingId);

  if (!result.success || !result.data) {
    notFound();
  }

  const parking = result.data;

  if (parking.airportCode.toLowerCase() !== code.toLowerCase()) {
    notFound();
  }

  const otherResult = await getOtherParkingAtAirport(parking.airportId, parking.id);
  const otherParking: OtherParkingOption[] = otherResult.success && otherResult.data ? otherResult.data : [];

  const cleanName = parking.name.replace(/\s*\([^)]*\)\s*$/i, '').trim();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://airportmatrix.com" },
      { "@type": "ListItem", position: 2, name: `${parking.airportCode} Airport`, item: `https://airportmatrix.com/airport/${parking.airportCode.toLowerCase()}` },
      { "@type": "ListItem", position: 3, name: cleanName, item: `https://airportmatrix.com/airport/${parking.airportCode.toLowerCase()}/${parkingId}` },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cleanName,
    description: parking.description || `${cleanName} at ${parking.airportCode} Airport`,
    image: "https://airportmatrix.com/og-image.png",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: parking.rating,
      reviewCount: parking.ratingCount,
      bestRating: 5,
    },
    ...(parking.reviewAiSummary ? {
      review: {
        "@type": "Review",
        reviewBody: parking.reviewAiSummary,
        author: { "@type": "Organization", name: "AirportMatrix" },
        reviewRating: {
          "@type": "Rating",
          ratingValue: parking.rating,
          bestRating: 5,
        },
      },
    } : {}),
    offers: {
      "@type": "Offer",
      price: parking.pricePerDay.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 0,
      },
      url: `https://airportmatrix.com/airport/${parking.airportCode.toLowerCase()}/${parkingId}`,
    },
  };

  const iLangMetadata = {
    "@context": "https://ilang.ai",
    "@type": "ContentLayer",
    protocol: "I-Lang_v2.0",
    passage: `AirportMatrix.${parking.airportCode}.${cleanName.replace(/\s+/g, '_')}`,
    temporal: "T[0]",
    narrative_voice: "product_detail",
    layers: {
      text: {
        h1: cleanName,
        h2: [
          "What Travelers Say",
          "Amenities & Services",
          `More Parking at ${parking.airportCode}`,
        ],
        h3: ["Rating Breakdown", "Operating Hours", "Shuttle Service", "Cancellation Policy", "Parking Access", "Location Type"],
        state: { system: "AirportMatrix", subject: cleanName, location: `${parking.airportCode}` },
        act: { actor: "@SYSTEM{AirportMatrix}", action: "DISPLAY_DETAIL(parking_provider)", target: "@HUMAN{traveler}" },
        properties: { price: parking.pricePerDay, distance: parking.distance, rating: parking.rating, type: parking.type },
      },
      business: {
        discover: `${parking.airportCode}_premium_parking`,
        gene_immutable: { id: "service_transparency", constraint: "show_all_amenities_and_policies", violation: "hidden_info → booking_abandonment" },
        emotion_field: { trust: 0.9, convenience: 0.85, price_satisfaction: parking.discountPercentage > 10 ? 0.9 : 0.7 },
      },
      user_journey: {
        entry: "parking_detail_view",
        pattern: "scan_details → evaluate_amenities → check_policies → click_reserve",
        decision_factors: ["price_per_day", "shuttle_service", "cancellation_policy", "security_features", "distance_to_terminal"],
      },
    },
    origin: { author: "@SYSTEM{AirportMatrix}", project: "airport-parking-aggregator", license: "commercial", hash: `λ_${parking.id.substring(0, 6)}` },
  };

  return (
    <>
      <OrganizationSchema />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ilang+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(iLangMetadata) }} />
      <ParkingDetailClient parking={parking} otherParking={otherParking} />
    </>
  );
}
