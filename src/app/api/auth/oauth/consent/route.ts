import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Preferences from "@/models/Preferences";
import Subscriber from "@/models/Subscriber";
import Tag from "@/models/Tag";
import AuditLog from "@/models/AuditLog";
import { verifyToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value || cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { consent } = body; // boolean

    await connectToDatabase();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";
    let browser = "Unknown";
    let device = "Desktop";

    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    if (/Mobi|Android|iPhone/i.test(userAgent)) {
      device = "Mobile";
    }

    // 1. Update User Preferences opt-in status
    let preferences = await Preferences.findOne({ user: user._id });
    if (!preferences) {
      preferences = new Preferences({ user: user._id });
    }
    preferences.marketingOptIn = !!consent;
    preferences.marketingOptInDate = new Date();
    preferences.marketingOptInSource = "OAuth Consent Screen Dialog";
    preferences.marketingOptInIp = ipAddress;
    await preferences.save();

    // 2. Update Subscriber marketing status & assign tags
    let subscriber = await Subscriber.findOne({ email: user.email.toLowerCase() });
    if (subscriber) {
      subscriber.status = consent ? "SUBSCRIBED" : "UNSUBSCRIBED";

      if (consent) {
        let newsletterTag = await Tag.findOne({ slug: "newsletter" });
        if (!newsletterTag) {
          newsletterTag = await Tag.create({ name: "Newsletter", slug: "newsletter" });
        }
        let marketingTag = await Tag.findOne({ slug: "marketing" });
        if (!marketingTag) {
          marketingTag = await Tag.create({ name: "Marketing", slug: "marketing" });
        }

        const existingTags = subscriber.tags.map((t: any) => t.toString());
        if (!existingTags.includes(newsletterTag._id.toString())) {
          subscriber.tags.push(newsletterTag._id);
        }
        if (!existingTags.includes(marketingTag._id.toString())) {
          subscriber.tags.push(marketingTag._id);
        }
      }
      await subscriber.save();
    }

    // 3. Create Audit Log
    await AuditLog.create({
      user: user._id,
      action: "UPDATE_CONSENT",
      ipAddress,
      device,
      browser,
      details: { consent: !!consent, source: "OAuth Consent Dialog" },
    });

    return NextResponse.json({
      success: true,
      message: consent ? "Subscribed to newsletter updates!" : "Subscription skipped.",
    });
  } catch (err: any) {
    console.error("Consent API Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
