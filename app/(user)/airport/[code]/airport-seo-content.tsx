interface AirportSeoContentProps {
  airportCode: string;
  airportName: string;
  city: string;
  state: string;
  providerCount: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  closestDistance: string;
  shuttleCount: number;
  coveredCount: number;
  freeCancelCount: number;
  avgRating: number;
  twentyFourSevenCount: number;
  types: string[];
}

export function AirportSeoContent({
  airportCode,
  airportName,
  city,
  state,
  providerCount,
  minPrice,
  maxPrice,
  avgPrice,
  closestDistance,
  shuttleCount,
  coveredCount,
  freeCancelCount,
  avgRating,
  types,
}: AirportSeoContentProps) {
  const uniqueTypes = [...new Set(types.map((t) => t.trim()).filter(Boolean))];
  const hasShuttle = shuttleCount > 0;
  const hasCovered = coveredCount > 0;
  const priceRange = minPrice === maxPrice
    ? `$${minPrice.toFixed(2)}/day`
    : `$${minPrice.toFixed(2)} – $${maxPrice.toFixed(2)}/day`;

  return (
    <section className="bg-white border-b border-gray-100 py-6" aria-labelledby="airport-seo-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Full-width intro */}
        <article className="mb-5">
          <h2 className="sr-only" id="airport-seo-heading">About {airportName} Parking</h2>
          <p className="text-sm text-gray-700 leading-relaxed max-w-4xl">
            {airportName} ({airportCode}) offers {providerCount} parking
            {providerCount === 1 ? " option" : " options"} in {city}, {state}.{" "}
            Prices range from {priceRange}
            {providerCount > 0 ? ` (average $${avgPrice.toFixed(2)}/day). ` : ". "}
            {minPrice < 20 && "Off-airport lots offer significant savings — often 40–60% cheaper than on-airport. "}
            {hasShuttle && "Free shuttle service is available. "}
            {hasCovered && "Covered parking protects your vehicle from weather. "}
            Compare options below by price, distance, and amenities.
          </p>
          {uniqueTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {uniqueTypes.map((t) => (
                <span key={t} className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Quick stats bar */}
        {providerCount > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-base">💰</span>
              <span className="font-semibold text-gray-900">${avgPrice.toFixed(2)}</span>
              <span className="text-gray-400">avg/day</span>
            </span>
            <span className="text-gray-200 hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-base">🏷️</span>
              <span className="font-semibold text-gray-900">${minPrice.toFixed(2)}</span>
              <span className="text-gray-400">cheapest</span>
            </span>
            {closestDistance && (
              <>
                <span className="text-gray-200 hidden sm:inline">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-base">📍</span>
                  <span className="font-semibold text-gray-900">{closestDistance}</span>
                  <span className="text-gray-400">closest</span>
                </span>
              </>
            )}
            {shuttleCount > 0 && (
              <>
                <span className="text-gray-200 hidden sm:inline">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-base">🚌</span>
                  <span className="font-semibold text-gray-900">{shuttleCount}/{providerCount}</span>
                  <span className="text-gray-400">shuttle</span>
                </span>
              </>
            )}
            {avgRating > 0 && (
              <>
                <span className="text-gray-200 hidden sm:inline">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-base">⭐</span>
                  <span className="font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
                  <span className="text-gray-400">rating</span>
                </span>
              </>
            )}
            {freeCancelCount > 0 && (
              <>
                <span className="text-gray-200 hidden sm:inline">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-base">✅</span>
                  <span className="font-semibold text-gray-900">{freeCancelCount}/{providerCount}</span>
                  <span className="text-gray-400">free cancel</span>
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
