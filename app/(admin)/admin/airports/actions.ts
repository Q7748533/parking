"use server";

import { revalidatePath } from "next/cache";
import { turso } from "@/lib/db";
import {
  validateAirportCode,
  validateAirportName,
  validateCity,
  validateUSState,
  combineValidations,
} from "@/lib/validate";

export type AirportFormData = {
  code: string;
  name: string;
  city: string;
  state: string;
};

export type Airport = {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  created_at: string;
  updated_at: string;
};

// Convert Turso row to plain object
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

export async function getAirports(page: number = 1, pageSize: number = 50) {
  try {
    const offset = (page - 1) * pageSize;

    const [dataResult, countResult] = await Promise.all([
      turso.execute({
        sql: "SELECT * FROM airports ORDER BY created_at DESC LIMIT ? OFFSET ?",
        args: [pageSize, offset],
      }),
      turso.execute("SELECT COUNT(*) as total FROM airports"),
    ]);

    const airports = dataResult.rows.map(rowToAirport);
    const total = Number(countResult.rows[0]?.total ?? 0);

    return { success: true, data: airports, total, page, pageSize };
  } catch (error) {
    console.error("Failed to fetch airports:", error);
    return { success: false, error: "Failed to fetch airports" };
  }
}

export async function createAirport(data: AirportFormData) {
  try {
    // Server-side validation
    const validation = combineValidations(
      validateAirportCode(data.code),
      validateAirportName(data.name),
      validateCity(data.city),
      validateUSState(data.state),
    );
    if (!validation.valid) {
      return { success: false, error: validation.errors[0].message };
    }

    const id = crypto.randomUUID();
    await turso.execute({
      sql: "INSERT INTO airports (id, code, name, city, state) VALUES (?, ?, ?, ?, ?)",
      args: [id, data.code.trim().toUpperCase(), data.name.trim(), data.city.trim(), data.state.trim().toUpperCase()],
    });
    revalidatePath("/(admin)/admin/airports");
    return { success: true, data: { id } };
  } catch (error) {
    console.error("Failed to create airport:", error);
    return { success: false, error: "Failed to create airport" };
  }
}

export async function updateAirport(id: string, data: AirportFormData) {
  try {
    // Server-side validation
    const validation = combineValidations(
      validateAirportCode(data.code),
      validateAirportName(data.name),
      validateCity(data.city),
      validateUSState(data.state),
    );
    if (!validation.valid) {
      return { success: false, error: validation.errors[0].message };
    }

    await turso.execute({
      sql: "UPDATE airports SET code = ?, name = ?, city = ?, state = ? WHERE id = ?",
      args: [data.code.trim().toUpperCase(), data.name.trim(), data.city.trim(), data.state.trim().toUpperCase(), id],
    });
    revalidatePath("/(admin)/admin/airports");
    return { success: true, data: { id } };
  } catch (error) {
    console.error("Failed to update airport:", error);
    return { success: false, error: "Failed to update airport" };
  }
}

export async function deleteAirport(id: string) {
  try {
    // Delete associated parking providers first (cascade)
    await turso.execute({
      sql: "DELETE FROM parking_providers WHERE airport_id = ?",
      args: [id],
    });
    await turso.execute({
      sql: "DELETE FROM airports WHERE id = ?",
      args: [id],
    });
    revalidatePath("/(admin)/admin/airports");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete airport:", error);
    return { success: false, error: "Failed to delete airport" };
  }
}
