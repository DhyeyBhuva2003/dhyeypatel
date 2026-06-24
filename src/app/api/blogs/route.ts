import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Blog from "@/models/Blog";
import { getCurrentAdmin } from "@/lib/auth";
import { blogSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Check if client is admin to show unpublished blogs
    const admin = await getCurrentAdmin();
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    const query = (admin && showAll) ? {} : { published: true };
    const blogs = await Blog.find(query).sort({ publishedAt: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: "Blogs retrieved successfully",
      data: blogs,
    });
  } catch (err: any) {
    console.error("GET Blogs error:", err);
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

    // 3. Duplicate Slug Check
    await connectToDatabase();
    const existing = await Blog.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A blog post with this title/slug already exists" },
        { status: 400 }
      );
    }

    // 4. Save to Database
    const blog = await Blog.create({
      ...blogData,
      slug,
      publishedAt: blogData.published ? new Date() : undefined,
    });

    revalidatePath("/blog");
    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        message: "Blog post created successfully",
        data: blog,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST Blog error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
