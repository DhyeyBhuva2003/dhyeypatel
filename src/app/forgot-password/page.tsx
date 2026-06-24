"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import FormInput from "@/components/forms/FormInput";
import { toast, Toaster } from "sonner";

const forgotPasswordFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address").toLowerCase().trim(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  const methods = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(false);
    setIsSubmitting(true);
    setDevLink(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success("Recovery link processed successfully!");
        if (resData.developmentLink) {
          setDevLink(resData.developmentLink);
        }
      } else {
        toast.error(resData.message || "Failed to process request.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network communication error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-6 relative select-none">
      <Toaster position="top-right" richColors />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-brand-accent/5 -z-10"></div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-2xl space-y-6 animate-scaleUp">
        {/* Header */}
        <div className="space-y-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 uppercase tracking-wide transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight pt-2">
            Recover Password
          </h1>
          <p className="text-xs text-zinc-450 dark:text-zinc-400 font-semibold leading-relaxed">
            Enter your registered email address below, and we will compile a recovery token to restore access.
          </p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <FormInput
              name="email"
              label="Account Email"
              placeholder="admin@dhyeybhuva.com"
              disabled={isSubmitting}
              icon={<Mail className="w-3.5 h-3.5" />}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 mt-2 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-primary-hover disabled:bg-indigo-400 transition shadow-md shadow-brand-primary/10 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </button>
          </form>
        </FormProvider>

        {/* Development sandbox helper */}
        {devLink && (
          <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 space-y-2 text-xs leading-normal animate-fadeIn">
            <div className="flex items-center gap-1.5 text-brand-primary font-bold text-[10px] uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              <span>Sandbox Recovery Mode</span>
            </div>
            <p className="text-[10px] text-zinc-650 dark:text-zinc-400 font-semibold">
              Because email delivery is simulated in development environments, click the link below to restore your password:
            </p>
            <Link
              href={devLink}
              className="block py-2 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-brand-primary font-bold text-[10px] uppercase text-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
            >
              Reset Password Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
