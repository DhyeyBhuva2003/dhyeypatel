import React, { useState } from "react";
import { Edit2, Trash2, Eye, MoreHorizontal } from "lucide-react";

interface RowActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "danger" | "normal";
}

interface DataGridRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  extraActions?: RowActionItem[];
}

export const DataGridRowActions: React.FC<DataGridRowActionsProps> = ({
  onView,
  onEdit,
  onDelete,
  extraActions = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1.5 select-none">
      {/* Quick View Button */}
      {onView && (
        <button
          type="button"
          onClick={onView}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          title="View Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Quick Edit Button */}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="p-2 rounded-xl text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition cursor-pointer"
          title="Edit Item"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Quick Delete Button */}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-xl text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
          title="Delete Item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Extra Actions Dropdown */}
      {extraActions.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="More Actions"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {isOpen && (
            <>
              {/* Closing Overlay */}
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

              <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-lg p-2 space-y-0.5 z-20 animate-scaleUp">
                {extraActions.map((act) => (
                  <button
                    key={act.label}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      act.onClick();
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-950 transition cursor-pointer ${
                      act.variant === "danger"
                        ? "text-red-650 dark:text-red-400"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {act.icon && <span className="text-zinc-400 w-3 h-3 flex items-center justify-center">{act.icon}</span>}
                    <span>{act.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DataGridRowActions;
