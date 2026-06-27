import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import Tag from "@/models/Tag";
import SubscriberGroup from "@/models/SubscriberGroup";
import { z } from "zod";

const subscriberCreateSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(["SUBSCRIBED", "UNSUBSCRIBED", "BOUNCED", "SPAM"]).default("SUBSCRIBED"),
  tags: z.array(z.string()).default([]),
  groups: z.array(z.string()).default([]),
  customFields: z.record(z.string(), z.string()).default({}),
});

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const tag = searchParams.get("tag") || "";
    const group = searchParams.get("group") || "";

    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      filter.status = status;
    }
    if (tag) {
      filter.tags = tag;
    }
    if (group) {
      filter.groups = group;
    }

    const subscribers = await Subscriber.find(filter)
      .populate("tags", "name slug")
      .populate("groups", "name slug")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: subscribers });
  } catch (err: any) {
    console.error("GET Subscribers error:", err);
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
    const result = subscriberCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Subscriber.findOne({ email: result.data.email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A subscriber with this email address already exists" },
        { status: 400 }
      );
    }

    const subscriber = await Subscriber.create({
      ...result.data,
      email: result.data.email.toLowerCase(),
    });

    return NextResponse.json(
      { success: true, message: "Subscriber created successfully", data: subscriber },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST Subscriber error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
