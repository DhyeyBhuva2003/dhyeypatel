"use client";

import React, { useState, Suspense } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import FormInput from "@/components/forms/FormInput";
import FormPasswordInput from "@/components/forms/FormPasswordInput";
import { toast, Toaster } from "sonner";

const resetPasswordFormSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const methods = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Password reset token is missing or invalid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setIsComplete(true);
        toast.success("Password reset completed successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(resData.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network communication error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-2xl text-center space-y-4">
        <h2 className="text-xl font-black text-red-650 dark:text-red-400">Invalid Recovery Attempt</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
          The password reset token is missing or has expired. Please initiate a new recovery request.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block py-2.5 px-4 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-primary-hover transition"
        >
          Request Reset Link
        </Link>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-2xl text-center space-y-4 animate-scaleUp">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900/30">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-zinc-900 dark:text-white">Credentials Updated</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
          Your new account password has been successfully written. Redirecting you to login screen...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-2xl space-y-6 animate-scaleUp">
      {/* Header */}
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="inline-block text-xl font-black tracking-tight text-zinc-900 dark:text-white"
        >
          Dhyey<span className="text-brand-primary">Bhuva</span>
        </Link>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Reset Password
        </h1>
        <p className="text-xs text-zinc-450 dark:text-zinc-400 font-semibold leading-relaxed">
          Define your new password credentials below to re-establish administrative console access.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <FormPasswordInput
            name="password"
            label="New Password"
            placeholder="••••••••"
            disabled={isSubmitting}
            showStrength={true}
          />

          {/* Confirm Password */}
          <FormInput
            name="confirmPassword"
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            disabled={isSubmitting}
            icon={<Lock className="w-3.5 h-3.5" />}
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
                <span>Writing Credentials...</span>
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </FormProvider>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-6 relative select-none">
      <Toaster position="top-right" richColors />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-brand-accent/5 -z-10"></div>
      
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-2xl flex flex-col items-center justify-center py-20 gap-3 animate-pulse">
            <Loader2 className="w-8 h-8 rounded-full text-brand-primary animate-spin" />
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Syncing recovery token...</span>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
