import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables");
  process.exit(1);
}

const turso = createClient({ url, authToken });

async function checkDatabase() {
  try {
    console.log("=== Checking Parking Providers Data ===\n");

    // Get all parking providers
    const result = await turso.execute({
      sql: `SELECT id, name, slug, description, custom_message, parking_access, features, shuttle_description, cancellation_policy FROM parking_providers`,
      args: [],
    });

    console.log(`Found ${result.rows.length} parking providers\n`);

    for (const row of result.rows) {
      console.log("--- Provider ---");
      console.log(`ID: ${row.id}`);
      console.log(`Name: ${row.name}`);
      console.log(`Slug: ${row.slug}`);
      console.log(`Description: ${row.description ? (String(row.description).substring(0, 100) + "...") : "NULL"}`);
      console.log(`CustomMessage: ${row.custom_message ? (String(row.custom_message).substring(0, 100) + "...") : "NULL"}`);
      console.log(`ParkingAccess: ${row.parking_access ? (String(row.parking_access).substring(0, 100) + "...") : "NULL"}`);
      console.log(`Features: ${row.features ? (String(row.features).substring(0, 100) + "...") : "NULL"}`);
      console.log(`ShuttleDescription: ${row.shuttle_description ? (String(row.shuttle_description).substring(0, 100) + "...") : "NULL"}`);
      console.log(`CancellationPolicy: ${row.cancellation_policy ? (String(row.cancellation_policy).substring(0, 100) + "...") : "NULL"}`);
      console.log("");
    }

    console.log("=== Check Complete ===");
  } catch (error) {
    console.error("Database check failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

checkDatabase();
