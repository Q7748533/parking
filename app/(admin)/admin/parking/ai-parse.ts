"use server";

import { ParkingFormData } from "./actions";
import { turso } from "@/lib/db";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_BASE_URL = process.env.GEMINI_API_BASE_URL || "https://api.vectorengine.ai/v1";
const AI_TIMEOUT_MS = 25_000; // 25 second timeout

/** Auto-match airportId from airportCode in raw JSON */
async function resolveAirportId(airportCode?: string): Promise<string> {
  if (!airportCode || airportCode.length < 3) return "";

  try {
    const result = await turso.execute({
      sql: "SELECT id FROM airports WHERE LOWER(code) = LOWER(?) LIMIT 1",
      args: [airportCode.trim()],
    });
    if (result.rows.length > 0) {
      return String(result.rows[0].id);
    }
  } catch {
    // Silent fallback — user can select manually
  }
  return "";
}

// Typed raw JSON input matching parking provider API shape
interface RawParkingJson {
  listingName?: string;
  name?: string;
  vendorName?: string;
  listingDesc?: string;
  listing_desc?: string;
  description?: string;
  airportDistance?: string;
  airport_distance?: string;
  distance?: string;
  shortUrl?: string;
  short_url?: string;
  affiliateUrl?: string;
  affiliate_url?: string;
  parkingTypes?: RawParkingType[];
  type?: string;
  pricePerDay?: number;
  price_per_day?: number;
  amenities?: RawAmenity[];
  operatingDays?: RawOperatingDay[];
  operating_days?: RawOperatingDay[];
  address?: RawAddress;
  shuttleServiceAvailable?: boolean;
  shuttle_service_available?: boolean;
  shuttleService?: boolean;
  shuttleFrequency?: string;
  shuttle_frequency?: string;
  shuttleDescription?: string;
  shuttle_description?: string;
  cancellationPolicy?: string;
  cancellation_policy?: string;
  parkingAccess?: string;
  customMessage?: string;
  custom_message?: string;
  avgRating?: number;
  avg_rating?: number;
  rating?: number;
  ratingCount?: number;
  rating_count?: number;
  recommendationPercentage?: number;
  recommendation_percentage?: number;
  contactValue?: string;
  contact_value?: string;
  contactPhone?: string;
  contact_phone?: string;
  locationType?: string;
  location_type?: string;
  // Airport code for auto-matching
  airportCode?: string;
  nearbyAirport?: { airportCode?: string; airportName?: string };
  // Social proof & review detail
  beenHereCount?: number;
  shuttleReccPercentage?: number;
  reviewAttribute?: RawReviewAttribute;
}

interface RawReviewAttribute {
  reviewCount?: number;
  locationRating?: number;
  staffRating?: number;
  facilityRating?: number;
  safetyRating?: number;
}

interface RawParkingType {
  parkingMainType?: string;
  parkingType?: string;
  parking_type?: string;
  totalPrice?: number;
  total_price?: number;
  listingPrice?: number;
  listing_price?: number;
  strikeOffPrice?: number;
  strike_off_price?: number;
  discountPercentage?: number;
  discount_percentage?: number;
  freeCancelAvailable?: boolean;
}

interface RawAmenity {
  amenityName: string;
  amenityId?: string;
}

interface RawOperatingDay {
  day: string;
  operatingHours?: { from: string; to: string }[];
}

interface RawAddress {
  addressLine1?: string;
  address_line1?: string;
  address?: string;
  city?: string;
  stateCode?: string;
  state_code?: string;
  state?: string;
  zipCode?: string;
  zip_code?: string;
  zip?: string;
  lat?: string;
  latitude?: string;
  lon?: string;
  longitude?: string;
}

export type ParsedParkingData = {
  success: boolean;
  data?: ParkingFormData;
  error?: string;
  /** Whether AI content generation was used (not just basic extraction) */
  aiGenerated?: boolean;
};

export type ReviewSummaryResult = {
  success: boolean;
  summary?: string;
  error?: string;
};

