"use client";

import React, { useEffect, useState } from "react";
import { FaWifi, FaExclamationTriangle, FaRedo } from "react-icons/fa";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = "Failed to load requested data.",
  onRetry,
}: ErrorStateProps) {
  const [isOnline, setIsOnline] = useState(true);

  // Monitor network online/offline state
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto space-y-6">
      <div className="w-16 h-16 rounded-full bg-brand-error/5 flex items-center justify-center border border-brand-error/15 text-brand-error animate-bounce">
        {!isOnline ? (
          <FaWifi size={24} className="opacity-80" />
        ) : (
          <FaExclamationTriangle size={24} className="opacity-80" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-text-main">
          {!isOnline ? "You are offline" : "An error occurred"}
        </h3>
        <p className="text-sm text-text-sub leading-relaxed">
          {!isOnline
            ? "Please check your network connection and retry."
            : message}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition shadow-sm"
          >
            <FaRedo size={10} />
            Try Again
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-card-main border border-border-main text-text-main text-xs font-bold hover:bg-bg-sub transition shadow-sm"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
