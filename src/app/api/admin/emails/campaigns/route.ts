import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Campaign from "@/models/Campaign";
import { getEmailQueue } from "@/lib/queue/emailQueue";
import { z } from "zod";

const campaignCreateSchema = z.object({
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
});

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    // Populate templates inside campaigns list
    const campaigns = await Campaign.find({}).populate("template", "name slug").sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: campaigns });
  } catch (err: any) {
    console.error("GET Campaigns error:", err);
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
    const result = campaignCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const campaignData = {
      ...result.data,
      status: "DRAFT",
    };

    // If campaign has schedule details
    const sendNow = result.data.schedule.sendNow;
    const scheduledAt = result.data.schedule.scheduledAt;

    if (sendNow) {
      campaignData.status = "SCHEDULED";
    } else if (scheduledAt) {
      const scheduleTime = new Date(scheduledAt).getTime();
      if (scheduleTime > Date.now()) {
        campaignData.status = "SCHEDULED";
      } else {
        // If scheduled time is in the past, treat it as send now
        campaignData.status = "SCHEDULED";
      }
    }

    const campaign = await Campaign.create(campaignData);

    // If status is SCHEDULED, enqueue BullMQ job
    if (campaign.status === "SCHEDULED") {
      const emailQueue = getEmailQueue();
      const jobOptions: any = {};

      if (!sendNow && scheduledAt) {
        const delay = new Date(scheduledAt).getTime() - Date.now();
        if (delay > 0) {
          jobOptions.delay = delay;
          console.log(`[CampaignAPI] Campaign scheduled in future with delay: ${delay}ms`);
        }
      }

      // Add start-campaign job to the queue
      await emailQueue.add(
        "start-campaign",
        { campaignId: campaign._id.toString() },
        jobOptions
      );
    }

    return NextResponse.json(
      { success: true, message: "Campaign created successfully", data: campaign },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST Campaign error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
