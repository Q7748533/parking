import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const turso = createClient({ url, authToken });

async function migrate() {
  console.log("Migrating parking_providers table...");

  // Add new columns for parking details
  const columns = [
    "description TEXT",
    "address_line1 TEXT",
    "city TEXT",
    "state_code TEXT",
    "zip_code TEXT",
    "latitude TEXT",
    "longitude TEXT",
    "shuttle_service BOOLEAN DEFAULT 0",
    "shuttle_frequency TEXT",
    "shuttle_description TEXT",
    "cancellation_policy TEXT",
    "parking_access TEXT",
    "custom_message TEXT",
    "rating REAL DEFAULT 0",
    "rating_count INTEGER DEFAULT 0",
    "recommendation_percentage INTEGER DEFAULT 0",
    "contact_phone TEXT",
    "location_type TEXT",
    "strike_off_price REAL",
    "discount_percentage REAL DEFAULT 0",
    "operating_hours TEXT",
    "amenities TEXT",
  ];

  for (const column of columns) {
    try {
      await turso.execute(`ALTER TABLE parking_providers ADD COLUMN ${column}`);
      console.log(`✓ Added column: ${column.split(" ")[0]}`);
    } catch (error: any) {
      if (error.message.includes("duplicate column")) {
        console.log(`⚠ Column ${column.split(" ")[0]} already exists`);
      } else {
        console.error(`✗ Failed to add column ${column.split(" ")[0]}:`, error.message);
      }
    }
  }

  console.log("\nMigration completed!");
  process.exit(0);
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
