import React from "react";
import FormSearchInput from "../forms/FormSearchInput";
import DataGridColumnManager from "./DataGridColumnManager";
import DataGridExport from "./DataGridExport";
import { DataGridColumn } from "./DataGrid";

interface DataGridToolbarProps<T> {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;

  // Columns & Visibility
  columns: DataGridColumn<T>[];
  visibleKeys: string[];
  onVisibleKeysChange: (keys: string[]) => void;

  // Dataset for export
  data: T[];
  exportFilename?: string;

  // Custom filters dropdown slot
  children?: React.ReactNode;

  // Action button CTA slot (e.g. Create User)
  actionButton?: React.ReactNode;
}

export function DataGridToolbar<T>({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search records...",
  columns,
  visibleKeys,
  onVisibleKeysChange,
  data,
  exportFilename = "dataset_export",
  children,
  actionButton,
}: DataGridToolbarProps<T>) {
  return (
    <div className="flex flex-col gap-4 select-none">
      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm">
        {/* Search */}
        <div className="w-full md:max-w-xs shrink-0">
          <FormSearchInput
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange("")}
            placeholder={searchPlaceholder}
          />
        </div>

        {/* Dynamic Filters dropdown slot */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
          {children}

          {/* Columns Visibility */}
          <DataGridColumnManager
            columns={columns}
            visibleKeys={visibleKeys}
            onVisibleKeysChange={onVisibleKeysChange}
          />

          {/* CSV Export */}
          <DataGridExport
            columns={columns}
            data={data}
            filename={exportFilename}
          />

          {/* Action button */}
          {actionButton && <div className="shrink-0">{actionButton}</div>}
        </div>
      </div>
    </div>
  );
}

export default DataGridToolbar;
