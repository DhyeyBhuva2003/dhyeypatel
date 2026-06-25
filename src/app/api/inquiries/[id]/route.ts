import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import { getCurrentAdmin } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

// PATCH update inquiry status by ID or delete inquiry attachment
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authenticate Admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, deleteAttachment } = body;

    await connectToDatabase();
    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: "Inquiry not found" },
        { status: 404 }
      );
    }

    // Handle Delete Attachment option
    if (deleteAttachment) {
      if (inquiry.attachmentPublicId) {
        try {
          const ext = inquiry.attachmentName?.split(".").pop()?.toLowerCase() || "";
          const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);
          const resource_type = isImage ? "image" : "raw";

          await cloudinary.uploader.destroy(inquiry.attachmentPublicId, { resource_type });
        } catch (cloudinaryErr) {
          console.error("Failed to delete attachment from Cloudinary:", cloudinaryErr);
        }
      }

      inquiry.attachmentUrl = "";
      inquiry.attachmentName = "";
      inquiry.attachmentSize = 0;
      inquiry.attachmentPublicId = "";
      await inquiry.save();

      return NextResponse.json({
        success: true,
        message: "Attachment deleted successfully",
        data: inquiry,
      });
    }

    // Validate status value
    if (!status || !["PENDING", "CONTACTED", "RESOLVED"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update Status
    inquiry.status = status;
    await inquiry.save();

    return NextResponse.json({
      success: true,
      message: "Inquiry status updated successfully",
      data: inquiry,
    });
  } catch (err: any) {
    console.error("PATCH Inquiry error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE inquiry by ID and its Cloudinary attachment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authenticate Admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Fetch from Database
    await connectToDatabase();
    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: "Inquiry not found" },
        { status: 404 }
      );
    }

    // Delete attachment from Cloudinary if it exists
    if (inquiry.attachmentPublicId) {
      try {
        const ext = inquiry.attachmentName?.split(".").pop()?.toLowerCase() || "";
        const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);
        const resource_type = isImage ? "image" : "raw";

        await cloudinary.uploader.destroy(inquiry.attachmentPublicId, { resource_type });
      } catch (cloudinaryErr) {
        console.error("Failed to delete attachment on inquiry deletion:", cloudinaryErr);
      }
    }

    // Delete from Database
    await inquiry.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Inquiry deleted successfully",
      data: {},
    });
  } catch (err: any) {
    console.error("DELETE Inquiry error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
