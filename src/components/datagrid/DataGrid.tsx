import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import DataGridSkeleton from "./DataGridSkeleton";
import DataGridEmptyState from "./DataGridEmptyState";
import DataGridErrorState from "./DataGridErrorState";

export interface DataGridColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
  width?: string;
}

interface DataGridProps<T> {
  columns: DataGridColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  
  // Selection
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  getRowId?: (row: T) => string;

  // Sorting
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string, order: "asc" | "desc") => void;

  // Column Visibility
  visibleKeys?: string[];
}

export function DataGrid<T>({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage,
  selectedIds = [],
  onSelectionChange,
  getRowId = (row: any) => row._id || row.id,
  sortKey,
  sortOrder,
  onSort,
  visibleKeys,
}: DataGridProps<T>) {
  // Filter columns based on visibility picker
  const filteredColumns = visibleKeys
    ? columns.filter((col) => visibleKeys.includes(col.key))
    : columns;

  const handleToggleAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((row) => getRowId(row)));
    }
  };

  const handleToggleRow = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((rowId) => rowId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleSortClick = (key: string, sortable?: boolean) => {
    if (!sortable || !onSort) return;
    let nextOrder: "asc" | "desc" = "asc";
    if (sortKey === key && sortOrder === "asc") {
      nextOrder = "desc";
    }
    onSort(key, nextOrder);
  };

  if (error) {
    return <DataGridErrorState message={error} />;
  }

  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden select-none animate-fadeIn">
      <div className="overflow-x-auto custom-scrollbar-thin">
        <table className="w-full border-collapse text-left text-xs text-zinc-550 dark:text-zinc-400">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/50 font-bold uppercase tracking-wider select-none text-[10px] text-zinc-400">
              {/* Header Checkbox */}
              {onSelectionChange && (
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={handleToggleAll}
                    disabled={data.length === 0}
                    className="rounded border-zinc-350 dark:border-zinc-800 text-brand-primary focus:ring-primary-glow h-3.5 w-3.5 transition cursor-pointer"
                  />
                </th>
              )}

              {/* Data Columns */}
              {filteredColumns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSortClick(col.key, col.sortable)}
                    style={{ width: col.width }}
                    className={`px-6 py-4 font-bold ${
                      col.sortable ? "cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200" : ""
                    } ${col.className || ""}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {col.sortable && onSort && (
                        <span className="text-zinc-400">
                          {isSorted ? (
                            sortOrder === "asc" ? (
                              <ArrowUp className="w-3 h-3 text-brand-primary" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-brand-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 hover:text-zinc-650" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850 text-zinc-700 dark:text-zinc-350">
            {loading ? (
              <DataGridSkeleton
                columnsCount={filteredColumns.length + (onSelectionChange ? 1 : 0)}
              />
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={filteredColumns.length + (onSelectionChange ? 1 : 0)}
                  className="py-12"
                >
                  <DataGridEmptyState message={emptyMessage} />
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const id = getRowId(row);
                const isSelected = selectedIds.includes(id);

                return (
                  <tr
                    key={id}
                    className={`hover:bg-zinc-50/40 dark:hover:bg-zinc-950/10 transition-colors ${
                      isSelected ? "bg-primary-glow/50 dark:bg-primary-glow/20" : ""
                    }`}
                  >
                    {/* Row Checkbox */}
                    {onSelectionChange && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(id)}
                          className="rounded border-zinc-350 dark:border-zinc-800 text-brand-primary focus:ring-primary-glow h-3.5 w-3.5 transition cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Data Cells */}
                    {filteredColumns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-6 py-4 font-semibold text-zinc-650 dark:text-zinc-300 ${col.className || ""}`}
                      >
                        {col.render ? (
                          col.render(row)
                        ) : (
                          <span>{(row as any)[col.key]?.toString() || "—"}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataGrid;