export async function parseParkingJson(jsonString: string): Promise<ParsedParkingData> {
  try {
    let jsonData: RawParkingJson;
    try {
      jsonData = JSON.parse(jsonString);
    } catch {
      return { success: false, error: "Invalid JSON format" };
    }

    // Auto-match airport if code is present
    const airportCode = jsonData.airportCode || jsonData.nearbyAirport?.airportCode;
    const airportId = await resolveAirportId(airportCode);

    if (!airportId && airportCode) {
      console.warn(`[AI Parse] Airport code "${airportCode}" found in JSON but not matched in DB`);
    }

    const basicData = extractBasicData(jsonData);
    console.log(`[AI Parse] Extracted type=${basicData.type}, airportId=${airportId || "(not matched)"}`);

    const mergedBasic = { ...basicData, airportId };
    const aiResult = await generateContentWithAI(jsonData, mergedBasic);

    if (aiResult.success && aiResult.data) {
      const mergedData: ParkingFormData = {
        ...mergedBasic,
        description: aiResult.data.description || basicData.description,
        features: aiResult.data.features || basicData.features,
        shuttleDescription: aiResult.data.shuttleDescription || basicData.shuttleDescription,
        parkingAccess: aiResult.data.parkingAccess || basicData.parkingAccess,
        customMessage: aiResult.data.customMessage || basicData.customMessage,
        cancellationPolicy: aiResult.data.cancellationPolicy || basicData.cancellationPolicy,
      };

      return { success: true, data: mergedData, aiGenerated: true };
    }

    // AI failed — still return basic data, but flag it
    return { success: true, data: mergedBasic, aiGenerated: false };
  } catch (error) {
    console.error("AI parse error:", error);
    return { success: false, error: "Failed to parse parking data" };
  }
}

/** Normalize Way.com parking type to our format */
function normalizeType(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+park$/, "") // "Covered Self Park" → "covered self"
    .trim();
}

