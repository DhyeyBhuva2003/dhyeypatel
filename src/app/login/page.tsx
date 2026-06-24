"use client";

import React, { useState, Suspense } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import FormInput from "@/components/forms/FormInput";
import FormPasswordInput from "@/components/forms/FormPasswordInput";
import FormCheckbox from "@/components/forms/FormCheckbox";

const loginFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get("from") || "/admin";

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success("Welcome back! Authenticating session...");
        setTimeout(() => {
          router.replace(redirectPath);
          router.refresh();
        }, 800);
      } else {
        toast.error(resData.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network communication error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Admin Console Access
        </h1>
        <p className="text-xs text-zinc-450 dark:text-zinc-400 font-semibold leading-relaxed">
          Sign in with your administrative credentials to manage freelance services and portfolio assets.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormInput
            name="email"
            label="Email Address"
            placeholder="admin@dhyeybhuva.com"
            disabled={isSubmitting}
            icon={<Mail className="w-3.5 h-3.5" />}
          />

          {/* Password */}
          <FormPasswordInput
            name="password"
            label="Password"
            placeholder="••••••••"
            disabled={isSubmitting}
            showStrength={true}
          />

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <FormCheckbox name="rememberMe" label="Remember me" />
            <Link
              href="/forgot-password"
              className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wide"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-2 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-primary-hover disabled:bg-indigo-400 transition shadow-md shadow-brand-primary/10 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </FormProvider>

      {/* Auxiliary Footer links */}
      <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-850 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
        <Link href="/register" className="hover:text-brand-primary">
          Create Account
        </Link>
        <Link href="/" className="hover:text-brand-primary">
          Public Site
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-6 relative select-none">
      <Toaster position="top-right" richColors />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-brand-accent/5 -z-10"></div>
      
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-2xl flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 rounded-full text-brand-primary animate-spin" />
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Syncing credentials...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
