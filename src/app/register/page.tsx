"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Mail, User, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import FormInput from "@/components/forms/FormInput";
import FormPasswordInput from "@/components/forms/FormPasswordInput";

const registerFormSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().min(1, "Email is required").email("Invalid email address").toLowerCase().trim(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        toast.success(resData.message || "Registration complete!");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        toast.error(resData.message || "Registration failed.");
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
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block text-xl font-black tracking-tight text-zinc-900 dark:text-white"
          >
            Dhyey<span className="text-brand-primary">Bhuva</span>
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Register Account
          </h1>
          <p className="text-xs text-zinc-450 dark:text-zinc-400 font-semibold leading-relaxed">
            Create your system credentials to access management panels.
          </p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormInput
              name="name"
              label="Full Name"
              placeholder="John Doe"
              disabled={isSubmitting}
              icon={<User className="w-3.5 h-3.5" />}
            />

            {/* Email */}
            <FormInput
              name="email"
              label="Email Address"
              placeholder="john.doe@example.com"
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

            {/* Confirm Password */}
            <FormInput
              name="confirmPassword"
              type="password"
              label="Confirm Password"
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
                  <span>Registering...</span>
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>
        </FormProvider>

        {/* Auxiliary Footer links */}
        <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-850 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
          <Link href="/login" className="hover:text-brand-primary">
            Sign In Instead
          </Link>
          <Link href="/" className="hover:text-brand-primary">
            Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}
