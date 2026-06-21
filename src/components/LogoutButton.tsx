"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";
import { toast } from "sonner";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Successfully logged out.");
        setTimeout(() => {
          router.replace("/login");
          router.refresh();
        }, 500);
      } else {
        toast.error("Failed to terminate session.");
      }
    } catch (err) {
      console.error("Logout trigger error:", err);
      toast.error("Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-red-500/10 hover:text-red-650 hover:border-red-500/25 transition disabled:opacity-50"
    >
      <FaSignOutAlt className="shrink-0" />
      <span>{loading ? "Logging Out..." : "Sign Out"}</span>
    </button>
  );
}
