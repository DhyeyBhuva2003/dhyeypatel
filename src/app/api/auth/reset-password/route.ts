import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // 1. Verify token
    const decoded = await verifyToken(token);
    if (!decoded || decoded.purpose !== "password-reset") {
      return NextResponse.json(
        { success: false, message: "Invalid or expired recovery token." },
        { status: 400 }
      );
    }

    const email = decoded.email;

    // 2. Fetch User and update password
    await connectToDatabase();
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    // 3. Verify single-use validation (hash slice check)
    const currentHashSlice = user.password ? user.password.substring(user.password.length - 10) : "";
    if (decoded.pwdHash !== currentHashSlice) {
      return NextResponse.json(
        { success: false, message: "This recovery link has already been used or is invalid." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully!",
    });
  } catch (err: any) {
    console.error("Reset password API error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
