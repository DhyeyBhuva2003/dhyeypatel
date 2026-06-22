import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Blog from "@/models/Blog";
import { getCurrentAdmin } from "@/lib/auth";
import { blogSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

// GET individual blog by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog post retrieved successfully",
      data: blog,
    });
  } catch (err: any) {
    console.error("GET Blog by ID error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT update blog by ID
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
    const validationResult = blogSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: validationResult.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const blogData = validationResult.data;
    const slug = slugify(blogData.title);

    // 3. Duplicate Slug Check (excluding current blog)
    await connectToDatabase();
    const existing = await Blog.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A blog post with this title/slug already exists" },
        { status: 400 }
      );
    }

    // 4. Retrieve old document to check publication status change
    const oldBlog = await Blog.findById(id);
    if (!oldBlog) {
      return NextResponse.json(
        { success: false, message: "Blog post not found" },
        { status: 404 }
      );
    }

    // Set publishedAt if transitioning to published
    let publishedAt = oldBlog.publishedAt;
    if (blogData.published && !oldBlog.published) {
      publishedAt = new Date();
    } else if (!blogData.published) {
      publishedAt = undefined;
    }

    // 5. Update Database
    const blog = await Blog.findByIdAndUpdate(
      id,
      { ...blogData, slug, publishedAt },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Blog post updated successfully",
      data: blog,
    });
  } catch (err: any) {
    console.error("PUT Blog error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE blog by ID
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
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog post deleted successfully",
      data: {},
    });
  } catch (err: any) {
    console.error("DELETE Blog error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
