import React from "react";
import Link from "next/link";
import { FaInbox, FaFolder, FaConciergeBell, FaPenSquare, FaArrowRight, FaClock } from "react-icons/fa";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import Service from "@/models/Service";
import Blog from "@/models/Blog";
import Inquiry from "@/models/Inquiry";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  let stats = { projects: 0, services: 0, blogs: 0, inquiries: 0 };
  let recentInquiries: any[] = [];

  try {
    await connectToDatabase();
    
    // Fetch counts in parallel
    const [projectCount, serviceCount, blogCount, inquiryCount] = await Promise.all([
      Project.countDocuments({}),
      Service.countDocuments({}),
      Blog.countDocuments({}),
      Inquiry.countDocuments({}),
    ]);

    stats = {
      projects: projectCount,
      services: serviceCount,
      blogs: blogCount,
      inquiries: inquiryCount,
    };

    // Fetch 5 most recent inquiries
    recentInquiries = await Inquiry.find({}).sort({ createdAt: -1 }).limit(5).lean();
  } catch (err) {
    console.error("Dashboard prefetch metrics error:", err);
  }

  const statCards = [
    {
      label: "Inquiries Box",
      value: stats.inquiries,
      icon: <FaInbox className="w-5 h-5 text-purple-650" />,
      color: "bg-purple-500/10",
      href: "/admin/inquiries",
    },
    {
      label: "Portfolio Projects",
      value: stats.projects,
      icon: <FaFolder className="w-5 h-5 text-blue-650" />,
      color: "bg-blue-500/10",
      href: "/admin/projects",
    },
    {
      label: "Freelance Services",
      value: stats.services,
      icon: <FaConciergeBell className="w-5 h-5 text-green-650" />,
      color: "bg-green-500/10",
      href: "/admin/services",
    },
    {
      label: "Blog Articles",
      value: stats.blogs,
      icon: <FaPenSquare className="w-5 h-5 text-orange-650" />,
      color: "bg-orange-500/10",
      href: "/admin/blogs",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          System Overview
        </h1>
        <p className="text-sm text-zinc-500">
          Check analytics counters and manage inbound client leads.
        </p>
      </div>

      {/* Grid Counters */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs text-zinc-450 font-semibold">{card.label}</span>
              <div className="text-3xl font-black text-zinc-900 dark:text-white">
                {card.value}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}>
              {card.icon}
            </div>
          </Link>
        ))}
      </section>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Recent Inquiries */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-850">
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">
              Recent Leads Inbox
            </h3>
            <Link
              href="/admin/inquiries"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:underline"
            >
              <span>Manage all inquiries</span>
              <FaArrowRight size={10} />
            </Link>
          </div>

          {recentInquiries.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No inquiries received yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {recentInquiries.map((inq: any) => (
                <div
                  key={inq._id.toString()}
                  className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white text-sm">
                        {inq.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        inq.status === "PENDING"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          : inq.status === "CONTACTED"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                          : "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                      }`}>
                        {inq.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">{inq.email}</div>
                    <p className="text-xs text-zinc-650 dark:text-zinc-400 line-clamp-1 leading-relaxed">
                      {inq.message}
                    </p>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1 shrink-0">
                    <FaClock />
                    <span>{formatDate(inq.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Quick Actions Panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm space-y-6">
          <h3 className="font-extrabold text-zinc-900 dark:text-white text-base pb-4 border-b border-zinc-100 dark:border-zinc-850">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/projects"
              className="w-full text-center py-3 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition"
            >
              Add New Project
            </Link>
            <Link
              href="/admin/blogs"
              className="w-full text-center py-3 rounded-xl border border-zinc-250 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-55/10 dark:hover:bg-zinc-950 transition"
            >
              Compose Blog Post
            </Link>
            <Link
              href="/admin/services"
              className="w-full text-center py-3 rounded-xl border border-zinc-250 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-55/10 dark:hover:bg-zinc-950 transition"
            >
              Edit Freelance Tiers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
