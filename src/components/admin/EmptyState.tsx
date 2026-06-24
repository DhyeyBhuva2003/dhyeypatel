import React from "react";
import { FaInbox } from "react-icons/fa";

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  message = "No records found.",
  icon = <FaInbox className="w-8 h-8 text-zinc-450 dark:text-zinc-500" />,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 select-none">
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-850 shrink-0 shadow-inner">
        {icon}
      </div>
      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
        {message}
      </p>
    </div>
  );
}
