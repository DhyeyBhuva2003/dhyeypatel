import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { getCurrentAdmin } from "@/lib/auth";
import { serviceSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const service = await Service.findOne({ slug });
      if (!service) {
        return NextResponse.json(
          { success: false, message: "Service not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Service retrieved successfully",
        data: service,
      });
    }

    const services = await Service.find({}).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: "Services retrieved successfully",
      data: services,
    });
  } catch (err: any) {
    console.error("GET Services error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    // 2. Validate Input
    const validationResult = serviceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: validationResult.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const serviceData = validationResult.data;
    const slug = slugify(serviceData.title);

    // 3. Duplicate Slug Check
    await connectToDatabase();
    const existing = await Service.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A service with this title/slug already exists" },
        { status: 400 }
      );
    }

    // 4. Save to Database
    const service = await Service.create({
      ...serviceData,
      slug,
    });

    revalidatePath("/services");
    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully",
        data: service,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST Service error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
