import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 rounded-2xl shadow-sm select-none">
      <div className="text-xs text-zinc-500 font-semibold">
        Page <span className="font-bold text-zinc-950 dark:text-zinc-100">{currentPage}</span> of{" "}
        <span className="font-bold text-zinc-950 dark:text-zinc-100">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer text-zinc-600 dark:text-zinc-400 flex items-center justify-center"
          aria-label="Previous page"
        >
          <FaChevronLeft size={10} />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer text-zinc-600 dark:text-zinc-400 flex items-center justify-center"
          aria-label="Next page"
        >
          <FaChevronRight size={10} />
        </button>
      </div>
    </div>
  );
}
