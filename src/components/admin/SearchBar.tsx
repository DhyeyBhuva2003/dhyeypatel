import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  delay = 400,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync state if initial value changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the text change input callback
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, delay, onChange]);

  return (
    <div className="relative w-full sm:max-w-xs shrink-0">
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-450 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 transition"
      />
      <FaSearch className="absolute left-3.5 top-3.5 text-zinc-450 dark:text-zinc-500 w-3 h-3" />
    </div>
  );
}
