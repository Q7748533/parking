"use server";

import { turso } from "@/lib/db";

export type Airport = {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  created_at: string;
  updated_at: string;
};

export type ParkingProvider = {
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
};

export type AirportWithParking = Airport & {
  parkingProviders: ParkingProvider[];
  totalParkingCount: number;
};

// Shared helper: map a parking provider row to a typed object
function rowToProvider(row: Record<string, unknown>): ParkingProvider {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    airportId: String(row.airport_id),
    type: String(row.type),
    pricePerDay: Number(row.price_per_day),
    distance: String(row.distance),
    features: String(row.features),
    affiliateUrl: String(row.affiliate_url),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function rowToAirport(row: Record<string, unknown>): Airport {
  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    city: String(row.city),
    state: String(row.state),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

/**
 * Batch-fetch parking providers for multiple airport IDs in a single query.
 * Groups results by airport_id and limits to `perAirport` providers each.
 */
async function batchGetParkingProviders(
  airportIds: string[],
  perAirport: number = 5
): Promise<Map<string, ParkingProvider[]>> {
  const grouped = new Map<string, ParkingProvider[]>();
  if (airportIds.length === 0) return grouped;

  // Build parameterized IN clause
  const placeholders = airportIds.map(() => "?").join(", ");
  const result = await turso.execute({
    sql: `SELECT * FROM parking_providers
          WHERE airport_id IN (${placeholders})
          ORDER BY airport_id, price_per_day ASC`,
    args: airportIds,
  });

  for (const row of result.rows) {
    const provider = rowToProvider(row);
    const list = grouped.get(provider.airportId);
    if (!list) {
      grouped.set(provider.airportId, [provider]);
    } else if (list.length < perAirport) {
      list.push(provider);
    }
  }

  return grouped;
}

export async function searchAirports(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ success: boolean; data?: AirportWithParking[]; error?: string }> {
  try {
    const searchTerm = `%${query}%`;
    const offset = (page - 1) * pageSize;

    const result = await turso.execute({
      sql: `SELECT DISTINCT a.* FROM airports a
            LEFT JOIN parking_providers p ON a.id = p.airport_id
            WHERE a.code LIKE ?
            OR a.name LIKE ?
            OR a.city LIKE ?
            OR a.state LIKE ?
            OR p.name LIKE ?
            ORDER BY a.code ASC
            LIMIT ? OFFSET ?`,
      args: [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, pageSize, offset],
    });

    const airportIds = result.rows.map((r) => String(r.id));

    // Single batch query instead of N+1
    const parkingByAirport = await batchGetParkingProviders(airportIds);

    const airports: AirportWithParking[] = result.rows.map((row) => {
      const airport = rowToAirport(row);
      return {
        ...airport,
        parkingProviders: parkingByAirport.get(airport.id) || [],
      };
    });

    return { success: true, data: airports };
  } catch (error) {
    console.error("Failed to search airports:", error);
    return { success: false, error: "Failed to search airports" };
  }
}

export async function getAirportsWithParking(): Promise<{ success: boolean; data?: AirportWithParking[]; error?: string }> {
  try {
    const airportsResult = await turso.execute(
      "SELECT * FROM airports ORDER BY code ASC LIMIT 10"
    );

    const airports: Airport[] = airportsResult.rows.map(rowToAirport);
    const airportIds = airports.map((a) => a.id);

    // Fetch real total parking counts per airport
    const countsMap = new Map<string, number>();
    if (airportIds.length > 0) {
      const countPlaceholders = airportIds.map(() => "?").join(", ");
      const countsResult = await turso.execute({
        sql: `SELECT airport_id, COUNT(*) as cnt FROM parking_providers
              WHERE airport_id IN (${countPlaceholders}) GROUP BY airport_id`,
        args: airportIds,
      });
      for (const row of countsResult.rows) {
        countsMap.set(String(row.airport_id), Number(row.cnt));
      }
    }

    // Batch fetch providers — show up to 10 per airport
    const parkingByAirport = await batchGetParkingProviders(airportIds, 10);

    const airportsWithParking: AirportWithParking[] = airports.map((airport) => ({
      ...airport,
      parkingProviders: parkingByAirport.get(airport.id) || [],
      totalParkingCount: countsMap.get(airport.id) || 0,
    }));

    return { success: true, data: airportsWithParking };
  } catch (error) {
    console.error("Failed to get airports with parking:", error);
    return { success: false, error: "Failed to get airports with parking" };
  }
}

export async function getPopularAirports() {
  try {
    const result = await turso.execute(
      "SELECT * FROM airports ORDER BY created_at DESC LIMIT 5"
    );

    const airports = result.rows.map(rowToAirport);
    return { success: true, data: airports };
  } catch (error) {
    console.error("Failed to get popular airports:", error);
    return { success: false, error: "Failed to get popular airports" };
  }
}
