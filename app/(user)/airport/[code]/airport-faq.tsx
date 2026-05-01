interface AirportFaqProps {
  airportCode: string;
  airportName: string;
  providerCount: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  shuttleCount: number;
  hasShuttle: boolean;
  hasCovered: boolean;
  uniqueTypes: string[];
}

export function AirportFaq({
  airportCode,
  airportName,
  providerCount,
  minPrice,
  maxPrice,
  avgPrice,
  shuttleCount,
  hasShuttle,
  hasCovered,
  uniqueTypes,
}: AirportFaqProps) {
  const priceRange = minPrice === maxPrice
    ? `$${minPrice.toFixed(2)}/day`
    : `$${minPrice.toFixed(2)} – $${maxPrice.toFixed(2)}/day`;

  return (
    <section className="bg-white border-t border-gray-200 py-8" aria-labelledby="airport-faq-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-5" id="airport-faq-heading">
          {airportCode} Parking FAQ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              How much is parking at {airportName}?
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              Parking at {airportName} ranges from {priceRange}, with an average of ${avgPrice.toFixed(2)}/day.
              {minPrice < 20
                ? " Off-airport lots offer the best value, often 40–60% cheaper than on-airport parking."
                : ""}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              What types of parking are available at {airportCode}?
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {uniqueTypes.length > 0
                ? `${airportCode} offers ${uniqueTypes.join(", ")} parking options. `
                : `Multiple parking types are available at ${airportCode}. `}
              {hasCovered ? "Covered parking is available for weather protection. " : ""}
              {hasShuttle ? "Shuttle parking includes free round-trip transportation to the terminal." : "Some locations offer self-park only — check individual listings."}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {hasShuttle
                ? `Does ${airportCode} parking include shuttle service?`
                : `How do I get from parking to ${airportCode} terminals?`}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {hasShuttle
                ? `${shuttleCount} of ${providerCount} parking options at ${airportCode} include free shuttle service to the terminal. Shuttles typically run every 10–20 minutes.`
                : `Parking options at ${airportCode} are self-park — you'll need to arrange your own transportation to the terminal, typically a short taxi or rideshare ride.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
