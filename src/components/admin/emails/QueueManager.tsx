"use client";

import React, { useState, useEffect } from "react";
import emailsService from "@/services/emails";
import { toast } from "sonner";
import { RefreshCw, Trash2, ShieldAlert, CheckCircle, Clock, Play, Server } from "lucide-react";

export default function QueueManager() {
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [data, setData] = useState<{
    counts: { waiting: number; active: number; completed: number; failed: number; delayed: number };
    jobs: any[];
  }>({
    counts: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
    jobs: [],
  });

  const fetchQueueStats = async () => {
    setLoading(true);
    try {
      const res = await emailsService.getQueueStats();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to retrieve queue statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueStats();
    // Poll every 10 seconds for real-time counts
    const interval = setInterval(fetchQueueStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearQueue = async () => {
    if (!window.confirm("Are you sure you want to drain and clear all jobs in the Redis queue? This cannot be undone.")) {
      return;
    }
    setClearing(true);
    try {
      const res = await emailsService.clearQueue();
      if (res.success) {
        toast.success("Redis email queue cleared successfully");
        fetchQueueStats();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to clear queue");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Redis Sending Queue</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Monitor and manage the BullMQ processing queues in real-time.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchQueueStats}
            disabled={loading}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleClearQueue}
            disabled={clearing}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Flush Queue</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {/* Waiting */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-450">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Waiting</div>
            <div className="text-lg font-black text-zinc-900 dark:text-white leading-none mt-1">
              {data.counts.waiting}
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-450 animate-pulse">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Active</div>
            <div className="text-lg font-black text-zinc-900 dark:text-white leading-none mt-1">
              {data.counts.active}
            </div>
          </div>
        </div>

        {/* Delayed */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-650 dark:text-purple-450">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Scheduled</div>
            <div className="text-lg font-black text-zinc-900 dark:text-white leading-none mt-1">
              {data.counts.delayed}
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-450">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Completed</div>
            <div className="text-lg font-black text-zinc-900 dark:text-white leading-none mt-1">
              {data.counts.completed}
            </div>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-450">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Failed</div>
            <div className="text-lg font-black text-zinc-900 dark:text-white leading-none mt-1">
              {data.counts.failed}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Log */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-850 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-850">
          <h4 className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wider">
            Queue Activity Logs
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="p-4">Job ID</th>
                <th className="p-4">Action</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Attempts</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs">
              {data.jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 font-semibold italic">
                    No active or pending jobs in Redis queue.
                  </td>
                </tr>
              ) : (
                data.jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 font-medium">
                    <td className="p-4 font-mono text-[10px] text-zinc-400">{job.id}</td>
                    <td className="p-4 font-bold text-zinc-900 dark:text-white">{job.name}</td>
                    <td className="p-4 text-zinc-500">{job.data?.recipientEmail || "-"}</td>
                    <td className="p-4 text-zinc-500 truncate max-w-xs">{job.data?.subject || "-"}</td>
                    <td className="p-4 text-zinc-500 font-bold">{job.attemptsMade}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                          job.status === "FAILED"
                            ? "bg-red-500/10 text-red-650 dark:text-red-400"
                            : job.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-650 dark:text-emerald-400"
                            : "bg-blue-500/10 text-blue-650 dark:text-blue-400"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
