import React from "react";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import EmailsDashboardTabs from "@/components/admin/emails/EmailsDashboardTabs";

export const dynamic = "force-dynamic";

export default async function AdminEmailsPage() {
  // 1. Session assertion
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          Email Management Platform
        </h1>
        <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-550 mt-1">
          Design visual templates, schedule marketing campaigns, import contacts, and track background dispatches.
        </p>
      </div>

      {/* Render the tabs interface */}
      <EmailsDashboardTabs />
    </div>
  );
}
