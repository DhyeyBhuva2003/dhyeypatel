import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 for security reasons to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "If the email is registered in our system, you will receive a reset link shortly.",
      });
    }

    // Slice of current password hash to invalidate token on change
    const pwdHashSlice = user.password ? user.password.substring(user.password.length - 10) : "";

    // Generate secure recovery token (JWT expiring in 1 hour)
    const token = await signToken(
      {
        email: user.email,
        purpose: "password-reset",
        pwdHash: pwdHashSlice,
      },
      60 * 60 // 1 hour in seconds
    );

    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;

    // Log recovery URL in server console (for sandbox/dev verification)
    console.log("==========================================");
    console.log(`PASSWORD RESET REQUESTED FOR: ${email}`);
    console.log(`RECOVERY LINK: ${resetUrl}`);
    console.log("==========================================");

    return NextResponse.json({
      success: true,
      message: "Password reset link generated and logged. In production, an email is dispatched.",
    });
  } catch (err: any) {
    console.error("Forgot password API error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
