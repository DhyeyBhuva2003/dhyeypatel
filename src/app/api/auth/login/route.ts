import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Zod Validation
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: validationResult.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // 2. Database Lookup
    await connectToDatabase();
    const user = await User.findOne({ email }).select("+password");

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 3. Password Verification
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // 4. Token Generation (7 days duration)
    const token = await signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    }, 7 * 24 * 60 * 60);

    // 5. Set HttpOnly cookie (async cookies API in Next.js 16)
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return NextResponse.json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
