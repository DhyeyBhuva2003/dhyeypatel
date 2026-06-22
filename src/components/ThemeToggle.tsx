"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FaSun, FaMoon } from "react-icons/fa";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 animate-pulse" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2.5 rounded-xl border border-border-main hover:bg-bg-sub text-text-sub hover:text-text-main transition-all cursor-pointer focus:outline-none flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <FaSun className="w-4 h-4 text-brand-accent transition-all duration-300 hover:rotate-45" />
      ) : (
        <FaMoon className="w-4 h-4 text-brand-primary transition-all duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
