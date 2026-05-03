"use server";

import { revalidatePath } from "next/cache";
import { turso } from "@/lib/db";

export async function getSiteSetting(key: string): Promise<string | null> {
  try {
    const result = await turso.execute({
      sql: "SELECT value FROM site_settings WHERE key = ?",
      args: [key],
    });
    if (result.rows.length === 0) return null;
    return String(result.rows[0].value);
  } catch (error) {
    console.error("Failed to get site setting:", error);
    return null;
  }
}

export async function saveSiteSetting(key: string, value: string) {
  try {
    await turso.execute({
      sql: `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
      args: [key, value],
    });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to save site setting:", error);
    return { success: false, error: "保存失败" };
  }
}
