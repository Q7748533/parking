"use client";

import Link from "next/link";
import {
  MapPin,
  Star,
  Phone,
  Clock,
  Car,
  Bus,
  Check,
  ThumbsUp,
  Info,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParkingDetail, OtherParkingOption } from "../../../search/parking-actions";

// Typed structures for parsed JSON fields
interface Amenity {
  amenityName: string;
  amenityId?: string;
}

interface OperatingDay {
  day: string;
  operatingHours?: { from: string; to: string }[];
}

interface ReviewSummary {
  reviewCount?: number;
  locationRating?: number;
  staffRating?: number;
  facilityRating?: number;
  safetyRating?: number;
}

interface ParkingDetailClientProps {
  parking: ParkingDetail;
  otherParking?: OtherParkingOption[];
}

function parseAmenities(raw: string | undefined): Amenity[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.error("Failed to parse amenities JSON");
    return [];
  }
}

function parseOperatingHours(raw: string | undefined): OperatingDay[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.error("Failed to parse operating hours JSON");
    return [];
  }
}

function parseReviewSummary(raw: string | undefined): ReviewSummary | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isOpen24x7(days: OperatingDay[]): boolean {
  if (days.length === 0) return false;
  return days.every(
    (d) =>
      d.operatingHours?.[0]?.from === "00:00:00" &&
      d.operatingHours?.[0]?.to === "23:59:00"
  );
}

function formatTime(time: string): string {
  return time.substring(0, 5);
}

function RatingBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-20 text-gray-600 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-gray-900 font-medium">{value.toFixed(1)}</span>
    </div>
  );
}

