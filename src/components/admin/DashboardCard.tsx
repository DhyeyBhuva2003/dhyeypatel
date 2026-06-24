import React from "react";

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string; // e.g. bg-blue-500/10 text-blue-600
  growth?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export default function DashboardCard({
  label,
  value,
  icon,
  color = "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  growth,
  description,
}: DashboardCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-450 font-bold uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          {value}
        </div>

        {(growth || description) && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium leading-none">
            {growth && (
              <span
                className={`font-extrabold ${
                  growth.isPositive
                    ? "text-emerald-600 dark:text-emerald-450"
                    : "text-rose-600 dark:text-rose-455"
                }`}
              >
                {growth.isPositive ? "↑" : "↓"} {growth.value}%
              </span>
            )}
            {description && <span className="text-zinc-400">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
