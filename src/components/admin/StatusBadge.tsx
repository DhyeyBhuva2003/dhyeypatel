import React from "react";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;
  const norm = status.toUpperCase();

  const colorMap: Record<string, string> = {
    // Roles
    ADMIN: "bg-purple-150 text-purple-750 border-purple-250 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/30",
    USER: "bg-blue-150 text-blue-750 border-blue-250 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
    // User Statuses
    ACTIVE: "bg-emerald-150 text-emerald-755 border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-450 dark:border-emerald-900/30",
    INACTIVE: "bg-rose-150 text-rose-750 border-rose-250 dark:bg-rose-950/40 dark:text-rose-450 dark:border-rose-900/30",
    PENDING: "bg-amber-150 text-amber-750 border-amber-250 dark:bg-amber-950/40 dark:text-amber-450 dark:border-amber-900/30",
    // Lead Inbox Statuses
    CONTACTED: "bg-sky-150 text-sky-750 border-sky-250 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/30",
    RESOLVED: "bg-green-150 text-green-750 border-green-250 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/30",
  };

  const styleClass =
    colorMap[norm] ||
    "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border uppercase select-none ${styleClass}`}
    >
      {status.toLowerCase()}
    </span>
  );
}