export function ParkingDetailClient({ parking, otherParking = [] }: ParkingDetailClientProps) {
  const amenities = parseAmenities(parking.amenities);
  const operatingHours = parseOperatingHours(parking.operatingHours);
  const reviewSummary = parseReviewSummary(parking.reviewSummary);
  const is24x7 = isOpen24x7(operatingHours);

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/airport/${parking.airportCode.toLowerCase()}`} className="hover:text-gray-900 transition-colors">
              {parking.airportCode} Airport
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{parking.name.replace(/\s*\([^)]*\)\s*$/i, '').trim()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section 1 — Title & Overview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {parking.name.replace(/\s*\([^)]*\)\s*$/i, '').trim()}
                    </h1>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {parking.addressLine1 ? `${parking.addressLine1}, ` : ""}
                      {parking.city ? `${parking.city}, ` : ""}
                      {parking.stateCode} {parking.zipCode}
                    </p>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    <Check className="w-3 h-3 mr-1" />
                    VERIFIED
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-lg font-bold">{parking.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-500">({parking.ratingCount.toLocaleString()} reviews)</span>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <ThumbsUp className="w-4 h-4" />
                    {parking.recommendationPercentage}% recommended
                  </div>
                  {parking.beenHereCount > 0 && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-sm text-gray-500">
                        {parking.beenHereCount.toLocaleString()} parked here
                      </span>
                    </>
                  )}
                </div>

                {parking.customMessage && (
                  <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-lg p-3 mt-3">
                    <Star className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-800 font-medium">{parking.customMessage}</p>
                  </div>
                )}
              </div>

              {/* Section 2 — Traveler Insights */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {/* AI Description */}
                {parking.description ? (
                  <div className="mb-6">
                    <p className="text-sm text-gray-700 leading-relaxed">{parking.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center mb-6">No description available yet.</p>
                )}

                {/* What Travelers Say */}
                {parking.reviewAiSummary ? (
                  <div className={parking.description ? "pt-6 border-t border-gray-100" : ""}>
                    <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#6366f1]" />
                      What Travelers Say
                    </h2>
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{parking.reviewAiSummary}</p>
                    </div>
                    {parking.ratingCount > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Based on {parking.ratingCount.toLocaleString()} traveler reviews
                      </p>
                    )}
                  </div>
                ) : (
                  <div className={parking.description ? "pt-6 border-t border-gray-100" : ""}>
                    <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#6366f1]" />
                      What Travelers Say
                    </h2>

                  <p className="text-sm text-gray-500">
                    Check back soon for a summary of what travelers say about {parking.name.replace(/\s*\([^)]*\)\s*$/i, '').trim()}.
                  </p>
                  </div>
                )}

                {/* Rating Breakdown */}
                {reviewSummary ? (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Rating Breakdown</h3>
                    <div className="space-y-2">
                      {reviewSummary.staffRating != null && <RatingBar label="Staff" value={reviewSummary.staffRating} />}
                      {reviewSummary.facilityRating != null && <RatingBar label="Facility" value={reviewSummary.facilityRating} />}
                      {reviewSummary.locationRating != null && <RatingBar label="Location" value={reviewSummary.locationRating} />}
                      {reviewSummary.safetyRating != null && <RatingBar label="Safety" value={reviewSummary.safetyRating} />}
                    </div>
                  </div>
                ) : (
                  parking.rating > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Rating Breakdown</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-lg font-bold">{parking.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 ml-2">({parking.ratingCount.toLocaleString()} reviews)</span>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Section 3 — Amenities & Services (Features + Hours + Shuttle + Policies) */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Amenities & Services</h2>

                {/* Key Features */}
                {parking.features && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {parking.features.split(",").map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                          <Check className="w-3 h-3 mr-1 text-green-500" />
                          {feature.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operating Hours */}
                {operatingHours.length > 0 && (
                  <div className={parking.features ? "pt-5 border-t border-gray-100" : ""}>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Operating Hours</h3>
                    {is24x7 ? (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">Open 24 Hours, 7 Days a Week</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {operatingHours.map((day, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{day.day}</span>
                            <span className="text-gray-900">
                              {day.operatingHours?.[0]
                                ? `${formatTime(day.operatingHours[0].from)} - ${formatTime(day.operatingHours[0].to)}`
                                : "Closed"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Shuttle */}
                {parking.shuttleService && (
                  <div className={operatingHours.length > 0 || parking.features ? "mt-5 pt-5 border-t border-gray-100" : ""}>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Shuttle Service</h3>
                    {parking.shuttleDescription && (
                      <p className="text-sm text-gray-700 mb-2">{parking.shuttleDescription}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Bus className="w-4 h-4 text-[#6366f1]" />
                        {parking.shuttleFrequency || "Free shuttle available"}
                      </span>
                      {parking.shuttleReccPercentage > 0 && (
                        <span className="text-xs text-gray-500">
                          {parking.shuttleReccPercentage}% recommend the shuttle
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Policies */}
                {(parking.cancellationPolicy || parking.parkingAccess) && (
                  <div className={parking.shuttleService || operatingHours.length > 0 || parking.features ? "mt-5 pt-5 border-t border-gray-100" : ""}>
                    <div className="space-y-4">
                      {parking.cancellationPolicy && (
                        <div className="flex items-start gap-3">
                          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Cancellation Policy</h4>
                            <p className="text-sm text-green-700 mt-1 bg-green-50 rounded-lg p-2.5">
                              {parking.cancellationPolicy}
                            </p>
                          </div>
                        </div>
                      )}
                      {parking.parkingAccess && (
                        <div className="flex items-start gap-3">
                          <Car className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Parking Access</h4>
                            <p className="text-sm text-gray-700 mt-1 bg-gray-50 rounded-lg p-2.5">
                              {parking.parkingAccess}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            {/* Other Parking Options at This Airport */}
            {otherParking.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  More Parking at {parking.airportCode}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {otherParking.map((opt) => (
                    <a
                      key={opt.id}
                      href={`/airport/${parking.airportCode.toLowerCase()}/${opt.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#6366f1] hover:shadow-sm transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{opt.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {opt.distance} miles · {opt.type}
                        </p>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <p className="text-sm font-bold text-[#6366f1]">${opt.pricePerDay.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">/day</p>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <a
                    href={`/airport/${parking.airportCode.toLowerCase()}`}
                    className="text-sm font-medium text-[#6366f1] hover:text-[#5558e0] transition-colors"
                  >
                    View all {parking.airportCode} parking →
                  </a>
                </div>
              </div>
            )}
            </div>

          {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <div className="text-lg font-semibold text-gray-900 mb-4">Book Parking</div>
                
                {/* Price */}
                <div className="mb-4">
                  {parking.strikeOffPrice > 0 && (
                    <div className="text-sm text-gray-400 line-through">
                      ${parking.strikeOffPrice.toFixed(2)}
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#6366f1]">
                      ${parking.pricePerDay.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">/day</span>
                  </div>
                  {parking.discountPercentage > 0 && (
                    <Badge className="mt-1 bg-red-50 text-red-700 border-red-200">
                      Save {parking.discountPercentage}%
                    </Badge>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {parking.distance} miles to airport
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {is24x7 ? "Open 24/7" : "See hours below"}
                  </div>
                  {parking.shuttleService && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Bus className="w-4 h-4" />
                      Free shuttle
                    </div>
                  )}
                  {parking.freeCancelAvailable && (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Check className="w-4 h-4" />
                      Free cancellation
                    </div>
                  )}
                </div>

                {/* CTA */}
                {parking.affiliateUrl ? (
                  <a
                    href={parking.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="block w-full"
                  >
                    <Button className="w-full bg-[#6366f1] hover:bg-[#5558e0] text-white font-semibold rounded-lg py-3 transition-colors">
                      RESERVE PARKING
                    </Button>
                  </a>
                ) : (
                  <Button className="w-full bg-[#6366f1] hover:bg-[#5558e0] text-white font-semibold rounded-lg py-3 transition-colors">
                    RESERVE PARKING
                  </Button>
                )}

                {/* Contact */}
                {parking.contactPhone && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                      href={`tel:${parking.contactPhone}`}
                      className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#6366f1] transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {parking.contactPhone}
                    </a>
                  </div>
                )}
              </div>

              {/* Additional Fees */}
              {parking.additionalFees && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Additional Fees</h3>
                  <p className="text-xs text-gray-600">{parking.additionalFees}</p>
                </div>
              )}

              {/* Location Type */}
              {parking.locationType && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Location Type</h3>
                  <p className="text-sm text-gray-600">{parking.locationType}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
