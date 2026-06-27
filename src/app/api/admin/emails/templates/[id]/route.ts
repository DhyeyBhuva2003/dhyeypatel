import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";
import BrandSetting from "@/models/BrandSetting";
import { compileEmailHtml, extractTemplateVariables } from "@/lib/emails/renderer";
import { z } from "zod";

const templateUpdateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  category: z.string().default("General"),
  subject: z.string().min(1, "Subject is required"),
  jsonLayout: z.any().default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await connectToDatabase();
    const template = await EmailTemplate.findById(id);

    if (!template) {
      return NextResponse.json({ success: false, message: "Template not found" }, { status: 444 });
    }

    return NextResponse.json({ success: true, data: template });
  } catch (err: any) {
    console.error("GET Template by ID error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const result = templateUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const template = await EmailTemplate.findById(id);
    if (!template) {
      return NextResponse.json({ success: false, message: "Template not found" }, { status: 404 });
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

    // Check if json layout or subject actually changed to increment version
    const hasChanged =
      JSON.stringify(template.jsonLayout) !== JSON.stringify(result.data.jsonLayout) ||
      template.subject !== result.data.subject;

    const updatedVersion = hasChanged ? template.version + 1 : template.version;

    const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
      id,
      {
        ...result.data,
        html,
        variables,
        version: updatedVersion,
        updatedBy: admin._id,
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Template updated successfully",
      data: updatedTemplate,
    });
  } catch (err: any) {
    console.error("PUT Template error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await connectToDatabase();
    const template = await EmailTemplate.findByIdAndDelete(id);

    if (!template) {
      return NextResponse.json({ success: false, message: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Template deleted successfully" });
  } catch (err: any) {
    console.error("DELETE Template error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
