import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import AutomationRule from "@/models/AutomationRule";
import { z } from "zod";

const automationRuleSchema = z.object({
  name: z.string().min(1, "Workflow name is required"),
  triggerType: z.enum(["SUBSCRIBER_JOIN", "INQUIRY_SUBMIT"]),
  steps: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["SEND_EMAIL", "DELAY", "ADD_TAG", "REMOVE_TAG"]),
      templateId: z.string().optional(),
      delayDays: z.number().default(0),
      delayHours: z.number().default(0),
      tagId: z.string().optional(),
    })
  ),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const rules = await AutomationRule.find({}).populate("steps.templateId", "name slug").populate("steps.tagId", "name slug").sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: rules });
  } catch (err: any) {
    console.error("GET Automations error:", err);
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
    const result = automationRuleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const rule = await AutomationRule.create(result.data);

    return NextResponse.json(
      { success: true, message: "Automation rule created successfully", data: rule },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST Automation error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
