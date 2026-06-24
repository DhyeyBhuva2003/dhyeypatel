import React from "react";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import Service from "@/models/Service";
import Blog from "@/models/Blog";
import Inquiry from "@/models/Inquiry";
import User from "@/models/User";
import { Inquiry as InquiryType } from "@/types";
import DashboardOverview from "@/components/admin/DashboardOverview";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  let metrics = {
    totalUsers: 0,
    totalAdmins: 0,
    activeUsers: 0,
    newUsers: 0,
    totalProjects: 0,
    totalServices: 0,
    totalBlogs: 0,
    totalInquiries: 0,
    recentLeads: [] as InquiryType[],
  };

  try {
    await connectToDatabase();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Fetch aggregates in parallel
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
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Project.countDocuments({}),
      Service.countDocuments({}),
      Blog.countDocuments({}),
      Inquiry.countDocuments({}),
      Inquiry.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    metrics = {
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
  } catch (err) {
    console.error("Dashboard prefetch error:", err);
  }

  return <DashboardOverview initialMetrics={metrics} />;
}
