// Migration: add review/social-proof fields to parking_providers
// Run: npx tsx scripts/migrate-add-review-fields.ts

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local first (git-ignored, contains real secrets)
const root = process.cwd();
config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") });

import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("TURSO_DATABASE_URL not found. Check .env.local exists with Turso credentials.");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function migrate() {
  const migrations = [
    "ALTER TABLE parking_providers ADD COLUMN review_summary TEXT",
    "ALTER TABLE parking_providers ADD COLUMN been_here_count INTEGER DEFAULT 0",
    "ALTER TABLE parking_providers ADD COLUMN shuttle_recc_percentage REAL DEFAULT 0",
    "ALTER TABLE parking_providers ADD COLUMN free_cancel_available INTEGER DEFAULT 0",
    "ALTER TABLE parking_providers ADD COLUMN review_ai_summary TEXT",
    "ALTER TABLE parking_providers ADD COLUMN additional_fees TEXT",
  ];

  for (const sql of migrations) {
    try {
      await client.execute(sql);
      console.log("OK:", sql.substring(0, 60));
    } catch (e: any) {
      if (e.message?.includes("duplicate column")) {
        console.log("SKIP (exists):", sql.substring(0, 60));
      } else {
        console.error("ERR:", e.message);
      }
    }
  }
  console.log("Migration complete.");
}

migrate();
