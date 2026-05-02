"use server";

import { revalidatePath } from "next/cache";
import { turso } from "@/lib/db";
import { generateSlug, generateUniqueSlug } from "@/lib/slug";
import {
  validateParkingName,
  validateAirportId,
  validateParkingType,
  validatePricePerDay,
  validateDistance,
  validateStringField,
  validateUrl,
  validateNumberRange,
  validateBoolean,
  validatePhone,
  validateJSONString,
  validateCoordinate,
  combineValidations,
} from "@/lib/validate";

export type ParkingFormData = {
  name: string;
  airportId: string;
  type: string;
  pricePerDay: number;
  distance: string;
  features: string;
  affiliateUrl: string;
  description?: string;
  addressLine1?: string;
  city?: string;
  stateCode?: string;
  zipCode?: string;
  latitude?: string;
  longitude?: string;
  shuttleService?: boolean;
  shuttleFrequency?: string;
  shuttleDescription?: string;
  cancellationPolicy?: string;
  parkingAccess?: string;
  customMessage?: string;
  rating?: number;
  ratingCount?: number;
  recommendationPercentage?: number;
  contactPhone?: string;
  locationType?: string;
  strikeOffPrice?: number;
  discountPercentage?: number;
  operatingHours?: string;
  amenities?: string;
  reviewSummary?: string;
  beenHereCount?: number;
  shuttleReccPercentage?: number;
  freeCancelAvailable?: boolean;
  reviewAiSummary?: string;
  additionalFees?: string;
};

export type ParkingProvider = {
  id: string;
  name: string;
  slug: string;
  airportId: string;
  airportCode?: string;
  airportName?: string;
  type: string;
  pricePerDay: number;
  distance: string;
  features: string;
  affiliateUrl: string;
  description?: string;
  addressLine1?: string;
  city?: string;
  stateCode?: string;
  zipCode?: string;
  latitude?: string;
  longitude?: string;
  shuttleService?: boolean;
  shuttleFrequency?: string;
  shuttleDescription?: string;
  cancellationPolicy?: string;
  parkingAccess?: string;
  customMessage?: string;
  rating?: number;
  ratingCount?: number;
  recommendationPercentage?: number;
  contactPhone?: string;
  locationType?: string;
  strikeOffPrice?: number;
  discountPercentage?: number;
  operatingHours?: string;
  amenities?: string;
  reviewSummary?: string;
  beenHereCount?: number;
  shuttleReccPercentage?: number;
  freeCancelAvailable?: boolean;
  reviewAiSummary?: string;
  additionalFees?: string;
  created_at: string;
  updated_at: string;
};

export type Airport = {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
};

