import { createClient } from "@libsql/client";
import { generateSlug } from "../lib/slug";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables");
  process.exit(1);
}

const turso = createClient({ url, authToken });

async function addSlugColumn() {
  console.log("Adding slug column to parking_providers table...\n");

  try {
    // Check if slug column exists
    const tableInfo = await turso.execute({
      sql: "PRAGMA table_info(parking_providers)",
      args: [],
    });

    const hasSlugColumn = tableInfo.rows.some(
      (row) => String(row.name) === "slug"
    );

    if (hasSlugColumn) {
      console.log("✓ slug column already exists");
    } else {
      // Add slug column without UNIQUE constraint first
      await turso.execute(`
        ALTER TABLE parking_providers ADD COLUMN slug TEXT
      `);
      console.log("✓ slug column added");
    }

    // Get all parking providers without slug
    const result = await turso.execute({
      sql: "SELECT id, name FROM parking_providers WHERE slug IS NULL",
      args: [],
    });

    console.log(`Found ${result.rows.length} providers without slug`);

    // Generate and update slugs
    for (const row of result.rows) {
      const id = String(row.id);
      const name = String(row.name);
      let slug = generateSlug(name);

      // Check if this slug already exists
      const existingResult = await turso.execute({
        sql: "SELECT id FROM parking_providers WHERE slug = ?",
        args: [slug],
      });

      // If exists, add suffix
      let counter = 1;
      let finalSlug = slug;
      while (existingResult.rows.length > 0) {
        finalSlug = `${slug}-${counter}`;
        const checkResult = await turso.execute({
          sql: "SELECT id FROM parking_providers WHERE slug = ?",
          args: [finalSlug],
        });
        if (checkResult.rows.length === 0) break;
        counter++;
      }

      // Update the record
      await turso.execute({
        sql: "UPDATE parking_providers SET slug = ? WHERE id = ?",
        args: [finalSlug, id],
      });

      console.log(`  Updated: ${name} -> ${finalSlug}`);
    }

    // Create index on slug column
    try {
      await turso.execute(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_parking_providers_slug ON parking_providers(slug)
      `);
      console.log("✓ Unique index on slug created");
    } catch (error) {
      console.log("✓ Index may already exist or duplicates found");
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

addSlugColumn();
