"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ServerCrash, AlertOctagon, RotateCcw, Home, ChevronDown, Terminal } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  useEffect(() => {
    // Optionally log error metrics to external log pipelines
    console.error("Application boundary caught crash:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] px-6 select-none bg-bg-main animate-fadeIn">
      {/* Visual Header Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/15 rounded-full blur-3xl w-48 h-48 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 pointer-events-none" />
        <div className="w-24 h-24 rounded-full bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-center justify-center shadow-lg shadow-red-500/5 animate-pulse">
          <ServerCrash className="w-10 h-10 text-red-500" />
        </div>
      </div>

      {/* Main Text pitch */}
      <div className="text-center max-w-md space-y-3.5">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">
          Application Exception
        </h1>
        <p className="text-xs font-semibold text-text-sub leading-relaxed max-w-sm mx-auto">
          An unexpected system crash or API error interrupted the client execution pipeline.
        </p>
      </div>

      {/* Interactive Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full max-w-sm">
        <button
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-lg shadow-brand-primary/15 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Re-rendering</span>
        </button>
        
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-350 text-xs font-bold transition cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>

      {/* Diagnostic Details Accordion */}
      <div className="w-full max-w-md mt-10 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 overflow-hidden transition-all duration-200">
        <button
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full px-5 py-4 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 transition cursor-pointer select-none"
        >
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-brand-primary" />
            <span>Diagnostic Logs</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 transition duration-200 ${
              isAccordionOpen ? "transform rotate-180 text-brand-primary" : ""
            }`}
          />
        </button>

        {isAccordionOpen && (
          <div className="px-5 pb-5 pt-1 border-t border-zinc-150 dark:border-zinc-850 select-text animate-slideDown">
            <div className="space-y-4">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                Technical Exception Report
              </p>
              
              <div className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850/50 bg-zinc-50/80 dark:bg-zinc-900/60 font-mono text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300 break-words whitespace-pre-wrap overflow-auto max-h-48 scrollbar-thin">
                {error.message || "Unknown error payload trace."}
              </div>

              {error.digest && (
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold">
                  <AlertOctagon className="w-3.5 h-3.5 text-zinc-350 dark:text-zinc-650" />
                  <span>Digest ID:</span>
                  <span className="font-mono text-zinc-500 select-all">{error.digest}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
