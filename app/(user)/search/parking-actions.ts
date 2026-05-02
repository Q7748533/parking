"use server";

import { turso } from "@/lib/db";

export type ParkingDetail = {
  id: string;
  name: string;
  airportId: string;
  airportCode: string;
  airportName: string;
  type: string;
  pricePerDay: number;
  distance: string;
  features: string;
  affiliateUrl: string;
  description: string;
  addressLine1: string;
  city: string;
  stateCode: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  shuttleService: boolean;
  shuttleFrequency: string;
  shuttleDescription: string;
  cancellationPolicy: string;
  parkingAccess: string;
  customMessage: string;
  rating: number;
  ratingCount: number;
  recommendationPercentage: number;
  contactPhone: string;
  locationType: string;
  strikeOffPrice: number;
  discountPercentage: number;
  operatingHours: string;
  amenities: string;
  reviewSummary: string;
  beenHereCount: number;
  shuttleReccPercentage: number;
  freeCancelAvailable: boolean;
  reviewAiSummary: string;
  additionalFees: string;
  created_at: string;
  updated_at: string;
};

export async function getParkingDetail(idOrSlug: string) {
  try {
    // Try to find by slug first, then by id
    let result = await turso.execute({
      sql: `SELECT 
        p.*,
        a.code as airport_code,
        a.name as airport_name
      FROM parking_providers p
      JOIN airports a ON p.airport_id = a.id
      WHERE p.slug = ?`,
      args: [idOrSlug],
    });

    // If not found by slug, try by id (for backward compatibility)
    if (result.rows.length === 0) {
      result = await turso.execute({
        sql: `SELECT 
          p.*,
          a.code as airport_code,
          a.name as airport_name
        FROM parking_providers p
        JOIN airports a ON p.airport_id = a.id
        WHERE p.id = ?`,
        args: [idOrSlug],
      });
    }

    if (result.rows.length === 0) {
      return { success: false, error: "Parking provider not found" };
    }

    const row = result.rows[0];
    const detail: ParkingDetail = {
      id: String(row.id),
      name: String(row.name),
      airportId: String(row.airport_id),
      airportCode: String(row.airport_code),
      airportName: String(row.airport_name),
      type: String(row.type),
      pricePerDay: Number(row.price_per_day),
      distance: String(row.distance),
      features: String(row.features || ""),
      affiliateUrl: String(row.affiliate_url || ""),
      description: String(row.description || ""),
      addressLine1: String(row.address_line1 || ""),
      city: String(row.city || ""),
      stateCode: String(row.state_code || ""),
      zipCode: String(row.zip_code || ""),
      latitude: String(row.latitude || ""),
      longitude: String(row.longitude || ""),
      shuttleService: Boolean(row.shuttle_service),
      shuttleFrequency: String(row.shuttle_frequency || ""),
      shuttleDescription: String(row.shuttle_description || ""),
      cancellationPolicy: String(row.cancellation_policy || ""),
      parkingAccess: String(row.parking_access || ""),
      customMessage: String(row.custom_message || ""),
      rating: Number(row.rating || 0),
      ratingCount: Number(row.rating_count || 0),
      recommendationPercentage: Number(row.recommendation_percentage || 0),
      contactPhone: String(row.contact_phone || ""),
      locationType: String(row.location_type || ""),
      strikeOffPrice: Number(row.strike_off_price || 0),
      discountPercentage: Number(row.discount_percentage || 0),
      operatingHours: String(row.operating_hours || ""),
      amenities: String(row.amenities || ""),
      reviewSummary: String(row.review_summary || ""),
      beenHereCount: Number(row.been_here_count || 0),
      shuttleReccPercentage: Number(row.shuttle_recc_percentage || 0),
      freeCancelAvailable: Boolean(row.free_cancel_available),
      reviewAiSummary: String(row.review_ai_summary || ""),
      additionalFees: String(row.additional_fees || ""),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
    };

    return { success: true, data: detail };
  } catch (error) {
    console.error("Failed to get parking detail:", error);
    return { success: false, error: "Failed to get parking detail" };
  }
}

export type OtherParkingOption = {
  id: string;
  name: string;
  slug: string;
  type: string;
  pricePerDay: number;
  distance: string;
};

export async function getOtherParkingAtAirport(
  airportId: string,
  excludeId: string,
  limit: number = 4,
) {
  try {
    const result = await turso.execute({
      sql: `SELECT id, name, slug, type, price_per_day, distance
            FROM parking_providers
            WHERE airport_id = ? AND id != ?
            ORDER BY price_per_day ASC
            LIMIT ?`,
      args: [airportId, excludeId, limit],
    });

    const providers: OtherParkingOption[] = result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      type: String(row.type),
      pricePerDay: Number(row.price_per_day),
      distance: String(row.distance),
    }));

    return { success: true, data: providers };
  } catch (error) {
    console.error("Failed to get other parking options:", error);
    return { success: false, data: [] };
  }
}
