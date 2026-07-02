import React from "react";
import { PortfolioListSkeleton } from "@/components/ui/Skeletons";

export default function PortfolioLoading() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 space-y-12 bg-bg-main">
      {/* Header Skeleton */}
      <section className="space-y-4 max-w-3xl">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-1/2 animate-pulse" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full animate-pulse" />
      </section>

      {/* Filter skeletons */}
      <div className="flex flex-wrap gap-2 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-24 animate-pulse" />
        ))}
      </div>

      <PortfolioListSkeleton />
    </div>
  );
}
