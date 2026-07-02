import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Blog from "@/models/Blog";
import { getCurrentAdmin } from "@/lib/auth";
import { blogSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getAllBlogs, getBlogBySlug } from "@/lib/blogs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    // 1. Fetch individual blog by slug if requested
    if (slug) {
      const blog = await getBlogBySlug(slug);
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
    }

    // 2. Fetch admin query vs public combined list
    const admin = await getCurrentAdmin();
    const showAll = searchParams.get("all") === "true";

    let blogs: any[] = [];
    if (admin && showAll) {
      await connectToDatabase();
      blogs = await Blog.find({}).sort({ publishedAt: -1, createdAt: -1 });
    } else {
      blogs = await getAllBlogs();
    }

    // 3. Apply category filter on the fetched results
    const category = searchParams.get("category");
    if (category) {
      const catLower = category.toLowerCase();
      blogs = blogs.filter(b => b.category?.toLowerCase() === catLower);
    }

    // 4. Apply search filter on the fetched results
    const q = searchParams.get("q");
    if (q) {
      const queryLower = q.toLowerCase().trim();
      blogs = blogs.filter(
        b =>
          b.title?.toLowerCase().includes(queryLower) ||
          b.description?.toLowerCase().includes(queryLower) ||
          b.tags?.some((t: string) => t.toLowerCase().includes(queryLower))
      );
    }

    // 5. Pagination
    const total = blogs.length;
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    
    if (pageParam || limitParam) {
      const page = parseInt(pageParam || "1", 10);
      const limit = parseInt(limitParam || "12", 10);
      const startIndex = (page - 1) * limit;
      const paginatedBlogs = blogs.slice(startIndex, startIndex + limit);
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        success: true,
        message: "Blogs retrieved successfully",
        data: {
          blogs: paginatedBlogs,
          total,
          pages: totalPages,
          page,
          limit,
        },
      });
    }

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
