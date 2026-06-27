import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import BrandSetting from "@/models/BrandSetting";
import { z } from "zod";

const brandSettingsSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  logoUrl: z.string().optional(),
  lightLogoUrl: z.string().optional(),
  darkLogoUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid primary hex color"),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid secondary hex color"),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid accent hex color"),
  supportEmail: z.string().email("Invalid support email"),
  replyEmail: z.string().email("Invalid reply email"),
  website: z.string().url("Invalid website URL"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().optional(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }),
  footerText: z.string().optional(),
  copyright: z.string().min(1, "Copyright is required"),
});

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    let settings = await BrandSetting.findOne({});
    if (!settings) {
      // Return seeded default or fallback
      settings = await BrandSetting.create({
        brandName: "My Brand",
        supportEmail: "support@example.com",
        replyEmail: "reply@example.com",
        website: "https://example.com",
        address: "123 Main St, City, Country",
        copyright: "All rights reserved.",
        primaryColor: "#4f46e5",
        secondaryColor: "#475569",
        accentColor: "#2563eb",
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    console.error("GET BrandSettings error:", err);
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
    const result = brandSettingsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const settings = await BrandSetting.findOneAndUpdate({}, result.data, {
      new: true,
      upsert: true,
    });

    return NextResponse.json({
      success: true,
      message: "Brand configuration saved successfully",
      data: settings,
    });
  } catch (err: any) {
    console.error("POST BrandSettings error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
