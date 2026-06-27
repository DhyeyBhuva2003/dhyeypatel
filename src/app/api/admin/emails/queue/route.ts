import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getEmailQueue } from "@/lib/queue/emailQueue";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const queue = getEmailQueue();
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    // Retrieve recent completed/failed jobs
    const jobs = await queue.getJobs(["waiting", "active", "delayed", "failed"], 0, 49, true);

    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: {
        recipientEmail: job.data.recipientEmail,
        subject: job.data.subject,
        campaignId: job.data.campaignId,
      },
      progress: job.progress,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      status: job.failedReason ? "FAILED" : job.finishedOn ? "COMPLETED" : "PENDING",
    }));

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          waiting,
          active,
          completed,
          failed,
          delayed,
        },
        jobs: formattedJobs,
      },
    });
  } catch (err: any) {
    console.error("GET Queue error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const queue = getEmailQueue();
    
    // Clear all completed/failed/waiting/delayed jobs
    await Promise.all([
      queue.clean(0, 1000, "completed"),
      queue.clean(0, 1000, "failed"),
      queue.drain(true),
    ]);

    return NextResponse.json({ success: true, message: "Email queue cleared successfully" });
  } catch (err: any) {
    console.error("DELETE Queue error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
