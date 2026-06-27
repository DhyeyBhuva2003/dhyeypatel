import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Campaign from "@/models/Campaign";
import { getEmailQueue } from "@/lib/queue/emailQueue";
import { z } from "zod";

const campaignUpdateSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Subject is required"),
  template: z.string().min(1, "Template is required"),
  senderName: z.string().min(1, "Sender name is required"),
  replyTo: z.string().email("Invalid reply-to email"),
  campaignType: z.enum(["NEWSLETTER", "PROMOTION", "ANNOUNCEMENT", "FOLLOW_UP", "CUSTOM"]),
  audience: z.object({
    type: z.enum(["ALL", "GROUPS", "TAGS", "MANUAL", "CSV"]),
    groupIds: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
    manualEmails: z.array(z.string()).optional(),
    csvUrl: z.string().optional(),
  }),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        size: z.number(),
      })
    )
    .default([]),
  schedule: z.object({
    sendNow: z.boolean(),
    scheduledAt: z.string().optional(),
    timezone: z.string().default("UTC"),
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["DRAFT", "SCHEDULED", "PROCESSING", "COMPLETED", "FAILED", "PAUSED"]).optional(),
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
    const campaign = await Campaign.findById(id).populate("template", "name slug subject");
    if (!campaign) {
      return NextResponse.json({ success: false, message: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: campaign });
  } catch (err: any) {
    console.error("GET Campaign error:", err);
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

    const result = campaignUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return NextResponse.json({ success: false, message: "Campaign not found" }, { status: 404 });
    }

    const wasDraft = campaign.status === "DRAFT";
    const statusRequested = result.data.status || campaign.status;

    // Save update
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      {
        ...result.data,
        status: statusRequested,
      },
      { new: true }
    );

    // If campaign transitions to SCHEDULED, enqueue start-campaign job
    if (wasDraft && statusRequested === "SCHEDULED" && updatedCampaign) {
      const emailQueue = getEmailQueue();
      const jobOptions: any = {};

      const sendNow = result.data.schedule.sendNow;
      const scheduledAt = result.data.schedule.scheduledAt;

      if (!sendNow && scheduledAt) {
        const delay = new Date(scheduledAt).getTime() - Date.now();
        if (delay > 0) {
          jobOptions.delay = delay;
        }
      }

      await emailQueue.add("start-campaign", { campaignId: id }, jobOptions);
    }

    return NextResponse.json({
      success: true,
      message: "Campaign updated successfully",
      data: updatedCampaign,
    });
  } catch (err: any) {
    console.error("PUT Campaign error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!["DRAFT", "SCHEDULED", "PAUSED", "COMPLETED", "FAILED"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status state" }, { status: 400 });
    }

    await connectToDatabase();
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return NextResponse.json({ success: false, message: "Campaign not found" }, { status: 404 });
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(id, { status }, { new: true });

    // Handle trigger when toggling from paused back to scheduled/send-now
    if (status === "SCHEDULED") {
      const emailQueue = getEmailQueue();
      const jobOptions: any = {};

      const sendNow = campaign.schedule.sendNow;
      const scheduledAt = campaign.schedule.scheduledAt;

      if (!sendNow && scheduledAt) {
        const delay = new Date(scheduledAt).getTime() - Date.now();
        if (delay > 0) {
          jobOptions.delay = delay;
        }
      }

      await emailQueue.add("start-campaign", { campaignId: id }, jobOptions);
    }

    return NextResponse.json({
      success: true,
      message: `Campaign status updated to ${status}`,
      data: updatedCampaign,
    });
  } catch (err: any) {
    console.error("PATCH Campaign error:", err);
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
    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) {
      return NextResponse.json({ success: false, message: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Campaign deleted successfully" });
  } catch (err: any) {
    console.error("DELETE Campaign error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
