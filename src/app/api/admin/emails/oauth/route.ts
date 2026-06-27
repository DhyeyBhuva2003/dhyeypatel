import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Account from "@/models/Account";
import Subscriber from "@/models/Subscriber";
import AuditLog from "@/models/AuditLog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Run Aggregation Queries in Parallel
    const [
      googleUsers,
      linkedinUsers,
      totalUsers,
      linkedAccounts,
      marketingSubscribers,
      recentLogins,
      usersList,
    ] = await Promise.all([
      User.countDocuments({ provider: "GOOGLE" }),
      User.countDocuments({ provider: "LINKEDIN" }),
      User.countDocuments({}),
      Account.countDocuments({}),
      Subscriber.countDocuments({ status: "SUBSCRIBED" }),
      AuditLog.find({ action: { $in: ["LOGIN", "REGISTER"] } })
        .populate("user", "name email provider")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      User.find({ provider: { $in: ["GOOGLE", "LINKEDIN"] } })
        .select("name email provider lastLogin createdAt status")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
    ]);

    const unlinkedAccounts = totalUsers - linkedAccounts;

    return NextResponse.json({
      success: true,
      message: "OAuth metrics fetched successfully",
      data: {
        stats: {
          googleUsers,
          linkedinUsers,
          linkedAccounts,
          unlinkedAccounts,
          marketingSubscribers,
        },
        recentLogins: recentLogins.map((log: any) => ({
          id: log._id,
          userName: log.user?.name || "Visitor",
          userEmail: log.user?.email || "N/A",
          provider: log.user?.provider || log.details?.provider || "CREDENTIALS",
          action: log.action,
          ipAddress: log.ipAddress || "127.0.0.1",
          device: log.device || "Desktop",
          browser: log.browser || "Unknown",
          createdAt: log.createdAt,
        })),
        socialUsers: usersList.map((user: any) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          provider: user.provider,
          status: user.status,
          lastLogin: user.lastLogin || user.createdAt,
          createdAt: user.createdAt,
        })),
      },
    });
  } catch (err: any) {
    console.error("OAuth Management API Error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
