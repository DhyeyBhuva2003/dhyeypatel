import React from "react";
import { ServiceListSkeleton } from "@/components/ui/Skeletons";

export default function ServicesLoading() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 space-y-16 bg-bg-main">
      {/* Header Skeleton */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-3/4 mx-auto animate-pulse" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-5/6 mx-auto animate-pulse" />
      </section>

      <ServiceListSkeleton />
    </div>
  );
}
