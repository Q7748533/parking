"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { searchAirports, AirportWithParking } from "./(user)/search/actions";

interface SearchPageClientProps {
  airportsWithParking: AirportWithParking[];
  totalAirports?: number;
  totalProviders?: number;
  error?: string;
}

export function SearchPageClient({ airportsWithParking, totalAirports = 0, totalProviders = 0, error }: SearchPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AirportWithParking[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "distance">("price");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      clearTimeout(debounceRef.current);

      if (!value.trim()) {
        setHasSearched(false);
        setSearchResults([]);
        return;
      }

      debounceRef.current = setTimeout(() => {
        const q = value.toLowerCase();
        const filtered = airportsWithParking.filter(
          (a) =>
            a.code.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            a.city.toLowerCase().includes(q) ||
            a.state.toLowerCase().includes(q) ||
            a.parkingProviders.some((p) => p.name.toLowerCase().includes(q))
        );
        setSearchResults(filtered);
        setHasSearched(true);
      }, 200);
    },
    [airportsWithParking]
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    const result = await searchAirports(searchQuery);
    if (result.success && result.data) {
      setSearchResults(result.data);
    }

    setIsSearching(false);
  };

  const displayAirports = hasSearched ? searchResults : airportsWithParking;

  // Sort parking providers based on selected sort option
  const getSortedProviders = (providers: AirportWithParking["parkingProviders"]) => {
    const sorted = [...providers];
    if (sortBy === "price") {
      sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sortBy === "distance") {
      // Parse distance string to number for comparison
      sorted.sort((a, b) => {
        const distA = parseFloat(a.distance) || 0;
        const distB = parseFloat(b.distance) || 0;
        return distA - distB;
      });
    }
    return sorted;
  };

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

      {/* Search Section */}
      <section className="bg-white border-b border-gray-200 py-8" aria-label="Search airports">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
            Find & Book Airport Parking Deals — Price Comparison
          </h1>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3" role="search">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Los Angeles Int'l Airport (LAX)"
                value={searchQuery}
                onChange={handleInputChange}
                className="pl-10 py-3 h-11 bg-gray-50 border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus-visible:ring-[#6366f1] focus-visible:ring-1"
              />
            </div>
            <Button
              type="submit"
              disabled={isSearching}
              className="h-11 px-6 bg-[#6366f1] hover:bg-[#5558e0] text-white font-medium rounded-lg transition-colors"
            >
              {isSearching ? "Searching..." : hasSearched ? "Update Search" : "Search"}
            </Button>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="flex-1 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {hasSearched ? "Search Results" : "Popular Airports"}
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

          {/* Results List */}
          {hasSearched && searchResults.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 text-lg mb-2">No airports found</p>
              <p className="text-gray-500 text-sm">Try searching for LAX, JFK, or Chicago</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayAirports.map((airport) => (
                <div key={airport.id}>
                  {/* Airport Header */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 break-words">
                        {airport.name} ({airport.code})
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {airport.city}, {airport.state}
                      </p>
                    </div>
                    {airport.totalParkingCount > 0 && (
                      <a
                        href={`/airport/${airport.code.toLowerCase()}`}
                        className="text-sm font-medium text-[#6366f1] hover:text-[#5558e0] transition-colors flex-shrink-0"
                        aria-label={`View all ${airport.totalParkingCount} parking options at ${airport.name}`}
                      >
                        All {airport.totalParkingCount} Parking
                      </a>
                    )}
                  </div>

                  {/* Parking Table - Desktop */}
                  {airport.parkingProviders.length > 0 ? (
                    <>
                      {/* Desktop Table (hidden on mobile) */}
                      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full" aria-label={`Parking providers at ${airport.name}`}>
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
                            {getSortedProviders(airport.parkingProviders).slice(0, 5).map((provider) => (
                              <tr
                                key={provider.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-5 py-4">
                                  <span className="font-medium text-gray-900">{provider.name}</span>
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
                                  <a
                                    href={`/airport/${airport.code.toLowerCase()}/${provider.slug}`}
                                    className="text-sm font-medium text-[#6366f1] hover:text-[#5558e0] transition-colors"
                                    aria-label={`View details for ${provider.name} at ${airport.name}`}
                                  >
                                    View →
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards (shown only on mobile) */}
                      <div className="md:hidden space-y-3">
                        {getSortedProviders(airport.parkingProviders).slice(0, 5).map((provider, idx) => (
                          <a
                            key={provider.id}
                            href={`/airport/${airport.code.toLowerCase()}/${provider.slug}`}
                            className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            aria-label={`${provider.name} - $${provider.pricePerDay.toFixed(2)}/day at ${airport.name}`}
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
                          </a>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                      <p className="text-gray-500 text-sm">No parking providers available yet</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Stats Bar - E-E-A-T signals */}
      {(totalAirports > 0 || totalProviders > 0) && (
        <section className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
              <div>
                <dt className="text-xs sm:text-sm text-gray-600 mb-1">Airports Covered</dt>
                <dd className="text-xl sm:text-2xl font-bold text-[#6366f1]">{totalAirports}+</dd>
              </div>
              <div>
                <dt className="text-xs sm:text-sm text-gray-600 mb-1">Parking Providers</dt>
                <dd className="text-xl sm:text-2xl font-bold text-[#6366f1]">{totalProviders}+</dd>
              </div>
              <div>
                <dt className="text-xs sm:text-sm text-gray-600 mb-1">Savings vs Drive-Up</dt>
                <dd className="text-xl sm:text-2xl font-bold text-[#6366f1]">Up to 60%</dd>
              </div>
            </dl>
          </div>
        </section>
      )}

    </>
  );
}