function rowToParking(row: Record<string, unknown>): ParkingProvider {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    airportId: String(row.airport_id),
    airportCode: row.airport_code ? String(row.airport_code) : undefined,
    airportName: row.airport_name ? String(row.airport_name) : undefined,
    type: String(row.type),
    pricePerDay: Number(row.price_per_day),
    distance: String(row.distance),
    features: String(row.features),
    affiliateUrl: String(row.affiliate_url),
    description: row.description ? String(row.description) : undefined,
    addressLine1: row.address_line1 ? String(row.address_line1) : undefined,
    city: row.city ? String(row.city) : undefined,
    stateCode: row.state_code ? String(row.state_code) : undefined,
    zipCode: row.zip_code ? String(row.zip_code) : undefined,
    latitude: row.latitude ? String(row.latitude) : undefined,
    longitude: row.longitude ? String(row.longitude) : undefined,
    shuttleService: row.shuttle_service ? Boolean(row.shuttle_service) : false,
    shuttleFrequency: row.shuttle_frequency ? String(row.shuttle_frequency) : undefined,
    shuttleDescription: row.shuttle_description ? String(row.shuttle_description) : undefined,
    cancellationPolicy: row.cancellation_policy ? String(row.cancellation_policy) : undefined,
    parkingAccess: row.parking_access ? String(row.parking_access) : undefined,
    customMessage: row.custom_message ? String(row.custom_message) : undefined,
    rating: row.rating ? Number(row.rating) : 0,
    ratingCount: row.rating_count ? Number(row.rating_count) : 0,
    recommendationPercentage: row.recommendation_percentage ? Number(row.recommendation_percentage) : 0,
    contactPhone: row.contact_phone ? String(row.contact_phone) : undefined,
    locationType: row.location_type ? String(row.location_type) : undefined,
    strikeOffPrice: row.strike_off_price ? Number(row.strike_off_price) : 0,
    discountPercentage: row.discount_percentage ? Number(row.discount_percentage) : 0,
    operatingHours: row.operating_hours ? String(row.operating_hours) : undefined,
    amenities: row.amenities ? String(row.amenities) : undefined,
    reviewSummary: row.review_summary ? String(row.review_summary) : undefined,
    beenHereCount: row.been_here_count ? Number(row.been_here_count) : 0,
    shuttleReccPercentage: row.shuttle_recc_percentage ? Number(row.shuttle_recc_percentage) : 0,
    freeCancelAvailable: row.free_cancel_available ? Boolean(row.free_cancel_available) : false,
    reviewAiSummary: row.review_ai_summary ? String(row.review_ai_summary) : undefined,
    additionalFees: row.additional_fees ? String(row.additional_fees) : undefined,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function getParkingProviders(page: number = 1, pageSize: number = 50) {
  try {
    const offset = (page - 1) * pageSize;

    const [dataResult, countResult] = await Promise.all([
      turso.execute({
        sql: `SELECT p.*, a.code as airport_code, a.name as airport_name
              FROM parking_providers p
              JOIN airports a ON p.airport_id = a.id
              ORDER BY p.created_at DESC
              LIMIT ? OFFSET ?`,
        args: [pageSize, offset],
      }),
      turso.execute("SELECT COUNT(*) as total FROM parking_providers"),
    ]);

    const providers = dataResult.rows.map(rowToParking);
    const total = Number(countResult.rows[0]?.total ?? 0);

    return { success: true, data: providers, total, page, pageSize };
  } catch (error) {
    console.error("Failed to fetch parking providers:", error);
    return { success: false, error: "Failed to fetch parking providers" };
  }
}

export async function getAirports() {
  try {
    const result = await turso.execute("SELECT id, code, name, city, state FROM airports ORDER BY code ASC");
    const airports = result.rows.map((row) => ({
      id: String(row.id),
      code: String(row.code),
      name: String(row.name),
      city: String(row.city),
      state: String(row.state),
    }));
    return { success: true, data: airports };
  } catch (error) {
    console.error("Failed to fetch airports:", error);
    return { success: false, error: "Failed to fetch airports" };
  }
}

export async function createParkingProvider(data: ParkingFormData) {
  try {
    // Server-side validation — validate every field before touching the database
    const validation = combineValidations(
      validateParkingName(data.name),
      validateAirportId(data.airportId),
      validateParkingType(data.type),
      validatePricePerDay(data.pricePerDay),
      validateDistance(data.distance),
      validateStringField(data.features, "features", 1000),
      validateUrl(data.affiliateUrl, "affiliateUrl"),
      validateStringField(data.description, "description", 5000),
      validateStringField(data.addressLine1, "addressLine1", 200),
      validateStringField(data.city, "city", 100),
      validateStringField(data.stateCode, "stateCode", 10),
      validateStringField(data.zipCode, "zipCode", 20),
      validateCoordinate(data.latitude, "latitude"),
      validateCoordinate(data.longitude, "longitude"),
      validateBoolean(data.shuttleService, "shuttleService"),
      validateStringField(data.shuttleFrequency, "shuttleFrequency", 200),
      validateStringField(data.shuttleDescription, "shuttleDescription", 1000),
      validateStringField(data.cancellationPolicy, "cancellationPolicy", 1000),
      validateStringField(data.parkingAccess, "parkingAccess", 2000),
      validateStringField(data.customMessage, "customMessage", 500),
      validateNumberRange(data.rating, "rating", 0, 5),
      validateNumberRange(data.ratingCount, "ratingCount", 0, 999999),
      validateNumberRange(data.recommendationPercentage, "recommendationPercentage", 0, 100),
      validatePhone(data.contactPhone, "contactPhone"),
      validateStringField(data.locationType, "locationType", 50),
      validateNumberRange(data.strikeOffPrice, "strikeOffPrice", 0, 10000),
      validateNumberRange(data.discountPercentage, "discountPercentage", 0, 100),
      validateJSONString(data.operatingHours, "operatingHours"),
      validateJSONString(data.amenities, "amenities"),
    );
    if (!validation.valid) {
      return { success: false, error: validation.errors[0].message };
    }

    const id = crypto.randomUUID();
    
    // Generate slug from name
    let slug = generateSlug(data.name);
    
    // Check if slug already exists and make it unique if needed
    const existingResult = await turso.execute({
      sql: "SELECT slug FROM parking_providers WHERE slug = ?",
      args: [slug],
    });
    
    if (existingResult.rows.length > 0) {
      // Get all existing slugs with same prefix
      const allSlugsResult = await turso.execute({
        sql: "SELECT slug FROM parking_providers WHERE slug LIKE ?",
        args: [`${slug}%`],
      });
      const existingSlugs = allSlugsResult.rows.map(row => String(row.slug));
      slug = generateUniqueSlug(data.name, existingSlugs);
    }
    
    await turso.execute({
      sql: `INSERT INTO parking_providers
            (id, name, slug, airport_id, type, price_per_day, distance, features, affiliate_url,
             description, address_line1, city, state_code, zip_code, latitude, longitude,
             shuttle_service, shuttle_frequency, shuttle_description, cancellation_policy,
             parking_access, custom_message, rating, rating_count, recommendation_percentage,
             contact_phone, location_type, strike_off_price, discount_percentage,
             operating_hours, amenities, review_summary, been_here_count,
             shuttle_recc_percentage, free_cancel_available, review_ai_summary, additional_fees)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, data.name, slug, data.airportId, data.type, data.pricePerDay, data.distance, 
        data.features, data.affiliateUrl, data.description || null, data.addressLine1 || null,
        data.city || null, data.stateCode || null, data.zipCode || null, data.latitude || null,
        data.longitude || null, data.shuttleService ? 1 : 0, data.shuttleFrequency || null,
        data.shuttleDescription || null, data.cancellationPolicy || null, data.parkingAccess || null,
        data.customMessage || null, data.rating || 0, data.ratingCount || 0,
        data.recommendationPercentage || 0, data.contactPhone || null, data.locationType || null,
        data.strikeOffPrice || 0, data.discountPercentage || 0, data.operatingHours || null,
        data.amenities || null, data.reviewSummary || null, data.beenHereCount || 0,
        data.shuttleReccPercentage || 0, data.freeCancelAvailable ? 1 : 0,
        data.reviewAiSummary || null, data.additionalFees || null,
      ],
    });
    revalidatePath("/(admin)/admin/parking");
    revalidatePath("/");
    return { success: true, data: { id, slug } };
  } catch (error) {
    console.error("Failed to create parking provider:", error);
    return { success: false, error: "Failed to create parking provider" };
  }
}

export async function updateParkingProvider(id: string, data: ParkingFormData) {
  try {
    // Server-side validation — same rules as create
    const validation = combineValidations(
      validateParkingName(data.name),
      validateAirportId(data.airportId),
      validateParkingType(data.type),
      validatePricePerDay(data.pricePerDay),
      validateDistance(data.distance),
      validateStringField(data.features, "features", 1000),
      validateUrl(data.affiliateUrl, "affiliateUrl"),
      validateStringField(data.description, "description", 5000),
      validateStringField(data.addressLine1, "addressLine1", 200),
      validateStringField(data.city, "city", 100),
      validateStringField(data.stateCode, "stateCode", 10),
      validateStringField(data.zipCode, "zipCode", 20),
      validateCoordinate(data.latitude, "latitude"),
      validateCoordinate(data.longitude, "longitude"),
      validateBoolean(data.shuttleService, "shuttleService"),
      validateStringField(data.shuttleFrequency, "shuttleFrequency", 200),
      validateStringField(data.shuttleDescription, "shuttleDescription", 1000),
      validateStringField(data.cancellationPolicy, "cancellationPolicy", 1000),
      validateStringField(data.parkingAccess, "parkingAccess", 2000),
      validateStringField(data.customMessage, "customMessage", 500),
      validateNumberRange(data.rating, "rating", 0, 5),
      validateNumberRange(data.ratingCount, "ratingCount", 0, 999999),
      validateNumberRange(data.recommendationPercentage, "recommendationPercentage", 0, 100),
      validatePhone(data.contactPhone, "contactPhone"),
      validateStringField(data.locationType, "locationType", 50),
      validateNumberRange(data.strikeOffPrice, "strikeOffPrice", 0, 10000),
      validateNumberRange(data.discountPercentage, "discountPercentage", 0, 100),
      validateJSONString(data.operatingHours, "operatingHours"),
      validateJSONString(data.amenities, "amenities"),
    );
    if (!validation.valid) {
      return { success: false, error: validation.errors[0].message };
    }

    // Generate new slug from name
    let slug = generateSlug(data.name);
    
    // Check if slug already exists for other providers
    const existingResult = await turso.execute({
      sql: "SELECT slug FROM parking_providers WHERE slug = ? AND id != ?",
      args: [slug, id],
    });
    
    if (existingResult.rows.length > 0) {
      // Get all existing slugs with same prefix
      const allSlugsResult = await turso.execute({
        sql: "SELECT slug FROM parking_providers WHERE slug LIKE ? AND id != ?",
        args: [`${slug}%`, id],
      });
      const existingSlugs = allSlugsResult.rows.map(row => String(row.slug));
      slug = generateUniqueSlug(data.name, existingSlugs);
    }
    
    await turso.execute({
      sql: `UPDATE parking_providers SET
            name = ?, slug = ?, airport_id = ?, type = ?, price_per_day = ?, distance = ?,
            features = ?, affiliate_url = ?, description = ?, address_line1 = ?,
            city = ?, state_code = ?, zip_code = ?, latitude = ?, longitude = ?,
            shuttle_service = ?, shuttle_frequency = ?, shuttle_description = ?,
            cancellation_policy = ?, parking_access = ?, custom_message = ?,
            rating = ?, rating_count = ?, recommendation_percentage = ?,
            contact_phone = ?, location_type = ?, strike_off_price = ?,
            discount_percentage = ?, operating_hours = ?, amenities = ?,
            review_summary = ?, been_here_count = ?, shuttle_recc_percentage = ?,
            free_cancel_available = ?, review_ai_summary = ?, additional_fees = ?,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [
        data.name, slug, data.airportId, data.type, data.pricePerDay, data.distance,
        data.features, data.affiliateUrl, data.description || null, data.addressLine1 || null,
        data.city || null, data.stateCode || null, data.zipCode || null, data.latitude || null,
        data.longitude || null, data.shuttleService ? 1 : 0, data.shuttleFrequency || null,
        data.shuttleDescription || null, data.cancellationPolicy || null, data.parkingAccess || null,
        data.customMessage || null, data.rating || 0, data.ratingCount || 0,
        data.recommendationPercentage || 0, data.contactPhone || null, data.locationType || null,
        data.strikeOffPrice || 0, data.discountPercentage || 0, data.operatingHours || null,
        data.amenities || null, data.reviewSummary || null, data.beenHereCount || 0,
        data.shuttleReccPercentage || 0, data.freeCancelAvailable ? 1 : 0,
        data.reviewAiSummary || null, data.additionalFees || null, id,
      ],
    });
    revalidatePath("/(admin)/admin/parking");
    revalidatePath("/");
    return { success: true, data: { slug } };
  } catch (error) {
    console.error("Failed to update parking provider:", error);
    return { success: false, error: "Failed to update parking provider" };
  }
}

export async function deleteParkingProvider(id: string) {
  try {
    await turso.execute({
      sql: "DELETE FROM parking_providers WHERE id = ?",
      args: [id],
    });
    revalidatePath("/(admin)/admin/parking");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete parking provider:", error);
    return { success: false, error: "Failed to delete parking provider" };
  }
}
