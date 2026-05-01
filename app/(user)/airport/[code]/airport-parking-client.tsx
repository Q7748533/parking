"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ParkingProvider {
  id: string;
  name: string;
  slug: string;
  airportId: string;
  type: string;
  pricePerDay: number;
  distance: string;
  features: string;
  affiliateUrl: string;
  created_at: string;
  updated_at: string;
}

interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  created_at: string;
  updated_at: string;
}

interface AirportParkingClientProps {
  airport: Airport;
  parkingProviders: ParkingProvider[];
  error?: string;
}

export function AirportParkingClient({ airport, parkingProviders, error }: AirportParkingClientProps) {
  const [sortBy, setSortBy] = useState<"price" | "distance">("price");

  const sortedProviders = [...parkingProviders].sort((a, b) => {
    if (sortBy === "price") {
      return a.pricePerDay - b.pricePerDay;
    }
    if (sortBy === "distance") {
      return (parseFloat(a.distance) || 0) - (parseFloat(b.distance) || 0);
    }
    return 0;
  });

  return (
    <>
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs text-red-600 underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      <section className="flex-1 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {parkingProviders.length} Parking Options Found
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSortBy("price")}
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  sortBy === "price" ? "text-[#6366f1]" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Cheapest First
              </button>
              <button
                onClick={() => setSortBy("distance")}
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  sortBy === "distance" ? "text-[#6366f1]" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Closest First
              </button>
            </div>
          </div>

          {/* Parking Table - Desktop */}
          {sortedProviders.length > 0 ? (
            <>
              {/* Desktop Table (hidden on mobile) */}
              <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full" aria-label="Parking providers at this airport">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="text-left px-5 py-3 w-4/12">Provider</th>
                      <th className="text-left px-5 py-3 w-2/12">Type</th>
                      <th className="text-left px-5 py-3 w-2/12">Distance</th>
                      <th className="text-left px-5 py-3 w-2/12">Price/Day</th>
                      <th className="text-right px-5 py-3 w-2/12">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProviders.map((provider) => (
                      <tr
                        key={provider.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <Link href={`/airport/${airport.code.toLowerCase()}/${provider.slug}`}>
                            <span className="font-medium text-gray-900 hover:text-[#6366f1] transition-colors cursor-pointer">{provider.name}</span>
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">{provider.type?.toUpperCase() || "SHUTTLE"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">{provider.distance} miles</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-sm text-[#6366f1]">${provider.pricePerDay.toFixed(2)}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/airport/${airport.code.toLowerCase()}/${provider.slug}`}
                            className="text-sm font-medium text-[#6366f1] hover:text-[#5558e0] transition-colors"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (shown only on mobile) */}
              <div className="md:hidden space-y-3">
                {sortedProviders.map((provider, idx) => (
                  <Link
                    key={provider.id}
                    href={`/airport/${airport.code.toLowerCase()}/${provider.slug}`}
                    className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base truncate">
                          {provider.name}
                        </h3>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-xl font-bold text-[#6366f1]">
                          ${provider.pricePerDay.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">/day</div>
                      </div>
                    </div>
                    
                    {/* Card Details */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs font-medium text-gray-600 border-gray-200">
                          {provider.type?.toUpperCase() || "SHUTTLE"}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {provider.distance} mi
                        </span>
                      </div>
                      <span className="text-[#6366f1] font-medium">
                        View →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600 text-lg mb-2">No parking providers available</p>
              <p className="text-gray-500 text-sm">Check back later for parking options at this airport</p>
            </div>
          )}
        </div>
      </section>

    </>
  );
}
