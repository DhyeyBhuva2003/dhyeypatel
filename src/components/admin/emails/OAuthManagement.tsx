"use client";

import React, { useState, useEffect } from "react";
import emailsService from "@/services/emails";
import { toast } from "sonner";
import {
  RefreshCw,
  Users,
  Shield,
  Clock,
  Laptop,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function OAuthManagement() {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>({
    stats: {
      googleUsers: 0,
      linkedinUsers: 0,
      linkedAccounts: 0,
      unlinkedAccounts: 0,
      marketingSubscribers: 0,
    },
    recentLogins: [],
    socialUsers: [],
  });

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await emailsService.getOauthMetrics();
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load OAuth statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const { stats, recentLogins, socialUsers } = metrics;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">OAuth Connections & CRM</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor Google/LinkedIn signups, account link status, and security session login histories.
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Google Users */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-4 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Google Users</span>
            <svg className="w-4 h-4 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            </svg>
          </div>
          <div className="text-xl font-black mt-2 text-zinc-900 dark:text-white">{stats.googleUsers}</div>
          <p className="text-[9px] text-zinc-450 mt-1 font-semibold">Verified OIDC sign-ins</p>
        </div>

        {/* LinkedIn Users */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-4 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">LinkedIn Users</span>
            <svg className="w-4 h-4 text-[#0077b5]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </div>
          <div className="text-xl font-black mt-2 text-zinc-900 dark:text-white">{stats.linkedinUsers}</div>
          <p className="text-[9px] text-zinc-450 mt-1 font-semibold">Verified professional profiles</p>
        </div>

        {/* Linked Accounts */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-4 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Linked Accounts</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black mt-2 text-zinc-900 dark:text-white">{stats.linkedAccounts}</div>
          <p className="text-[9px] text-zinc-450 mt-1 font-semibold">Social profiles mapping</p>
        </div>

        {/* Unlinked Accounts */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-4 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Credentials accounts</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black mt-2 text-zinc-900 dark:text-white">{stats.unlinkedAccounts}</div>
          <p className="text-[9px] text-zinc-450 mt-1 font-semibold">Local email signups</p>
        </div>

        {/* Marketing Subscribers */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-4 rounded-2xl shadow-sm col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Opt-In Consent</span>
            <Shield className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black mt-2 text-zinc-900 dark:text-white">{stats.marketingSubscribers}</div>
          <p className="text-[9px] text-zinc-450 mt-1 font-semibold">Explicit updates opt-ins</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Social Users Table */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-850 pb-3 flex justify-between items-center">
            <h4 className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wider">
              Social Connected Users ({socialUsers.length})
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider pb-2">
                  <th className="pb-3">User Profile</th>
                  <th className="pb-3">Auth Channel</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3 text-right">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-medium">
                {socialUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-400 italic">
                      No OAuth users registered yet.
                    </td>
                  </tr>
                ) : (
                  socialUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                      <td className="py-3">
                        <div className="font-bold text-zinc-900 dark:text-white">{u.name}</div>
                        <div className="text-[9.5px] font-mono text-zinc-400 mt-0.5">{u.email}</div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          u.provider === "GOOGLE"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-indigo-500/10 text-indigo-600"
                        }`}>
                          {u.provider}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-500 font-semibold">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right text-zinc-500 font-semibold">
                        {new Date(u.lastLogin).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Logs (Recent Logins history) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-850 pb-3 flex justify-between items-center">
            <h4 className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Login Security Audit Log</span>
            </h4>
          </div>

          <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-1 custom-scrollbar-thin">
            {recentLogins.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs italic">
                No session log history recorded.
              </div>
            ) : (
              recentLogins.map((log: any) => (
                <div key={log.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-850 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{log.userName}</span>
                      <span className="text-[9px] font-bold uppercase text-brand-primary block mt-0.5">{log.action}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9.5px] text-zinc-500 font-semibold border-t border-zinc-150/50 dark:border-zinc-850/50 pt-2">
                    <div className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                      <span>IP: {log.ipAddress}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-zinc-400" />
                      <span className="truncate">Browser: {log.browser} ({log.device})</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
