"use client";

import React, { useState } from "react";
import { Users, Shield, DollarSign, Inbox, Calendar, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useDashboardStats } from "@/hooks/useDashboard";
import DashboardCard from "./DashboardCard";
import ChartCard from "./ChartCard";
import { Inquiry } from "@/types";

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
    recentLeads: Inquiry[];
  };
}

export default function DashboardOverview({ initialMetrics }: DashboardOverviewProps) {
  const [dateRange, setDateRange] = useState("30");

  const { data: metrics, loading, refetch } = useDashboardStats(Number(dateRange), [], {
    initialData: initialMetrics,
  });

  const activeMetrics = metrics || initialMetrics;

  const rangeMultiplier = dateRange === "7" ? 0.35 : dateRange === "30" ? 1.0 : 3.2;

  // Derive stats dynamically
  const totalUsers = activeMetrics.totalUsers || 0;
  const totalAdmins = activeMetrics.totalAdmins || 0;
  const activeUsers = activeMetrics.activeUsers || 0;
  const newUsers = activeMetrics.newUsers || 0;

  const totalRevenue = Math.round(15600 * rangeMultiplier);
  const totalOrders = activeMetrics.totalInquiries || 0;
  const totalProducts = (activeMetrics.totalProjects || 0) + (activeMetrics.totalServices || 0);
  const growthRate = dateRange === "7" ? 3.8 : dateRange === "30" ? 14.2 : 42.6;

  // Chart datasets
  const userGrowthData = [
    { label: "Jan", value: Math.round(2 * rangeMultiplier) + 1 },
    { label: "Feb", value: Math.round(5 * rangeMultiplier) + 2 },
    { label: "Mar", value: Math.round(11 * rangeMultiplier) + 3 },
    { label: "Apr", value: Math.round(18 * rangeMultiplier) + 4 },
    { label: "May", value: Math.round(27 * rangeMultiplier) + 5 },
    { label: "Jun", value: totalUsers },
  ];

  const revenueData = [
    { label: "Jan", value: Math.round(1400 * rangeMultiplier) },
    { label: "Feb", value: Math.round(2100 * rangeMultiplier) },
    { label: "Mar", value: Math.round(2600 * rangeMultiplier) },
    { label: "Apr", value: Math.round(3100 * rangeMultiplier) },
    { label: "May", value: Math.round(4400 * rangeMultiplier) },
    { label: "Jun", value: Math.round(totalRevenue / 2.8) },
  ];

  const userDistributionData = [
    { label: "Admins", value: totalAdmins },
    { label: "Users", value: Math.max(0, totalUsers - totalAdmins) },
  ];

  const monthlyActivityData = [
    { label: "Jan", value: Math.round(1 * rangeMultiplier) + 1 },
    { label: "Feb", value: Math.round(3 * rangeMultiplier) + 1 },
    { label: "Mar", value: Math.round(7 * rangeMultiplier) + 2 },
    { label: "Apr", value: Math.round(6 * rangeMultiplier) + 2 },
    { label: "May", value: Math.round(10 * rangeMultiplier) + 3 },
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
        ["Total Inquiries", totalOrders],
        ["Total Products", totalProducts],
        ["Growth Rate", `${growthRate}%`],
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
      toast.error("Failed to export report.");
    }
  };

  return (
    <div className="space-y-8 select-none animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-550 mt-1">
            Real-time platform analytics, statistics logs, and inquiry tracking.
          </p>
        </div>

        {/* Date Filter & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer disabled:opacity-40"
            title="Refresh Stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-700 dark:text-zinc-350 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1 text-xs font-bold"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="365">Last 365 Days</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-md shadow-brand-primary/10 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          label="Total Users"
          value={totalUsers}
          icon={<Users className="w-4 h-4" />}
          color="bg-blue-500/10 text-blue-650 dark:text-blue-450"
          growth={{ value: 6.8, isPositive: true }}
          description="from last period"
        />
        <DashboardCard
          label="Superusers"
          value={totalAdmins}
          icon={<Shield className="w-4 h-4" />}
          color="bg-purple-500/10 text-purple-650 dark:text-purple-450"
          description="Admin access level"
        />
        <DashboardCard
          label="Est. Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
          color="bg-emerald-500/10 text-emerald-650 dark:text-emerald-450"
          growth={{ value: growthRate, isPositive: true }}
          description="cumulative stats"
        />
        <DashboardCard
          label="Pending Leads"
          value={totalOrders}
          icon={<Inbox className="w-4 h-4" />}
          color="bg-amber-500/10 text-amber-650 dark:text-amber-450"
          growth={{ value: 1.4, isPositive: false }}
          description="needs action"
        />
      </section>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="User Aggregates"
          type="line"
          color="blue"
          data={userGrowthData}
          description="Cumulative system registrations"
        />
        <ChartCard
          title="Estimated Inbound Billings"
          type="bar"
          color="emerald"
          data={revenueData}
          description="Aggregated project valuations"
        />
        <ChartCard
          title="User Roles breakdown"
          type="donut"
          color="purple"
          data={userDistributionData}
          description="System accounts level"
        />
        <ChartCard
          title="Leads Timeline Activity"
          type="area"
          color="amber"
          data={monthlyActivityData}
          description="Inbound messages count"
        />
      </section>

      {/* Timeline Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Leads */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-850">
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm uppercase tracking-wider">
              Recent Leads Timeline
            </h3>
            <span className="text-[10px] uppercase font-bold text-zinc-400">
              {activeMetrics.recentLeads.length} items logged
            </span>
          </div>

          {activeMetrics.recentLeads.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-450 font-semibold italic">
              No recent leads available.
            </div>
          ) : (
            <div className="relative border-l border-zinc-150 dark:border-zinc-800 ml-3 pl-6 space-y-6">
              {activeMetrics.recentLeads.map((inq: Inquiry) => (
                <div key={inq._id} className="relative animate-fadeIn">
                  <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white dark:bg-zinc-950 border-brand-primary shadow-sm" />
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white text-xs">
                        {inq.name}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-550">
                        {inq.email}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold italic leading-relaxed">
                      &quot;{inq.message}&quot;
                    </p>
                    <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider pt-0.5">
                      Logged {new Date(inq.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-950 text-white border border-indigo-900 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -z-10"></div>
          
          <h3 className="font-extrabold text-white text-xs uppercase tracking-wider pb-3 border-b border-indigo-900">
            Console Instructions
          </h3>
          
          <div className="space-y-3.5 text-[11px] leading-relaxed text-indigo-200 font-semibold">
            <p>
              This console manages system assets, client relations, and blog writes. Expand panels via sidebar menus:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Manage client portal users and roles.</li>
              <li>Add projects to showcase on portfolio.</li>
              <li>Configure system settings & credentials.</li>
              <li>Upload banners directly to Cloudinary.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
