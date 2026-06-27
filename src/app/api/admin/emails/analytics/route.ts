import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import EmailLog from "@/models/EmailLog";
import Subscriber from "@/models/Subscriber";
import Campaign from "@/models/Campaign";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30"; // 7, 30, 365 days
    const rangeDays = parseInt(range, 10);
    const startDate = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000);

    await connectToDatabase();

    // 1. Fetch KPI aggregates
    const [
      totalSubscribers,
      activeSubscribers,
      totalCampaigns,
      totalLogs,
    ] = await Promise.all([
      Subscriber.countDocuments({}),
      Subscriber.countDocuments({ status: "SUBSCRIBED" }),
      Campaign.countDocuments({}),
      EmailLog.countDocuments({ createdAt: { $gte: startDate } }),
    ]);

    // Group logs by status
    const statusCounts = await EmailLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats = {
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
    };

    statusCounts.forEach((item) => {
      const status = item._id.toLowerCase();
      if (status === "delivered") stats.delivered += item.count;
      else if (status === "opened") {
        stats.opened += item.count;
        stats.delivered += item.count; // opened implies delivered
      } else if (status === "clicked") {
        stats.clicked += item.count;
        stats.opened += item.count; // clicked implies opened
        stats.delivered += item.count;
      } else if (status === "bounced") stats.bounced += item.count;
      else if (status === "unsubscribed") stats.unsubscribed += item.count;
    });

    // 2. Timeline Aggregations (Daily)
    const dailyStats = await EmailLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          delivered: { $sum: { $cond: [{ $in: ["$status", ["DELIVERED", "OPENED", "CLICKED"]] }, 1, 0] } },
          opened: { $sum: { $cond: [{ $in: ["$status", ["OPENED", "CLICKED"]] }, 1, 0] } },
          clicked: { $sum: { $cond: [{ $eq: ["$status", "CLICKED"] }, 1, 0] } },
          bounced: { $sum: { $cond: [{ $eq: ["$status", "BOUNCED"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const timelineData = dailyStats.map((d) => ({
      label: new Date(d._id).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      delivered: d.delivered,
      opened: d.opened,
      clicked: d.clicked,
      bounced: d.bounced,
    }));

    // 3. Campaign Performance List
    const campaignStats = await EmailLog.aggregate([
      { $match: { campaign: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$campaign",
          sent: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $in: ["$status", ["DELIVERED", "OPENED", "CLICKED"]] }, 1, 0] } },
          opened: { $sum: { $cond: [{ $in: ["$status", ["OPENED", "CLICKED"]] }, 1, 0] } },
          clicked: { $sum: { $cond: [{ $eq: ["$status", "CLICKED"] }, 1, 0] } },
          bounced: { $sum: { $cond: [{ $eq: ["$status", "BOUNCED"] }, 1, 0] } },
        },
      },
    ]);

    // Populate campaign details
    const campaigns = await Campaign.find({ _id: { $in: campaignStats.map((c) => c._id) } }).select(
      "name subject status"
    );
    const campaignPerformance = campaignStats.map((c) => {
      const details = campaigns.find((camp) => camp._id.toString() === c._id.toString());
      return {
        id: c._id,
        name: details?.name || "Deleted Campaign",
        subject: details?.subject || "",
        status: details?.status || "UNKNOWN",
        sent: c.sent,
        delivered: c.delivered,
        opened: c.opened,
        clicked: c.clicked,
        bounced: c.bounced,
        openRate: c.sent > 0 ? Math.round((c.opened / c.sent) * 100) : 0,
        clickRate: c.sent > 0 ? Math.round((c.clicked / c.sent) * 100) : 0,
      };
    });

    // 4. Subscriber Growth
    const subscriberGrowth = await Subscriber.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let runningTotal = totalSubscribers - subscriberGrowth.reduce((sum, d) => sum + d.count, 0);
    const growthTimeline = subscriberGrowth.map((d) => {
      runningTotal += d.count;
      return {
        label: new Date(d._id).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: runningTotal,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalSubscribers,
          activeSubscribers,
          totalCampaigns,
          totalSent: totalLogs,
          ...stats,
          openRate: totalLogs > 0 ? Math.round((stats.opened / totalLogs) * 100) : 0,
          clickRate: totalLogs > 0 ? Math.round((stats.clicked / totalLogs) * 100) : 0,
        },
        timeline: timelineData,
        campaignPerformance,
        growthTimeline,
      },
    });
  } catch (err: any) {
    console.error("GET Analytics error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
