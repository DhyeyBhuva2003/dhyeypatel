import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import { getCurrentAdmin } from "@/lib/auth";
import { inquirySchema } from "@/lib/validation";

export async function GET() {
  try {
    // 1. Authenticate Admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Fetch Inquiries
    await connectToDatabase();
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: "Inquiries retrieved successfully",
      data: inquiries,
    });
  } catch (err: any) {
    console.error("GET Inquiries error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate Input
    const validationResult = inquirySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: validationResult.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const inquiryData = validationResult.data;

    // 2. Save to Database
    await connectToDatabase();
    const inquiry = await Inquiry.create(inquiryData);

    // Optional: Trigger SMTP notification in the background
    // (We will implement mailer helper in the lib folder in a later step)

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry submitted successfully",
        data: inquiry,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST Inquiry error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
