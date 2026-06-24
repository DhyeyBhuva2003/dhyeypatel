import React from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

interface DataGridPaginationProps {
  page: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const DataGridPagination: React.FC<DataGridPaginationProps> = ({
  page,
  totalPages,
  totalRecords,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const startIdx = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, totalRecords);

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-6 border-t border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 select-none text-zinc-550 dark:text-zinc-400">
      {/* Metrics Summary */}
      <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        Showing <span className="text-zinc-800 dark:text-zinc-200">{startIdx}</span>–
        <span className="text-zinc-800 dark:text-zinc-200">{endIdx}</span> of{" "}
        <span className="text-zinc-800 dark:text-zinc-200">{totalRecords}</span> Records
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Rows Per Page selector */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Page Size:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-bold text-zinc-700 dark:text-zinc-350 focus:outline-none cursor-pointer"
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrev}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition disabled:opacity-40 cursor-pointer flex items-center justify-center"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrev}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition disabled:opacity-40 cursor-pointer flex items-center justify-center"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page Display & Jump */}
          <div className="flex items-center gap-1.5 px-1.5">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Page</span>
            <input
              type="number"
              min={1}
              max={totalPages || 1}
              value={page}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 1 && val <= totalPages) {
                  onPageChange(val);
                }
              }}
              className="w-10 py-1 text-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-bold text-zinc-800 dark:text-white focus:outline-none"
            />
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">of {totalPages || 1}</span>
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition disabled:opacity-40 cursor-pointer flex items-center justify-center"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition disabled:opacity-40 cursor-pointer flex items-center justify-center"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataGridPagination;
