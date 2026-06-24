import React from "react";
import { Search, X } from "lucide-react";

interface FormSearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onClear?: () => void;
}

export const FormSearchInput: React.FC<FormSearchInputProps> = ({
  value,
  onClear,
  className = "",
  placeholder = "Search...",
  ...props
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-450 dark:text-zinc-500 w-4 h-4 flex items-center justify-center pointer-events-none">
        <Search className="w-3.5 h-3.5" />
      </div>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className={`w-full py-2 px-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-primary-glow transition duration-150 ${className}`}
        {...props}
      />

      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-900 transition cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default FormSearchInput;
