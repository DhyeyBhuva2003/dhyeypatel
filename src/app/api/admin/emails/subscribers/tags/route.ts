import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Tag from "@/models/Tag";
import { z } from "zod";

const tagCreateSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const tags = await Tag.find({}).sort({ name: 1 });

    return NextResponse.json({ success: true, data: tags });
  } catch (err: any) {
    console.error("GET Tags error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = tagCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Tag.findOne({ slug: result.data.slug.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A tag with this slug already exists" },
        { status: 400 }
      );
    }

    const tag = await Tag.create({
      ...result.data,
      slug: result.data.slug.toLowerCase(),
    });

    return NextResponse.json({ success: true, message: "Tag created successfully", data: tag }, { status: 201 });
  } catch (err: any) {
    console.error("POST Tag error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
