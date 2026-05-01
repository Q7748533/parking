import { config } from "dotenv";
import { createClient } from "@libsql/client";

// Load environment variables from .env.local
config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  console.error("TURSO_DATABASE_URL:", url);
  console.error("TURSO_AUTH_TOKEN:", authToken ? "defined" : "undefined");
  process.exit(1);
}

const turso = createClient({ url, authToken });

async function initDb() {
  console.log("Creating tables...");

  // Create airports table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS airports (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✓ airports table created");

  // Create parking_providers table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS parking_providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      airport_id TEXT NOT NULL,
      type TEXT NOT NULL,
      price_per_day REAL NOT NULL,
      distance REAL NOT NULL,
      features TEXT,
      affiliate_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (airport_id) REFERENCES airports(id) ON DELETE CASCADE
    )
  `);
  console.log("✓ parking_providers table created");

  // Add slug column if not exists (for existing databases)
  try {
    await turso.execute(`
      ALTER TABLE parking_providers ADD COLUMN slug TEXT UNIQUE
    `);
    console.log("✓ slug column added to parking_providers");
  } catch (error) {
    // Column might already exist, ignore error
    console.log("✓ slug column already exists");
  }

  // Create indexes
  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_airports_code ON airports(code)
  `);
  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_parking_providers_airport_id ON parking_providers(airport_id)
  `);
  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_parking_providers_slug ON parking_providers(slug)
  `);
  console.log("✓ indexes created");

  console.log("\nDatabase initialized successfully!");
  process.exit(0);
}

initDb().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});
