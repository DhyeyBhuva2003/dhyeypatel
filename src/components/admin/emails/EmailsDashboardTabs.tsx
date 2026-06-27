"use client";

import React, { useState } from "react";
import { BarChart3, Mail, Layout, Users, Play, Settings, Server, Shield } from "lucide-react";
import EmailsOverview from "./EmailsOverview";
import CampaignsManager from "./CampaignsManager";
import TemplatesManager from "./TemplatesManager";
import SubscribersManager from "./SubscribersManager";
import AutomationsManager from "./AutomationsManager";
import BrandSettingsManager from "./BrandSettingsManager";
import QueueManager from "./QueueManager";
import OAuthManagement from "./OAuthManagement";

const tabList = [
  { id: "overview", label: "Overview", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "campaigns", label: "Campaigns", icon: <Mail className="w-3.5 h-3.5" /> },
  { id: "templates", label: "Templates CMS", icon: <Layout className="w-3.5 h-3.5" /> },
  { id: "subscribers", label: "Subscribers", icon: <Users className="w-3.5 h-3.5" /> },
  { id: "automations", label: "Automations", icon: <Play className="w-3.5 h-3.5" /> },
  { id: "oauth", label: "OAuth & CRM", icon: <Shield className="w-3.5 h-3.5" /> },
  { id: "queue", label: "Redis Queue", icon: <Server className="w-3.5 h-3.5" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-3.5 h-3.5" /> },
];

export default function EmailsDashboardTabs() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Tabs Menu List */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-850 overflow-x-auto custom-scrollbar-thin gap-1 shrink-0">
        {tabList.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition cursor-pointer whitespace-nowrap ${
                active
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[50vh]">
        {activeTab === "overview" && <EmailsOverview />}
        {activeTab === "campaigns" && <CampaignsManager />}
        {activeTab === "templates" && <TemplatesManager />}
        {activeTab === "subscribers" && <SubscribersManager />}
        {activeTab === "automations" && <AutomationsManager />}
        {activeTab === "oauth" && <OAuthManagement />}
        {activeTab === "queue" && <QueueManager />}
        {activeTab === "settings" && <BrandSettingsManager />}
      </div>
    </div>
  );
}
