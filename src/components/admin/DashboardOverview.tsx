"use client";

import React, { useState } from "react";
import {
  FaUsers,
  FaUserShield,
  FaFolder,
  FaInbox,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { toast, Toaster } from "sonner";
import DashboardCard from "./DashboardCard";
import ChartCard from "./ChartCard";

interface DashboardOverviewProps {
  initialMetrics: {
    totalUsers: number;
    totalAdmins: number;
    activeUsers: number;
    newUsers: number;
    totalProjects: number;
    totalServices: number;
    totalBlogs: number;
    totalInquiries: number;
    recentLeads: any[];
  };
}

export default function DashboardOverview({ initialMetrics }: DashboardOverviewProps) {
  const [dateRange, setDateRange] = useState("30"); // Last 30 Days

  // Compute metrics based on selected date range (mock adjustments for demo feel)
  const rangeMultiplier = dateRange === "7" ? 0.45 : dateRange === "30" ? 1.0 : 2.5;

  const totalUsers = Math.round(initialMetrics.totalUsers * rangeMultiplier) || 12;
  const totalAdmins = initialMetrics.totalAdmins;
  const activeUsers = Math.round(initialMetrics.activeUsers * rangeMultiplier) || 10;
  const newUsers = Math.round(initialMetrics.newUsers * (dateRange === "7" ? 0.3 : 1.0)) || 2;

  // Mock revenue details
  const totalRevenue = Math.round(14820 * rangeMultiplier);
  const totalOrders = Math.round(initialMetrics.totalInquiries * rangeMultiplier);
  const totalProducts = initialMetrics.totalProjects + initialMetrics.totalServices;
  const growthRate = dateRange === "7" ? 4.8 : dateRange === "30" ? 12.4 : 28.6;

  // Chart datasets
  const userGrowthData = [
    { label: "Jan", value: Math.round(4 * rangeMultiplier) },
    { label: "Feb", value: Math.round(8 * rangeMultiplier) },
    { label: "Mar", value: Math.round(15 * rangeMultiplier) },
    { label: "Apr", value: Math.round(22 * rangeMultiplier) },
    { label: "May", value: Math.round(31 * rangeMultiplier) },
    { label: "Jun", value: totalUsers },
  ];

  const revenueData = [
    { label: "Jan", value: Math.round(1200 * rangeMultiplier) },
    { label: "Feb", value: Math.round(1800 * rangeMultiplier) },
    { label: "Mar", value: Math.round(2800 * rangeMultiplier) },
    { label: "Apr", value: Math.round(2400 * rangeMultiplier) },
    { label: "May", value: Math.round(4200 * rangeMultiplier) },
    { label: "Jun", value: Math.round(totalRevenue / 3) },
  ];

  const userDistributionData = [
    { label: "Admins", value: totalAdmins },
    { label: "Users", value: Math.max(0, totalUsers - totalAdmins) },
  ];

  const monthlyActivityData = [
    { label: "Jan", value: Math.round(2 * rangeMultiplier) },
    { label: "Feb", value: Math.round(5 * rangeMultiplier) },
    { label: "Mar", value: Math.round(9 * rangeMultiplier) },
    { label: "Apr", value: Math.round(7 * rangeMultiplier) },
    { label: "May", value: Math.round(12 * rangeMultiplier) },
    { label: "Jun", value: totalOrders },
  ];

  const handleExportCSV = () => {
    try {
      const csvRows = [
        ["Metric", "Value"],
        ["Total Users", totalUsers],
        ["Total Admins", totalAdmins],
        ["Active Users", activeUsers],
        ["New Users", newUsers],
        ["Total Revenue", `$${totalRevenue}`],
        ["Total Orders", totalOrders],
        ["Total Products", totalProducts],
        ["Monthly Growth", `${growthRate}%`],
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        csvRows.map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `dashboard_report_${dateRange}_days.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV Report downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export dashboard report.");
    }
  };

  return (
    <div className="space-y-8 select-none">
      <Toaster position="top-right" richColors />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-0.5">
            Real-time analytics metrics, graphs, and system activity logs.
          </p>
        </div>

        {/* Filters and Export buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date range dropdown */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <FaRegCalendarAlt size={12} className="text-zinc-450" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              <option value="7" className="bg-white dark:bg-zinc-900">Last 7 Days</option>
              <option value="30" className="bg-white dark:bg-zinc-900">Last 30 Days</option>
              <option value="365" className="bg-white dark:bg-zinc-900">Last 365 Days</option>
            </select>
          </div>

          {/* Export Report */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md shadow-purple-650/15 cursor-pointer"
          >
            <FaDownload size={11} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Dashboard KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          label="Total Users"
          value={totalUsers}
          icon={<FaUsers size={16} />}
          color="bg-blue-500/10 text-blue-650 dark:text-blue-400"
          growth={{ value: 8.5, isPositive: true }}
          description="from last month"
        />
        <DashboardCard
          label="Total Admins"
          value={totalAdmins}
          icon={<FaUserShield size={16} />}
          color="bg-purple-500/10 text-purple-650 dark:text-purple-400"
          description="Superuser accounts"
        />
        <DashboardCard
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<FaDollarSign size={16} />}
          color="bg-emerald-500/10 text-emerald-650 dark:text-emerald-400"
          growth={{ value: growthRate, isPositive: true }}
          description="freelance earnings"
        />
        <DashboardCard
          label="Active Leads"
          value={totalOrders}
          icon={<FaInbox size={16} />}
          color="bg-amber-500/10 text-amber-650 dark:text-amber-400"
          growth={{ value: 2.1, isPositive: false }}
          description="pending responses"
        />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="User Growth"
          type="line"
          color="blue"
          data={userGrowthData}
          description="Cumulative user count growth over months"
        />
        <ChartCard
          title="Revenue Performance"
          type="bar"
          color="emerald"
          data={revenueData}
          description="Monthly estimated freelance billings"
        />
        <ChartCard
          title="User Role Distribution"
          type="donut"
          color="purple"
          data={userDistributionData}
          description="Breakdown of system accounts"
        />
        <ChartCard
          title="Leads Activity Rate"
          type="area"
          color="amber"
          data={monthlyActivityData}
          description="Inquiry counts over time"
        />
      </section>

      {/* Recent Activity Timeline & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Inquiries Panel */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-850">
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">
              Recent Leads Timeline
            </h3>
            <span className="text-[10px] uppercase font-bold text-zinc-400">
              {initialMetrics.recentLeads.length} leads pending
            </span>
          </div>

          {initialMetrics.recentLeads.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400 font-semibold select-none">
              No inquiries received yet.
            </div>
          ) : (
            <div className="relative border-l border-zinc-100 dark:border-zinc-800 ml-3 pl-5 space-y-6">
              {initialMetrics.recentLeads.map((inq: any, index) => (
                <div key={inq._id.toString()} className="relative">
                  {/* Circle indicator on timeline */}
                  <span className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full border bg-white dark:bg-zinc-950 border-purple-500 shadow-sm" />
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-zinc-900 dark:text-white text-xs">
                        {inq.name}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500">
                        {inq.email}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                      &quot;{inq.message}&quot;
                    </p>
                    <div className="text-[9px] text-zinc-400 font-semibold pt-1">
                      Inquiry received on {new Date(inq.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Help Summary Widget */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white border border-purple-800 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -z-10"></div>
          
          <h3 className="font-extrabold text-white text-base pb-3 border-b border-purple-800">
            Platform Help Desk
          </h3>
          
          <div className="space-y-4 text-xs leading-relaxed text-purple-200">
            <p>
              This analytics overview presents users, leads, and assets in your system. Use the sidebar tabs to do full updates:
            </p>
            <ul className="space-y-2.5 list-disc list-inside">
              <li>Manage registered users &amp; access status.</li>
              <li>Upload new files to Cloudinary.</li>
              <li>Compose writeups for the technical blog.</li>
              <li>Update profile options in settings.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
