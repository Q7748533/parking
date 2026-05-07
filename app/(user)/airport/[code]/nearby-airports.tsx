import Link from "next/link";
import { turso } from "@/lib/db";

interface NearbyAirportsProps {
  airportCode: string;
  airportState: string;
  airportName: string;
}

async function getNearbyAirports(state: string, excludeCode: string) {
  try {
    const result = await turso.execute({
      sql: `SELECT code, name, city FROM airports
            WHERE UPPER(state) = UPPER(?) AND UPPER(code) != UPPER(?)
            ORDER BY code ASC LIMIT 4`,
      args: [state, excludeCode],
    });
    return result.rows.map((row) => ({
      code: String(row.code),
      name: String(row.name),
      city: String(row.city),
    }));
  } catch {
    return [];
  }
}

export async function NearbyAirports({ airportCode, airportState, airportName }: NearbyAirportsProps) {
  const nearby = await getNearbyAirports(airportState, airportCode);
  if (nearby.length === 0) return null;

  return (
    <section className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          More Airport Parking in {airportState}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {nearby.map((a) => (
            <Link
              key={a.code}
              href={`/airport/${a.code.toLowerCase()}`}
              className="bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">
                {a.code} — {a.name}
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">{a.city}</span>
            </Link>
          ))}
          <Link
            href="/airports"
            className="bg-[#6366f1]/5 rounded-lg px-4 py-3 hover:bg-[#6366f1]/10 transition-colors flex items-center"
          >
            <span className="text-sm font-medium text-[#6366f1]">
              All {airportState} airports →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
