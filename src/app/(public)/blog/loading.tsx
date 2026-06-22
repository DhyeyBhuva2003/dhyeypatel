import React from "react";

export default function BlogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4 max-w-3xl">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-2/3"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-5/6"></div>
      </div>

      {/* Filter skeletons */}
      <div className="flex flex-wrap gap-2 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 bg-zinc-250 dark:bg-zinc-800 rounded-full w-24"></div>
        ))}
      </div>

      {/* Cards Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-850/50 space-y-6"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-12"></div>
              </div>
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-5/6"></div>
              <div className="space-y-2">
                <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex justify-between">
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div>
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
