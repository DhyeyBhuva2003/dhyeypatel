import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import SubscriberGroup from "@/models/SubscriberGroup";
import { z } from "zod";

const groupCreateSchema = z.object({
  name: z.string().min(1, "Group name is required"),
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
    const groups = await SubscriberGroup.find({}).sort({ name: 1 });

    return NextResponse.json({ success: true, data: groups });
  } catch (err: any) {
    console.error("GET Groups error:", err);
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
    const result = groupCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await SubscriberGroup.findOne({ slug: result.data.slug.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A group with this slug already exists" },
        { status: 400 }
      );
    }

    const group = await SubscriberGroup.create({
      ...result.data,
      slug: result.data.slug.toLowerCase(),
    });

    return NextResponse.json(
      { success: true, message: "Group created successfully", data: group },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST Group error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
