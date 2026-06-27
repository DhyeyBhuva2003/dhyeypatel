import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import EmailLog from "@/models/EmailLog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get("logId");

    if (logId) {
      await connectToDatabase();
      const log = await EmailLog.findOne({ queueId: logId });
      if (log && ["DELIVERED", "SENT"].includes(log.status)) {
        log.status = "OPENED";
        log.openedAt = new Date();
        await log.save();
      }
    }

    // Return 1x1 transparent GIF
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );

    return new NextResponse(pixel, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("Tracking open error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
