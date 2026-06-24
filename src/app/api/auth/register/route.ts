import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    await connectToDatabase();

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Bootstrap check: first user gets ADMIN role
    const totalUsers = await User.countDocuments({});
    const role = totalUsers === 0 ? "ADMIN" : "USER";

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: "ACTIVE",
    });

    return NextResponse.json({
      success: true,
      message: `Account created successfully as ${role}!`,
      data: {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (err: any) {
    console.error("Register API error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
