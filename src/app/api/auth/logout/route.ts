import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the admin token cookie (async cookies API in Next.js 16)
    cookieStore.set("admin_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Immediately expires the cookie
    });

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
      data: {},
    });
  } catch (err: any) {
    console.error("Logout API error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
