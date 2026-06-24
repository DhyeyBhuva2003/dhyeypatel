"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl bg-zinc-150 dark:bg-zinc-800/40 animate-pulse" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition duration-150 cursor-pointer focus:outline-none flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-500 transition-all duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500 transition-all duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
