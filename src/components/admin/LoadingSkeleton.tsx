import React from "react";

interface LoadingSkeletonProps {
  type?: "table" | "card" | "line";
  rows?: number;
  className?: string;
}

export default function LoadingSkeleton({
  type = "line",
  rows = 3,
  className = "",
}: LoadingSkeletonProps) {
  if (type === "table") {
    return (
      <div className={`space-y-4 w-full ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 py-3.5 border-b border-zinc-100 dark:border-zinc-850 last:border-b-0 animate-pulse"
          >
            <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
              <div className="h-2.5 bg-zinc-150 dark:bg-zinc-850 rounded w-1/4" />
            </div>
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-16" />
            <div className="h-8 bg-zinc-150 dark:bg-zinc-850 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "card") {
    return (
      <div
        className={`p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm animate-pulse space-y-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="h-3.5 bg-zinc-250 dark:bg-zinc-800 rounded w-1/4" />
          <div className="w-9 h-9 bg-zinc-150 dark:bg-zinc-850 rounded-xl" />
        </div>
        <div className="h-8 bg-zinc-250 dark:bg-zinc-800 rounded w-1/2" />
        <div className="h-3 bg-zinc-150 dark:bg-zinc-850 rounded w-1/3" />
      </div>
    );
  }

  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded"
          style={{ width: `${100 - i * 8}%` }}
        />
      ))}
    </div>
  );
}
