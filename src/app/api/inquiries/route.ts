import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import { getCurrentAdmin } from "@/lib/auth";
import { inquirySchema } from "@/lib/validation";
import { uploadFileBuffer } from "@/lib/cloudinary";
import path from "path";

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
    const contentType = request.headers.get("content-type") || "";
    let inquiryData: any = {};
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      inquiryData.name = formData.get("name") as string;
      inquiryData.email = formData.get("email") as string;
      inquiryData.subject = (formData.get("subject") as string) || "";
      inquiryData.message = formData.get("message") as string;
      
      const fileField = formData.get("file");
      if (fileField instanceof File) {
        file = fileField;
      }
    } else {
      inquiryData = await request.json();
    }

    // 1. Validate Input (Zod Text Schema)
    const validationResult = inquirySchema.safeParse(inquiryData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: validationResult.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    let attachmentUrl = "";
    let attachmentName = "";
    let attachmentSize = 0;
    let attachmentPublicId = "";

    // 2. Validate & Upload Optional File
    if (file && file.size > 0) {
      // Size check (10MB)
      const maxSizeBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return NextResponse.json(
          { success: false, message: "File size exceeds the maximum limit of 10MB" },
          { status: 400 }
        );
      }

      // Extension Check
      const allowedExtensions = [
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "jpg", "jpeg", "png", "webp"
      ];
      const blockedExtensions = [
        "exe", "bat", "cmd", "js", "php", "sh", "msi", "dll", "vbs", "com", "scr"
      ];

      const originalName = file.name || "document.pdf";
      const baseName = path.basename(originalName);
      const ext = baseName.split(".").pop()?.toLowerCase() || "";

      if (!allowedExtensions.includes(ext) || blockedExtensions.includes(ext)) {
        return NextResponse.json(
          { success: false, message: "Unsafe or unsupported file extension." },
          { status: 400 }
        );
      }

      // MIME Type Check
      const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (!allowedMimeTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: "Unsupported file content type." },
          { status: 400 }
        );
      }

      // Read Magic Bytes for executable binary protection
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length >= 2) {
        const magic2 = buffer.toString("hex", 0, 2);
        if (magic2 === "4d5a") { // 'MZ' (PE windows executable)
          return NextResponse.json({ success: false, message: "Unsafe executable binary contents detected." }, { status: 400 });
        }
      }
      if (buffer.length >= 4) {
        const magic4 = buffer.toString("hex", 0, 4);
        if (magic4 === "7f454c46") { // 'ELF' (Linux binary)
          return NextResponse.json({ success: false, message: "Unsafe executable binary contents detected." }, { status: 400 });
        }
      }
      if (buffer.length >= 2) {
        const headerStr = buffer.toString("utf8", 0, 2);
        if (headerStr === "#!") { // Shebang
          return NextResponse.json({ success: false, message: "Unsafe shell scripting contents detected." }, { status: 400 });
        }
      }

      // Sanitize filename & create unique name with UUID
      const cleanBaseName = baseName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const dotIndex = cleanBaseName.lastIndexOf(".");
      const namePart = dotIndex !== -1 ? cleanBaseName.substring(0, dotIndex) : cleanBaseName;
      const uniqueId = crypto.randomUUID();
      const uniqueFilename = `${namePart}_${uniqueId}`;

      // Upload to Cloudinary
      const uploadResult = await uploadFileBuffer(buffer, "inquiries", uniqueFilename);

      attachmentUrl = uploadResult.secure_url;
      attachmentName = cleanBaseName;
      attachmentSize = file.size;
      attachmentPublicId = uploadResult.public_id;
    }

    // 3. Save to Database
    await connectToDatabase();
    const inquiry = await Inquiry.create({
      ...validatedData,
      attachmentUrl,
      attachmentName,
      attachmentSize,
      attachmentPublicId,
      status: "PENDING",
    });

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
      { success: false, message: "Internal Server Error: " + err.message },
      { status: 500 }
    );
  }
}
