import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import connectToDatabase from "./db";
import User from "@/models/User";

/**
 * Retrieve the current logged-in admin user in Server Components, Server Actions, or Route Handlers.
 * Awaits cookies asynchronously in line with Next.js 16 guidelines.
 */
export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return null;

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") return null;

    await connectToDatabase();
    const admin = await User.findById(decoded.id).select("-password").lean();
    return admin;
  } catch (err) {
    console.error("Error retrieving admin details:", err);
    return null;
  }
}
