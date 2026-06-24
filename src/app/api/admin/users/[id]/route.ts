import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "USER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
});

// PUT: Update a specific user's details
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role, status } = validation.data;
    const lowerEmail = email.toLowerCase().trim();

    await connectToDatabase();

    // Find the user to update
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Verify email uniqueness if email changed
    if (userToUpdate.email !== lowerEmail) {
      const emailExists = await User.findOne({ email: lowerEmail });
      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Email is already registered by another user" },
          { status: 400 }
        );
      }
    }

    // Prevent administrators from changing their own role or status to ensure lockouts don't happen
    if (admin._id.toString() === id) {
      if (role !== "ADMIN") {
        return NextResponse.json(
          { success: false, message: "You cannot revoke your own admin privileges" },
          { status: 400 }
        );
      }
      if (status !== "ACTIVE") {
        return NextResponse.json(
          { success: false, message: "You cannot set your own account to inactive or pending" },
          { status: 400 }
        );
      }
    }

    // Apply updates
    userToUpdate.name = name;
    userToUpdate.email = lowerEmail;
    userToUpdate.role = role;
    userToUpdate.status = status;

    if (password) {
      userToUpdate.password = await bcrypt.hash(password, 12);
    }

    await userToUpdate.save();

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: {
        user: {
          id: userToUpdate._id.toString(),
          name: userToUpdate.name,
          email: userToUpdate.email,
          role: userToUpdate.role,
          status: userToUpdate.status,
        },
      },
    });
  } catch (err: any) {
    console.error("PUT update user API error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete a specific user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Self-deletion check: Prevent admin from deleting themselves
    if (admin._id.toString() === id) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own administrative account" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE user API error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
