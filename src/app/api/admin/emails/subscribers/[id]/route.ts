import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";

const subscriberUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(["SUBSCRIBED", "UNSUBSCRIBED", "BOUNCED", "SPAM"]).default("SUBSCRIBED"),
  tags: z.array(z.string()).default([]),
  groups: z.array(z.string()).default([]),
  customFields: z.record(z.string(), z.string()).default({}),
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
    const subscriber = await Subscriber.findById(id).populate("tags").populate("groups");

    if (!subscriber) {
      return NextResponse.json({ success: false, message: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: subscriber });
  } catch (err: any) {
    console.error("GET Subscriber error:", err);
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

    const result = subscriberUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return NextResponse.json({ success: false, message: "Subscriber not found" }, { status: 404 });
    }

    const wasSubscribed = subscriber.status === "SUBSCRIBED";
    const statusRequested = result.data.status;

    // Track unsubscribed timestamp if state changes
    const unsubscribedAt =
      wasSubscribed && statusRequested === "UNSUBSCRIBED" ? new Date() : subscriber.unsubscribedAt;

    const updatedSubscriber = await Subscriber.findByIdAndUpdate(
      id,
      {
        ...result.data,
        unsubscribedAt,
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Subscriber updated successfully",
      data: updatedSubscriber,
    });
  } catch (err: any) {
    console.error("PUT Subscriber error:", err);
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
    const subscriber = await Subscriber.findByIdAndDelete(id);

    if (!subscriber) {
      return NextResponse.json({ success: false, message: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Subscriber deleted successfully" });
  } catch (err: any) {
    console.error("DELETE Subscriber error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
