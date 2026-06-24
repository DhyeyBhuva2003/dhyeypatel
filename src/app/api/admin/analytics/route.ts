import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import Service from "@/models/Service";
import Blog from "@/models/Blog";
import Inquiry from "@/models/Inquiry";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get("range") || "30", 10);
    const now = new Date();
    const startDate = new Date(now.getTime() - range * 24 * 60 * 60 * 1000);

    await connectToDatabase();

    // Query aggregates in parallel
    const [
      userCount,
      adminCount,
      activeUserCount,
      newUserCount,
      projectCount,
      serviceCount,
      blogCount,
      inquiryCount,
      recentLeads,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "ADMIN" }),
      User.countDocuments({ status: "ACTIVE" }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Project.countDocuments({}),
      Service.countDocuments({}),
      Blog.countDocuments({}),
      Inquiry.countDocuments({ createdAt: { $gte: startDate } }),
      Inquiry.find({}).sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    // Format metrics
    const metrics = {
      totalUsers: userCount,
      totalAdmins: adminCount,
      activeUsers: activeUserCount,
      newUsers: newUserCount,
      totalProjects: projectCount,
      totalServices: serviceCount,
      totalBlogs: blogCount,
      totalInquiries: inquiryCount,
      recentLeads: JSON.parse(JSON.stringify(recentLeads)),
    };

    return NextResponse.json({
      success: true,
      message: "Analytics metrics compiled successfully",
      data: metrics,
    });
  } catch (err: any) {
    console.error("GET analytics API error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
