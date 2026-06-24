import React from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

export default function FilterDropdown({
  label,
  value,
  onChange,
  options,
  className = "",
}: FilterDropdownProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span className="text-[10px] uppercase font-extrabold text-zinc-450 dark:text-zinc-500 tracking-wide select-none">
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 transition cursor-pointer select-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
