import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "USER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
});

// GET: Fetch users with search, role filter, status filter, and pagination
export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    await connectToDatabase();

    // Build Mongoose filter object
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role !== "ALL") {
      filter.role = role;
    }

    if (status !== "ALL") {
      filter.status = status;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: total,
          limit,
        },
      },
    });
  } catch (err: any) {
    console.error("GET users API error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Admin creates a new user
export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role, status } = validation.data;
    const lowerEmail = email.toLowerCase().trim();

    await connectToDatabase();

    // Check if email is already taken
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email: lowerEmail,
      password: hashedPassword,
      role,
      status,
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
        },
      },
    });
  } catch (err: any) {
    console.error("POST create user API error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
