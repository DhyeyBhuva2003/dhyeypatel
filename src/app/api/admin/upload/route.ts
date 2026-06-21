import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { uploadImageBuffer } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

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

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "portfolio";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // 3. Validate File Type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Allowed file formats: jpg, jpeg, png, webp",
        },
        { status: 400 }
      );
    }

    // 4. Validate File Size (Maximum 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          message: "File size exceeds the maximum limit of 5MB",
        },
        { status: 400 }
      );
    }

    // 5. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Stream Upload to Cloudinary
    const result = await uploadImageBuffer(buffer, folder);

    return NextResponse.json({
      success: true,
      message: "Media uploaded successfully",
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (err: any) {
    console.error("Multipart file upload API error:", err);
    return NextResponse.json(
      { success: false, message: "Upload failed: " + err.message },
      { status: 500 }
    );
  }
}
