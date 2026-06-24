import React from "react";
import { Inbox } from "lucide-react";

interface DataGridEmptyStateProps {
  message?: string;
}

export const DataGridEmptyState: React.FC<DataGridEmptyStateProps> = ({
  message = "No records matched your filters.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none animate-fadeIn">
      <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center border border-zinc-150 dark:border-zinc-800 text-zinc-400 mb-3">
        <Inbox className="w-5 h-5 text-zinc-400" />
      </div>
      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
        No Results Found
      </p>
      <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-semibold mt-1 max-w-[280px]">
        {message}
      </p>
    </div>
  );
};

export default DataGridEmptyState;
