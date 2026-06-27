import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import EmailLog from "@/models/EmailLog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get("logId");
    const destinationUrl = searchParams.get("url");

    if (!destinationUrl) {
      return new NextResponse("Missing destination url parameter", { status: 400 });
    }

    if (logId) {
      await connectToDatabase();
      const log = await EmailLog.findOne({ queueId: logId });
      if (log) {
        // Track the click event
        if (log.status !== "CLICKED" && log.status !== "UNSUBSCRIBED") {
          log.status = "CLICKED";
          log.clickedAt = new Date();
        }
        if (!log.clickedUrls.includes(destinationUrl)) {
          log.clickedUrls.push(destinationUrl);
        }
        await log.save();
      }
    }

    return NextResponse.redirect(destinationUrl);
  } catch (err: any) {
    console.error("Tracking click error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
