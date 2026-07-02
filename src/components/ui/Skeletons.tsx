import React from "react";

// Shimmer utility overlay class
const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

// ─────────────────────────────────────────────────────────────────────────────
// Blog Skeletons
// ─────────────────────────────────────────────────────────────────────────────
export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-card-main border border-border-main min-h-[380px] shadow-sm animate-pulse">
      {/* Cover Image Placeholder */}
      <div className="relative aspect-video w-full bg-zinc-200 dark:bg-zinc-800 border-b border-border-main" />
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="h-6 w-3/4 bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="flex gap-1.5 pt-1.5">
            <div className="h-4 w-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
        <div className="pt-5 mt-6 border-t border-border-main flex items-center justify-between">
          <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}

export function BlogListSkeleton() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, idx) => (
          <BlogCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

export function BlogDetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 space-y-12 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
      
      {/* Breadcrumb skeleton */}
      <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />

      {/* Header skeleton */}
      <div className="space-y-6">
        <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-10 w-5/6 bg-zinc-300 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="border-y border-border-main py-4 flex justify-between">
          <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-6 sm:p-8 md:p-12 rounded-3xl border border-border-main bg-card-main space-y-4">
        <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-11/12 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-10/12 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Skeletons
// ─────────────────────────────────────────────────────────────────────────────
export function PortfolioCardSkeleton() {
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-card-main border border-border-main min-h-[350px] shadow-sm animate-pulse">
      <div className="relative aspect-video w-full bg-zinc-200 dark:bg-zinc-800 border-b border-border-main" />
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="h-6 w-2/3 bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="flex gap-1.5 pt-1">
            <div className="h-4 w-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
        <div className="pt-4 mt-4 border-t border-border-main flex justify-between items-center">
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}

export function PortfolioListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, idx) => (
        <PortfolioCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function PortfolioDetailsSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 space-y-12 animate-pulse">
      {/* Top Nav */}
      <div className="space-y-4">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>

      {/* Hero section */}
      <div className="border border-border-main p-8 rounded-3xl bg-bg-sub flex flex-col lg:flex-row gap-10 justify-between">
        <div className="space-y-6 flex-1 max-w-xl">
          <div className="flex gap-2">
            <div className="h-4 w-14 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-14 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="h-10 w-4/5 bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-28 bg-zinc-300 dark:bg-zinc-700 rounded-xl" />
            <div className="h-10 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          </div>
        </div>
        <div className="aspect-video w-full lg:w-[420px] bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Skeletons
// ─────────────────────────────────────────────────────────────────────────────
export function ServiceCardSkeleton() {
  return (
    <div className="p-8 rounded-2xl bg-card-main border border-border-main flex flex-col justify-between min-h-[480px] shadow-sm animate-pulse">
      <div className="space-y-6">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-2">
          {/* Title */}
          <div className="h-6 w-2/3 bg-zinc-300 dark:bg-zinc-700 rounded" />
          {/* Desc */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
        {/* Features */}
        <div className="space-y-3 border-t border-border-main pt-5">
          <div className="h-3 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="pt-8 mt-8 border-t border-border-main flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-2 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-5 w-20 bg-zinc-300 dark:bg-zinc-700 rounded" />
        </div>
        <div className="h-8 w-24 bg-zinc-300 dark:bg-zinc-700 rounded-xl" />
      </div>
    </div>
  );
}

export function ServiceListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, idx) => (
        <ServiceCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function ServiceDetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 space-y-12 animate-pulse">
      <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
      <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
      
      <div className="p-8 sm:p-12 rounded-3xl border border-border-main bg-card-main flex flex-col md:flex-row gap-10 justify-between items-start">
        <div className="space-y-6 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-1/2 bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3.5 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
        <div className="w-full md:w-64 p-6 bg-bg-sub border border-border-main rounded-2xl space-y-4">
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-6 w-32 bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="h-10 w-full bg-zinc-300 dark:bg-zinc-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
