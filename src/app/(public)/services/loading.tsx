import React from "react";

export default function ServicesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4 max-w-3xl mx-auto text-center">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-3/4 mx-auto"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-5/6 mx-auto"></div>
      </div>

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl border border-zinc-200/50 dark:border-zinc-850/50 space-y-6 h-[400px] flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-850"></div>
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-2/3"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full"></div>
              <div className="space-y-2 pt-2">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
              </div>
            </div>
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-850 flex justify-between items-center">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-24"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
