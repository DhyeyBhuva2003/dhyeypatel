"use client";

import React, { useState, useEffect } from "react";
import emailsService from "@/services/emails";
import { toast } from "sonner";
import {
  RefreshCw,
  Mail,
  Users,
  Send,
  Eye,
  MousePointerClick,
  AlertTriangle,
  Inbox,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import DashboardCard from "../DashboardCard";
import ChartCard from "../ChartCard";

export default function EmailsOverview() {
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("30");
  const [data, setData] = useState<any>({
    summary: {
      totalSubscribers: 0,
      activeSubscribers: 0,
      totalCampaigns: 0,
      totalSent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      openRate: 0,
      clickRate: 0,
    },
    timeline: [],
    campaignPerformance: [],
    growthTimeline: [],
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await emailsService.getAnalytics(range);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load email platform analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const { summary, timeline, campaignPerformance, growthTimeline } = data;

  // Format SVG charts datasets
  const growthChartData = growthTimeline.map((item: any) => ({
    label: item.label,
    value: item.value,
  }));

  // Fallback default datasets if empty
  const defaultGrowthData = [
    { label: "Jun 1", value: 10 },
    { label: "Jun 10", value: 18 },
    { label: "Jun 20", value: 27 },
    { label: "Jun 30", value: summary.totalSubscribers || 35 },
  ];

  const deliveryDonutData = [
    { label: "Delivered", value: summary.delivered || 0 },
    { label: "Bounced", value: summary.bounced || 0 },
  ];

  const activityTimelineData = timeline.map((item: any) => ({
    label: item.label,
    value: item.delivered,
  }));

  const defaultActivityData = [
    { label: "Week 1", value: 0 },
    { label: "Week 2", value: 0 },
    { label: "Week 3", value: 0 },
    { label: "Week 4", value: summary.totalSent || 0 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Dashboard Top bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Platform Analytics</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Real-time statistics logs for delivery, engagement, and segments.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold rounded-xl cursor-pointer focus:outline-none"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="365">Last 365 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          label="Total Subscribers"
          value={summary.totalSubscribers}
          icon={<Users className="w-4 h-4" />}
          color="bg-blue-500/10 text-blue-650 dark:text-blue-450"
          growth={{ value: summary.activeSubscribers > 0 ? 100 : 0, isPositive: true }}
          description="Active mailing lists"
        />

        <DashboardCard
          label="Emails Dispatched"
          value={summary.totalSent}
          icon={<Send className="w-4 h-4" />}
          color="bg-purple-500/10 text-purple-650 dark:text-purple-450"
          description="Total sent attempts"
        />

        <DashboardCard
          label="Open Rate"
          value={`${summary.openRate}%`}
          icon={<Eye className="w-4 h-4" />}
          color="bg-emerald-500/10 text-emerald-650 dark:text-emerald-450"
          description={`Delivered: ${summary.delivered}`}
        />

        <DashboardCard
          label="Click Rate"
          value={`${summary.clickRate}%`}
          icon={<MousePointerClick className="w-4 h-4" />}
          color="bg-amber-500/10 text-amber-650 dark:text-amber-450"
          description={`Clicks count: ${summary.clicked}`}
        />
      </section>

      {/* SVG Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscriber Growth Timeline */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Subscriber Growth Timeline"
            type="area"
            color="blue"
            data={growthChartData.length > 0 ? growthChartData : defaultGrowthData}
            description="Cumulative platform email contacts registrations"
          />
        </div>

        {/* Deliverability breakdown */}
        <div>
          <ChartCard
            title="Delivery Success Rates"
            type="donut"
            color="emerald"
            data={deliveryDonutData[0].value > 0 || deliveryDonutData[1].value > 0 ? deliveryDonutData : [{ label: "Delivered", value: 100 }, { label: "Bounced", value: 0 }]}
            description="Campaign logs status splits"
          />
        </div>
      </section>

      {/* Bottom split: Campaign Performance & Growth Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Campaign Reports table */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-850">
            <h4 className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wider">
              Campaign Performance Reports
            </h4>
            <span className="text-[10px] uppercase font-bold text-zinc-450">
              {campaignPerformance.length} items logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider pb-2">
                  <th className="pb-3">Campaign Name</th>
                  <th className="pb-3">Sent</th>
                  <th className="pb-3">Open Rate</th>
                  <th className="pb-3">Click Rate</th>
                  <th className="pb-3">Bounces</th>
                  <th className="pb-3 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-medium">
                {campaignPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400 italic">
                      No campaign logs available in current range.
                    </td>
                  </tr>
                ) : (
                  campaignPerformance.map((c: any) => (
                    <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                      <td className="py-3.5">
                        <div className="font-bold text-zinc-900 dark:text-white">{c.name}</div>
                        <div className="text-[9px] text-zinc-400 font-mono mt-0.5">{c.status}</div>
                      </td>
                      <td className="py-3.5 text-zinc-500 font-semibold">{c.sent}</td>
                      <td className="py-3.5 text-zinc-500 font-semibold">{c.openRate}%</td>
                      <td className="py-3.5 text-zinc-500 font-semibold">{c.clickRate}%</td>
                      <td className="py-3.5 text-zinc-500 font-semibold text-red-650 dark:text-red-400">{c.bounced}</td>
                      <td className="py-3.5 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-650 dark:text-emerald-400">
                          Done
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-950 text-white border border-indigo-900 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -z-10"></div>
          
          <h3 className="font-extrabold text-white text-xs uppercase tracking-wider pb-3 border-b border-indigo-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-brand-primary" />
            <span>Opt-In growth tips</span>
          </h3>
          
          <div className="space-y-3.5 text-[11px] leading-relaxed text-indigo-200 font-semibold">
            <p>
              Increase opt-in counts and campaign performance:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Enable welcome sequence automations.</li>
              <li>A/B test templates using Visual Email Builder.</li>
              <li>Maintain list cleanups to reduce bounces.</li>
              <li>Use personalized tags in subject lines.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
