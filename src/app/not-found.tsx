"use client";

import React from "react";
import Link from "next/link";
import { Compass, ArrowRight, Home, FolderKanban, Mail } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-6 select-none bg-bg-main animate-fadeIn">
      {/* Visual Icon Illustration */}
      <div className="relative mb-8">
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-full blur-3xl w-48 h-48 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 pointer-events-none" />
        
        {/* Compass Orbit */}
        <div className="w-36 h-36 rounded-full border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center animate-[spin_60s_linear_infinite]">
          <div className="w-28 h-28 rounded-full border border-zinc-150 dark:border-zinc-850 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-center">
              <Compass className="w-9 h-9 text-brand-primary animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Absolute 404 Badge */}
        <span className="absolute -bottom-2 right-2 px-3 py-1.5 rounded-full border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md text-[10px] font-black text-brand-primary uppercase tracking-widest">
          Error 404
        </span>
      </div>

      {/* Main Pitch Details */}
      <div className="text-center max-w-md space-y-4">
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">
          Lost in Space?
        </h1>
        <p className="text-xs font-semibold text-text-sub leading-relaxed max-w-sm mx-auto">
          The page you are looking for doesn't exist, has been moved, or resides in a sandbox region.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-10 w-full max-w-sm">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-lg shadow-brand-primary/15 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        
        <Link
          href="/portfolio"
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-350 text-xs font-bold transition cursor-pointer"
        >
          <FolderKanban className="w-4 h-4" />
          <span>Explore Works</span>
        </Link>
      </div>

      {/* Minor footer query */}
      <div className="mt-12 text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider flex items-center gap-1.5">
        <Mail className="w-3.5 h-3.5" />
        <span>Need assistance?</span>
        <Link href="/contact" className="text-brand-primary hover:underline flex items-center gap-0.5">
          <span>Get in touch</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
