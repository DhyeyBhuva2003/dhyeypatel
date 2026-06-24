import React from "react";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  FaChartLine,
  FaFolder,
  FaConciergeBell,
  FaPenSquare,
  FaInbox,
  FaCog,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";
import LogoutButton from "@/components/LogoutButton";
import UserAvatar from "@/components/admin/UserAvatar";

export const dynamic = "force-dynamic";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { name: "Overview", href: "/admin", icon: <FaChartLine /> },
  { name: "Users", href: "/admin/users", icon: <FaUsers /> },
  { name: "Projects", href: "/admin/projects", icon: <FaFolder /> },
  { name: "Services", href: "/admin/services", icon: <FaConciergeBell /> },
  { name: "Blogs", href: "/admin/blogs", icon: <FaPenSquare /> },
  { name: "Inquiries", href: "/admin/inquiries", icon: <FaInbox /> },
  { name: "Settings", href: "/admin/settings", icon: <FaCog /> },
];

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // 1. Session assertion
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-55/20 dark:bg-black flex flex-col md:flex-row">
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
            <div>
              <h2 className="font-extrabold text-zinc-900 dark:text-white text-sm tracking-tight leading-none">
                Admin Panel
              </h2>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950 hover:text-purple-650 dark:hover:text-purple-400 transition"
              >
                <span className="text-sm shrink-0">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Logout Button */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30">
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
