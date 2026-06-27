import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";
import BrandSetting from "@/models/BrandSetting";
import { compileEmailHtml, extractTemplateVariables } from "@/lib/emails/renderer";
import { z } from "zod";

const templateCreateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.string().default("General"),
  subject: z.string().min(1, "Subject is required"),
  jsonLayout: z.any().default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-zero-assertions, @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }

    const templates = await EmailTemplate.find(filter).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, data: templates });
  } catch (err: any) {
    console.error("GET Templates error:", err);
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
    const result = templateCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check slug collision
    const existing = await EmailTemplate.findOne({ slug: result.data.slug.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A template with this slug already exists" },
        { status: 400 }
      );
    }

    // Load active brand config for compiler
    const brand = (await BrandSetting.findOne({})) || {
      brandName: "My Brand",
      primaryColor: "#4f46e5",
      secondaryColor: "#475569",
      accentColor: "#2563eb",
      copyright: "All rights reserved.",
      address: "",
    };

    // Auto extract variables
    const variables = extractTemplateVariables(result.data.jsonLayout, result.data.subject);

    // Auto compile HTML content from JSON blocks
    const html = compileEmailHtml(result.data.jsonLayout, brand, null, {
      subject: result.data.subject,
      name: result.data.name,
    });

    const template = await EmailTemplate.create({
      ...result.data,
      slug: result.data.slug.toLowerCase(),
      html,
      variables,
      version: 1,
      createdBy: admin._id,
      updatedBy: admin._id,
    });

    return NextResponse.json(
      { success: true, message: "Template created successfully", data: template },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST Templates error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