function extractBasicData(jsonData: RawParkingJson): ParkingFormData {
  const parkingType = jsonData.parkingTypes?.[0] ?? {};
  const amenitiesList = jsonData.amenities?.map((a) => a.amenityName).filter(Boolean) ?? [];
  const operatingDays = jsonData.operatingDays ?? jsonData.operating_days ?? [];
  const address = jsonData.address ?? {};

  let parkingAccess = jsonData.parkingAccess ?? "";
  if (parkingAccess) {
    parkingAccess = parkingAccess.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  return {
    name: String(jsonData.listingName ?? jsonData.name ?? jsonData.vendorName ?? ""),
    airportId: "",
    type: normalizeType(String(parkingType.parkingMainType ?? parkingType.parkingType ?? parkingType.parking_type ?? jsonData.type ?? "shuttle")),
    pricePerDay: Number(parkingType.totalPrice ?? parkingType.total_price ?? parkingType.listingPrice ?? parkingType.listing_price ?? jsonData.pricePerDay ?? jsonData.price_per_day ?? 0),
    distance: String(jsonData.airportDistance ?? jsonData.airport_distance ?? jsonData.distance ?? ""),
    features: amenitiesList.join(", "),
    affiliateUrl: String(jsonData.shortUrl ?? jsonData.short_url ?? jsonData.affiliateUrl ?? jsonData.affiliate_url ?? ""),
    description: String(jsonData.listingDesc ?? jsonData.listing_desc ?? jsonData.description ?? ""),
    addressLine1: String(address.addressLine1 ?? address.address_line1 ?? address.address ?? ""),
    city: String(address.city ?? ""),
    stateCode: String(address.stateCode ?? address.state_code ?? address.state ?? ""),
    zipCode: String(address.zipCode ?? address.zip_code ?? address.zip ?? ""),
    latitude: String(address.lat ?? address.latitude ?? ""),
    longitude: String(address.lon ?? address.longitude ?? ""),
    shuttleService: Boolean(jsonData.shuttleServiceAvailable ?? jsonData.shuttle_service_available ?? jsonData.shuttleService ?? false),
    shuttleFrequency: String(jsonData.shuttleFrequency ?? jsonData.shuttle_frequency ?? ""),
    shuttleDescription: String(jsonData.shuttleDescription ?? jsonData.shuttle_description ?? ""),
    cancellationPolicy: String(jsonData.cancellationPolicy ?? jsonData.cancellation_policy ?? ""),
    parkingAccess: parkingAccess || undefined,
    customMessage: String(jsonData.customMessage ?? jsonData.custom_message ?? ""),
    rating: Number(jsonData.avgRating ?? jsonData.avg_rating ?? jsonData.rating ?? 0),
    ratingCount: Number(jsonData.ratingCount ?? jsonData.rating_count ?? 0),
    recommendationPercentage: Number(jsonData.recommendationPercentage ?? jsonData.recommendation_percentage ?? 0),
    contactPhone: String(jsonData.contactValue ?? jsonData.contact_value ?? jsonData.contactPhone ?? jsonData.contact_phone ?? ""),
    locationType: String(jsonData.locationType ?? jsonData.location_type ?? ""),
    strikeOffPrice: Number(parkingType.strikeOffPrice ?? parkingType.strike_off_price ?? 0),
    discountPercentage: Number(parkingType.discountPercentage ?? parkingType.discount_percentage ?? 0),
    operatingHours: operatingDays.length > 0 ? JSON.stringify(operatingDays) : undefined,
    amenities: jsonData.amenities ? JSON.stringify(jsonData.amenities) : undefined,
    // New: review detail as JSON
    reviewSummary: jsonData.reviewAttribute ? JSON.stringify(jsonData.reviewAttribute) : undefined,
    beenHereCount: jsonData.beenHereCount ?? 0,
    shuttleReccPercentage: jsonData.shuttleReccPercentage ?? 0,
    freeCancelAvailable: Boolean(parkingType.freeCancelAvailable),
  };
}

async function generateContentWithAI(
  jsonData: RawParkingJson,
  basicData: ParkingFormData,
): Promise<ParsedParkingData> {
  if (!GEMINI_API_KEY) {
    return { success: false, error: "Gemini API key not configured. Set GEMINI_API_KEY in .env." };
  }

  const prompt = `You are a professional content writer for an airport parking comparison website.

Your task is to analyze the following parking provider data and generate compelling, SEO-friendly content that will help travelers choose this parking option.

INPUT DATA:
${JSON.stringify(jsonData, null, 2)}

BASIC EXTRACTED DATA:
- Name: ${basicData.name}
- Price: $${basicData.pricePerDay}/day
- Distance: ${basicData.distance} miles
- Type: ${basicData.type}
- Rating: ${basicData.rating}/5 (${basicData.ratingCount} reviews)
- Address: ${basicData.addressLine1}, ${basicData.city}, ${basicData.stateCode} ${basicData.zipCode}

GENERATE THE FOLLOWING CONTENT (return ONLY valid JSON):

1. **description**: Rewrite the description to be engaging and informative (2-3 sentences). Highlight key benefits like proximity, security, and shuttle service. Make it sound professional but approachable. DO NOT mention Way.com or any third-party booking platform.

2. **features**: Create a compelling, comma-separated list of top 5-7 amenities. Focus on what matters most to travelers: security, convenience, and comfort. Use natural language like "Free round-trip shuttle" instead of just "Shuttle".

3. **shuttleDescription**: Write a clear, concise description of the shuttle service (1 sentence). Include frequency if available.

4. **parkingAccess**: Rewrite parking instructions to be clear and easy to follow (2-3 sentences max). Remove redundant information and HTML tags. Focus on what customers need to do upon arrival.

5. **customMessage**: Create a brief highlight message (1 sentence) that captures the MAIN SELLING POINT of this parking provider. Examples: "Just 0.8 miles from JFK with complimentary shuttle service every 15 minutes" or "Save up to 40% compared to on-airport parking with our secure off-site facility".

6. **cancellationPolicy**: Simplify the cancellation policy into a clear, reassuring statement (1 sentence). Example: "Cancel anytime before your check-in for a full refund" or "Flexible cancellation with full refund up to the minute you arrive".

OUTPUT FORMAT (valid JSON only):
{
  "description": "string",
  "features": "string",
  "shuttleDescription": "string",
  "parkingAccess": "string",
  "customMessage": "string",
  "cancellationPolicy": "string"
}

RULES:
- Write in natural, professional English for US travelers
- Focus on traveler benefits, not just features
- Keep descriptions concise but compelling
- Avoid generic phrases like "best parking" or "great service"
- Use specific details from the input data (distance, price, rating)
- Make each piece of content unique and valuable
- NEVER mention Way.com, third-party platforms, or booking sites
- customMessage should be a HOOK that grabs attention immediately`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemini-3.1-pro-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { success: false, error: `AI API error: ${response.status}` };
    }

    const aiResponse = await response.json();
    const aiContent: string = aiResponse.choices?.[0]?.message?.content ?? "";

    const parsedData = parseAIResponse(aiContent);

    if (!parsedData) {
      return { success: false, error: "Could not parse AI response" };
    }

    const formData: Partial<ParkingFormData> = {
      description: parsedData.description || basicData.description,
      features: parsedData.features || basicData.features,
      shuttleDescription: parsedData.shuttleDescription || basicData.shuttleDescription,
      parkingAccess: parsedData.parkingAccess || basicData.parkingAccess,
      customMessage: parsedData.customMessage || basicData.customMessage,
      cancellationPolicy: parsedData.cancellationPolicy || basicData.cancellationPolicy,
    };

    return { success: true, data: formData as ParkingFormData };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("AI request timed out");
      return { success: false, error: "AI request timed out — using basic extraction" };
    }
    console.error("AI generation error:", error);
    return { success: false, error: "AI content generation failed" };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function summarizeReviews(
  reviewsText: string,
  providerName: string,
): Promise<ReviewSummaryResult> {
  if (!GEMINI_API_KEY) {
    return { success: false, error: "Gemini API key not configured." };
  }
  if (!reviewsText.trim()) {
    return { success: false, error: "Please paste review text first." };
  }

  const prompt = `You are a professional content writer for an airport parking comparison website.

Read the traveler reviews below for "${providerName}" and write ONE flowing paragraph (500-1200 characters) that helps future travelers understand what to expect from this parking provider.

COVER THESE ASPECTS (in any order, naturally):
- What travelers consistently praise or appreciate
- Any recurring concerns or mixed feedback (honest — only if present in reviews)
- What kind of traveler would find this parking option suitable

WRITING RULES:
- Use natural, conversational English. Vary sentence length and structure.
- CRITICAL: Every parking provider is different. Write a UNIQUE summary that reflects THIS specific provider's reviews. Do NOT follow a formula.
- AVOID formulaic phrases like "stands out as", "the standout feature is", "is ideal for", "top-tier option". Find fresh ways to express the same ideas.
- AVOID generic closings like "travelers return time and again" or "remains a top choice".
- Do NOT use the word "overall" to start a sentence.
- Write as if a friend is telling another friend what to expect — warm, direct, no marketing fluff.
- Minimum 400 characters. Stop at 1200.

FABRICATION PREVENTION (most important — follow strictly):
- ONLY write about things explicitly stated in the reviews. If no review mentions a shuttle, do NOT mention a shuttle. If no review mentions valet service, do NOT describe valet. If no review mentions price, do NOT discuss pricing.
- Before each sentence, silently verify: "Can I point to a specific review that says this?" If the answer is no, delete that sentence.
- If the reviews are vague or short, keep the summary short and honest rather than filling space with assumptions.
- A one-sentence mention of "ready when you arrive" does NOT mean valet service. Do not infer services that are not explicitly described.
- Use the provider name "${providerName}" as-is. If the reviews use a different name (e.g. an old brand name), do NOT mention it. Use only the name given here. No parentheticals like "which many call X" or "aka Y".

REVIEWS TO SUMMARIZE:
${reviewsText.substring(0, 8000)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemini-3.1-pro-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { success: false, error: `AI API error: ${response.status}` };
    }

    const aiResponse = await response.json();
    const summary: string = aiResponse.choices?.[0]?.message?.content ?? "";

    if (!summary.trim()) {
      return { success: false, error: "AI returned empty summary" };
    }

    return { success: true, summary: summary.trim() };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { success: false, error: "AI request timed out" };
    }
    console.error("Review summarization error:", error);
    return { success: false, error: "Failed to summarize reviews" };
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseAIResponse(aiContent: string): Record<string, string> | null {
  // Method 1: Extract from code block
  const codeBlockMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue to next method
    }
  }

  // Method 2: Find JSON object directly
  const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Continue to next method
    }
  }

  // Method 3: Try parsing entire content
  try {
    return JSON.parse(aiContent.trim());
  } catch {
    return null;
  }
}
