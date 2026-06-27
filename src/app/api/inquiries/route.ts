import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import { getCurrentAdmin } from "@/lib/auth";
import { inquirySchema } from "@/lib/validation";
import { uploadFileBuffer } from "@/lib/cloudinary";
import path from "path";
import Subscriber from "@/models/Subscriber";
import BrandSetting from "@/models/BrandSetting";
import EmailTemplate from "@/models/EmailTemplate";
import { getEmailQueue } from "@/lib/queue/emailQueue";
import { compileEmailHtml, interpolateVariables } from "@/lib/emails/renderer";

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

    // Generate a unique Reference ID
    const referenceId = `INQ-${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. Save to Database
    await connectToDatabase();
    const inquiry = await Inquiry.create({
      ...validatedData,
      attachmentUrl,
      attachmentName,
      attachmentSize,
      attachmentPublicId,
      referenceId,
      status: "PENDING",
    });

    // Optionally Create Subscriber (Check if subscriber already exists, otherwise create)
    let subscriber = await Subscriber.findOne({ email: validatedData.email.toLowerCase() });
    if (!subscriber) {
      const nameParts = validatedData.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      subscriber = await Subscriber.create({
        email: validatedData.email.toLowerCase(),
        firstName,
        lastName,
        status: "SUBSCRIBED",
      });
    }

    // Load templates & Brand settings
    const brand = (await BrandSetting.findOne({})) || {
      brandName: "Dhyey Bhuva Portfolio",
      supportEmail: "support@dhyeybhuva.tech",
      replyEmail: "noreply@dhyeybhuva.tech",
      website: "https://dhyeybhuva.tech",
      primaryColor: "#4f46e5",
      secondaryColor: "#475569",
      accentColor: "#2563eb",
      copyright: "© Dhyey Bhuva. All rights reserved.",
      address: "India",
    };

    const ownerTemplate = await EmailTemplate.findOne({ slug: "contact-inquiry" });
    const userTemplate = await EmailTemplate.findOne({ slug: "auto-reply" });

    // Enqueue emails (BullMQ)
    try {
      const emailQueue = getEmailQueue();

      // Compile Owner Email Content
      const ownerSubjectCompiled = ownerTemplate
        ? interpolateVariables(ownerTemplate.subject, { inquiry, currentDate: new Date().toLocaleDateString() })
        : `📩 [Inquiry] ${validatedData.subject || "New Message"} - ${validatedData.name}`;

      const ownerHtml = ownerTemplate
        ? compileEmailHtml(
            ownerTemplate.jsonLayout,
            brand,
            subscriber,
            { subject: validatedData.subject, name: validatedData.name },
            { inquiry }
          )
        : `<h3>New Inquiry</h3><p><strong>Name:</strong> ${validatedData.name}</p><p><strong>Email:</strong> ${validatedData.email}</p><p><strong>Message:</strong> ${validatedData.message}</p>`;

      await emailQueue.add("send-email", {
        recipientEmail: process.env.CONTACT_RECEIVER_EMAIL || brand.supportEmail || "dhyeybhuva2003@gmail.com",
        subject: ownerSubjectCompiled,
        htmlContent: ownerHtml,
        campaignId: undefined,
        subscriberId: subscriber._id.toString(),
        senderName: "Inquiry Form",
        replyTo: validatedData.email,
      });

      // Compile User Confirmation Content
      const userSubjectCompiled = userTemplate
        ? interpolateVariables(userTemplate.subject, { inquiry, currentDate: new Date().toLocaleDateString() })
        : "Inquiry Confirmation - Dhyey Bhuva";

      const userHtml = userTemplate
        ? compileEmailHtml(
            userTemplate.jsonLayout,
            brand,
            subscriber,
            { subject: validatedData.subject, name: validatedData.name },
            { inquiry }
          )
        : `<h3>Confirmation</h3><p>Dear ${validatedData.name}, your message has been received.</p>`;

      await emailQueue.add("send-email", {
        recipientEmail: validatedData.email.toLowerCase(),
        subject: userSubjectCompiled,
        htmlContent: userHtml,
        campaignId: undefined,
        subscriberId: subscriber._id.toString(),
        senderName: brand.brandName || "Dhyey Bhuva",
        replyTo: brand.replyEmail || "noreply@dhyeybhuva.tech",
      });

      console.log(`[InquiryRoute] Successfully enqueued emails for reference ${referenceId}`);
    } catch (queueErr) {
      console.error("[InquiryRoute] Failed to enqueue emails:", queueErr);
    }

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
