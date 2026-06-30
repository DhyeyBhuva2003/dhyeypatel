import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    // 1. Authenticate Admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, currentPassword, newPassword, profileImage } = body;

    // Validate base inputs
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email fields are required" },
        { status: 400 }
      );
    }

    // 2. Fetch User from Database (including hidden password hash)
    await connectToDatabase();
    const dbUser = await User.findById(admin._id).select("+password");

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 3. Password Verification & Hashing
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          {
            success: false,
            message: "Current password is required to save a new password",
          },
          { status: 400 }
        );
      }

      const match = await bcrypt.compare(currentPassword, dbUser.password);
      if (!match) {
        return NextResponse.json(
          { success: false, message: "The current password you entered is incorrect" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      // Hash and update password
      dbUser.password = await bcrypt.hash(newPassword, 12);
    }

    // 4. Update Profile Details
    const normalizedEmail = email.toLowerCase().trim();
    if (dbUser.email !== normalizedEmail) {
      const emailExists = await User.findOne({ email: normalizedEmail });
      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Email is already registered by another user" },
          { status: 400 }
        );
      }
    }

    dbUser.name = name;
    dbUser.email = normalizedEmail;
    if (profileImage !== undefined) {
      dbUser.profileImage = profileImage;
    }
    await dbUser.save();

    return NextResponse.json({
      success: true,
      message: "Settings profile updated successfully",
      data: {
        user: {
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
        },
      },
    });
  } catch (err: any) {
    console.error("PUT Admin Settings API error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
