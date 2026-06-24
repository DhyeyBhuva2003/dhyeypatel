import React from "react";

interface BulkActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "danger" | "primary" | "secondary";
}

interface DataGridBulkActionsProps {
  selectedCount: number;
  actions: BulkActionItem[];
}

export const DataGridBulkActions: React.FC<DataGridBulkActionsProps> = ({
  selectedCount,
  actions,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:ml-32 z-50 animate-fadeIn select-none">
      <div className="flex items-center gap-6 px-5 py-3 rounded-2xl bg-zinc-950/90 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-800 dark:border-zinc-700 shadow-2xl text-white">
        {/* Count Indicator */}
        <div className="flex flex-col leading-none">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Selection</span>
          <span className="text-xs font-black mt-1">
            {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {actions.map((act) => (
            <button
              key={act.label}
              type="button"
              onClick={act.onClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                act.variant === "danger"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : act.variant === "primary"
                  ? "bg-brand-primary hover:bg-primary-hover text-white"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              }`}
            >
              {act.icon && <span className="shrink-0">{act.icon}</span>}
              <span>{act.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataGridBulkActions;
