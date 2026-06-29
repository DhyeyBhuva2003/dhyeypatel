"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCookieConsent, setCookieConsent } from "@/lib/analytics";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check consent state on mount
    const consent = getCookieConsent();
    if (consent === null) {
      // Small delay for premium entry animation feel
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setCookieConsent("accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    setCookieConsent("declined");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md p-5 shadow-2xl shadow-black/10 dark:shadow-black/30 glow-line-top"
        >
          {/* Subtle inside gradient background */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5 pointer-events-none -z-10" />

          <div className="space-y-4">
            <div className="space-y-1.5">
              <h4 className="text-sm font-extrabold text-text-main tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                Cookie Consent
              </h4>
              <p className="text-xs text-text-sub leading-relaxed font-medium">
                We use cookies to analyze web traffic, optimize site performance, and improve your overall browsing experience.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1.5">
              <button
                onClick={handleDecline}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-text-sub hover:text-text-main bg-zinc-100/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/30 transition duration-200 cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/95 hover:scale-[1.02] active:scale-[0.98] transition duration-200 shadow-md shadow-brand-primary/10 cursor-pointer"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
