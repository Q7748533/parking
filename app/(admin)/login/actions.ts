"use server";

import { cookies } from "next/headers";

export async function login(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { success: false, error: "Admin password not configured. Set ADMIN_PASSWORD in environment variables." };
  }

  if (password !== adminPassword) {
    return { success: false, error: "Invalid password" };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true };
}
