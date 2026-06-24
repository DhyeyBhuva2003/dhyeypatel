"use client";

import React, { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "sonner";
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

interface LoginInputs {
  email: string;
  password: string;
}

// Subcomponent that uses useSearchParams()
function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Retrieve previous redirect path or default to admin
  const redirectPath = searchParams.get("from") || "/admin";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>();

  const onSubmit = async (data: LoginInputs) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success("Successfully authenticated!");
        setTimeout(() => {
          router.replace(redirectPath);
          router.refresh();
        }, 800);
      } else {
        toast.error(resData.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login submission error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength logic
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-transparent", barCount: 0 };
    let score = 0;
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score, label: "Too Weak", color: "bg-red-500", barCount: 1 };
    if (score === 2) return { score, label: "Weak", color: "bg-orange-500", barCount: 2 };
    if (score === 3) return { score, label: "Medium", color: "bg-amber-500", barCount: 3 };
    return { score, label: "Strong", color: "bg-emerald-500", barCount: 4 };
  };

  const strength = getPasswordStrength(passwordValue);

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="inline-block text-xl font-bold tracking-tight text-zinc-900 dark:text-white"
        >
          Dhyey<span className="text-purple-650">Bhuva</span>
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Admin Dashboard Access
        </h1>
        <p className="text-xs text-zinc-550 dark:text-zinc-400">
          Sign in with your administrative credentials to manage portfolio assets.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500">Email Address</label>
          <div className="relative">
            <input
              type="email"
              disabled={isSubmitting}
              placeholder="admin@dhyeybhuva.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 transition ${
                errors.email ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
              }`}
            />
            <FaEnvelope className="absolute left-3.5 top-3.5 text-zinc-450 dark:text-zinc-500 w-3.5 h-3.5" />
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              disabled={isSubmitting}
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
                onChange: (e) => setPasswordValue(e.target.value),
              })}
              className={`w-full pl-10 pr-12 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-650 transition ${
                errors.password ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
              }`}
            />
            <FaLock className="absolute left-3.5 top-3.5 text-zinc-450 dark:text-zinc-500 w-3.5 h-3.5" />
            
            {/* Eye toggle */}
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-zinc-450 hover:text-zinc-700 dark:hover:text-zinc-350 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.password.message}</p>
          )}

          {/* Password Strength Indicator */}
          {passwordValue && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-zinc-400">Password Strength:</span>
                <span style={{ color: strength.color.replace("bg-", "") }} className="text-zinc-500 dark:text-zinc-300">
                  {strength.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-full rounded-full transition-colors duration-300 ${
                      i <= strength.barCount ? strength.color : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 transition shadow-md shadow-purple-600/10 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              <span>Authenticating...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <Link
          href="/"
          className="text-[10px] font-semibold text-zinc-400 hover:text-purple-600 dark:hover:text-purple-450 uppercase tracking-wide"
        >
          Back to Public Website
        </Link>
      </div>
    </div>
  );
}

// Root page component wrapped in Suspense boundary
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-6 relative">
      <Toaster position="top-right" richColors />
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-indigo-500/5 -z-10"></div>
      
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-2xl flex flex-col items-center justify-center py-20 gap-3">
            <span className="w-8 h-8 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></span>
            <span className="text-xs text-zinc-400">Loading auth screen...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
