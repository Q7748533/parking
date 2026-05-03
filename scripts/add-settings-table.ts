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
  console.log("Creating site_settings table...");

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✓ site_settings table created");

  console.log("\nMigration complete!");
  process.exit(0);
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
