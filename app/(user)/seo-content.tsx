interface TopAirport {
  code: string;
  name: string;
  city: string;
  state: string;
}

interface SeoContentProps {
  topAirports?: TopAirport[];
  totalAirports?: number;
}

export function SeoContent({ topAirports = [], totalAirports = 0 }: SeoContentProps) {
  const airportCount = totalAirports > 0 ? `${totalAirports}+` : "500+";
  const airportNames = topAirports.length > 0
    ? topAirports.map((a) => `${a.name} (${a.code})`).join(", ")
    : "JFK, LAX, Chicago ORD, Miami MIA";

  return (
    <section className="bg-white border-t border-gray-200 py-12" aria-labelledby="seo-heading">
      <h2 id="seo-heading" className="sr-only">Airport Parking Guide</h2>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <article>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Why Book Airport Parking in Advance
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Booking airport parking in advance saves time and money. Our platform compares
              hundreds of options across {airportCount} airports
              to find the best deals. Avoid last-minute stress and secure your spot at{" "}
              {airportNames}, and nationwide.
            </p>
          </article>
          <article>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              How to Find Cheap Airport Parking
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Use our comparison tool to search by airport code, name, or city. Filter by price,
              distance, shuttle service, and security features. We partner with trusted parking
              providers to offer exclusive deals — save up to 60% versus drive-up rates.
            </p>
          </article>
          <article>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Airport Parking Options Explained
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Choose from on-airport, off-airport, covered, valet, and shuttle parking. On-site
              parking offers convenience steps from the terminal. Off-airport lots provide
              significant savings with free 24/7 shuttle service. Compare all options to find
              the right balance of price, distance, and amenities for your trip.
            </p>
          </article>
          <article>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top Airports We Cover
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We offer parking at all major US airports including {airportNames}. Find affordable
              airport parking reservations with instant confirmation and free cancellation on most
              bookings.
            </p>
            {topAirports.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {topAirports.map((a) => (
                  <a
                    key={a.code}
                    href={`/airport/${a.code.toLowerCase()}`}
                    className="text-xs font-medium text-[#6366f1] hover:text-[#5558e0] bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full transition-colors"
                    aria-label={`Parking at ${a.name}`}
                  >
                    {a.code}
                  </a>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
