import React, { useState } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { DataGridColumn } from "./DataGrid";

interface DataGridColumnManagerProps<T> {
  columns: DataGridColumn<T>[];
  visibleKeys: string[];
  onVisibleKeysChange: (keys: string[]) => void;
}

export function DataGridColumnManager<T>({
  columns,
  visibleKeys,
  onVisibleKeysChange,
}: DataGridColumnManagerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleColumn = (key: string) => {
    if (visibleKeys.includes(key)) {
      // Don't let users turn off all columns (keep at least one)
      if (visibleKeys.length > 1) {
        onVisibleKeysChange(visibleKeys.filter((k) => k !== key));
      }
    } else {
      onVisibleKeysChange([...visibleKeys, key]);
    }
  };

  return (
    <div className="relative select-none">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-350 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Columns</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay to close */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-lg p-2.5 space-y-1 z-20 animate-scaleUp">
            <span className="block text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-550 px-2 pb-1.5 border-b border-zinc-100 dark:border-zinc-850">
              Toggle Columns
            </span>

            <div className="max-h-56 overflow-y-auto pt-1 space-y-0.5 custom-scrollbar-thin">
              {columns.map((col) => {
                // Skip placeholder checkbox and actions key
                if (col.key === "checkbox" || col.key === "actions") return null;

                const isVisible = visibleKeys.includes(col.key);

                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => handleToggleColumn(col.key)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition cursor-pointer"
                  >
                    <span>{col.label}</span>
                    {isVisible && <Check className="w-3.5 h-3.5 text-brand-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DataGridColumnManager;
