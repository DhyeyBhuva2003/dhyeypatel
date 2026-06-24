import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { getCurrentAdmin } from "@/lib/auth";
import { serviceSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// GET individual service by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const service = await Service.findById(id);

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
  } catch (err: any) {
    console.error("GET Service by ID error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT update service by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // 3. Duplicate Slug Check (excluding current service)
    await connectToDatabase();
    const existing = await Service.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A service with this title/slug already exists" },
        { status: 400 }
      );
    }

    // 4. Update Database
    const service = await Service.findByIdAndUpdate(
      id,
      { ...serviceData, slug },
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    revalidatePath("/services");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (err: any) {
    console.error("PUT Service error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE service by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authenticate Admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Delete from Database
    await connectToDatabase();
    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    revalidatePath("/services");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
      data: {},
    });
  } catch (err: any) {
    console.error("DELETE Service error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
