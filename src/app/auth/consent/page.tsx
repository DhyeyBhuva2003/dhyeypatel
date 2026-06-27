"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Loader2, MailCheck, BellOff } from "lucide-react";
import Link from "next/link";

export default function ConsentPage() {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleConsent = async (consent: boolean) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/oauth/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (consent) {
          toast.success("Thank you! You are now subscribed to newsletter updates.");
        } else {
          toast.info("Subscription skipped.");
        }
        setTimeout(() => {
          router.replace("/");
          router.refresh();
        }, 1500);
      } else {
        toast.error(data.message || "Failed to update preference settings.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network communication error. Redirecting anyway...");
      setTimeout(() => {
        router.replace("/");
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-6 relative select-none">
      <Toaster position="top-right" richColors />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-brand-accent/5 -z-10"></div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-2xl space-y-6 animate-scaleUp text-center">
        {/* Header */}
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-block text-xl font-black tracking-tight text-zinc-900 dark:text-white"
          >
            Dhyey<span className="text-brand-primary">Bhuva</span>
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Stay in the Loop?
          </h1>
          <p className="text-xs text-zinc-450 dark:text-zinc-400 font-semibold leading-relaxed">
            Would you like to receive occasional newsletter updates, case studies, technology blogs, and service offers?
          </p>
        </div>

        {/* Buttons Section */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => handleConsent(true)}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MailCheck className="w-3.5 h-3.5" />
            )}
            <span>Yes, Subscribe Me</span>
          </button>

          <button
            onClick={() => handleConsent(false)}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-350 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <BellOff className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span>Skip for Now</span>
          </button>
        </div>

        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider pt-2">
          You can unsubscribe or update options at any time.
        </div>
      </div>
    </div>
  );
}
