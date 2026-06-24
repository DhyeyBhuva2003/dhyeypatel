import React from "react";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // 1. Authenticate Admin (Server Component)
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Admin Settings
        </h1>
        <p className="text-sm text-zinc-500">
          Update account details and reset credentials.
        </p>
      </div>

      {/* 2. Render Settings Client Form */}
      <SettingsForm
        admin={{
          name: admin.name,
          email: admin.email,
          profileImage: admin.profileImage,
        }}
      />
    </div>
  );
}
