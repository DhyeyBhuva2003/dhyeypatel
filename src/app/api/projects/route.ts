import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import { getCurrentAdmin } from "@/lib/auth";
import { projectSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await connectToDatabase();
    const projects = await Project.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({
      success: true,
      message: "Projects retrieved successfully",
      data: projects,
    });
  } catch (err: any) {
    console.error("GET Projects error:", err);
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
    const validationResult = projectSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: validationResult.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const projectData = validationResult.data;
    const slug = slugify(projectData.title);

    // 3. Duplicate Slug Check
    await connectToDatabase();
    const existing = await Project.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A project with this title/slug already exists" },
        { status: 400 }
      );
    }

    // 4. Save to Database
    const project = await Project.create({
      ...projectData,
      slug,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: project,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST Project error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
