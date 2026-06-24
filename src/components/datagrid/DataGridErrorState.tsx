import React from "react";
import { AlertCircle } from "lucide-react";

interface DataGridErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const DataGridErrorState: React.FC<DataGridErrorStateProps> = ({
  message = "An error occurred while fetching the dataset.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center select-none animate-fadeIn border border-dashed border-red-250 dark:border-red-950/40 rounded-2xl bg-red-50/10">
      <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center border border-red-100 dark:border-red-900/30 text-red-500 mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <p className="text-xs font-bold text-red-650 dark:text-red-400">
        System Fetch Exception
      </p>
      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold mt-1 max-w-[340px]">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-750 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default DataGridErrorState;
