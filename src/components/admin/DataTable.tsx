import React from "react";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";

interface ColumnHeader {
  key: string;
  label: string;
  className?: string;
}

interface DataTableProps {
  headers: ColumnHeader[];
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  children: React.ReactNode;
}

export default function DataTable({
  headers,
  loading = false,
  empty = false,
  emptyMessage = "No records found.",
  pagination,
  children,
}: DataTableProps) {
  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-850 bg-white dark:bg-zinc-900 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/20 select-none">
              {headers.map((h) => (
                <th
                  key={h.key}
                  className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 ${
                    h.className || ""
                  }`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-8">
                  <LoadingSkeleton type="table" rows={4} />
                </td>
              </tr>
            ) : empty ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12">
                  <EmptyState message={emptyMessage} />
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
