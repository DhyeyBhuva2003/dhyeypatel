import React from "react";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Users,
  Folder,
  ConciergeBell,
  FileText,
  Inbox,
  Settings,
  Mail,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import UserAvatar from "@/components/admin/UserAvatar";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { name: "Overview", href: "/admin", icon: <BarChart3 className="w-4 h-4" /> },
  { name: "Users", href: "/admin/users", icon: <Users className="w-4 h-4" /> },
  { name: "Projects", href: "/admin/projects", icon: <Folder className="w-4 h-4" /> },
  { name: "Services", href: "/admin/services", icon: <ConciergeBell className="w-4 h-4" /> },
  { name: "Blogs", href: "/admin/blogs", icon: <FileText className="w-4 h-4" /> },
  { name: "Inquiries", href: "/admin/inquiries", icon: <Inbox className="w-4 h-4" /> },
  { name: "Email Platform", href: "/admin/emails", icon: <Mail className="w-4 h-4" /> },
  { name: "Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
];

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // 1. Session assertion
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col md:flex-row select-none">
      {/* 1. Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 flex flex-col justify-between shrink-0">
        <div className="p-6 space-y-8">
          {/* Header Portal Info */}
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-850">
            <UserAvatar
              name={admin.name}
              imageUrl={admin.profileImage?.secure_url}
              size="md"
            />
            <div className="leading-none">
              <h2 className="font-black text-zinc-900 dark:text-white text-sm tracking-tight">
                Admin Panel
              </h2>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1 block">
                {admin.name}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950 hover:text-brand-primary dark:hover:text-white transition"
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Logout & Theme Toggle */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Appearance</span>
            <ThemeToggle />
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* 2. Main Content Scroll Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}
