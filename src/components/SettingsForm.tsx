"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

interface SettingsFormProps {
  admin: {
    name: string;
    email: string;
  };
}

interface SettingsInputs {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}

export default function SettingsForm({ admin }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsInputs>({
    defaultValues: {
      name: admin.name,
      email: admin.email,
      currentPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (data: SettingsInputs) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        toast.success("Settings updated successfully!");
        // Reset password fields only, preserve new profile details
        reset({
          name: resData.data.user.name,
          email: resData.data.user.email,
          currentPassword: "",
          newPassword: "",
        });
      } else {
        toast.error(resData.message || "Failed to update settings.");
      }
    } catch (err) {
      console.error("Save settings error:", err);
      toast.error("Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm max-w-2xl">
      <Toaster position="top-right" richColors />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-850 pb-3">
          Personal Profile Details
        </h3>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500">Full Name</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Dhyey Bhuva"
              {...register("name", { required: "Name is required" })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-650/10 focus:border-purple-650"
            />
            <FaUser className="absolute left-3.5 top-3.5 text-zinc-400 w-3.5 h-3.5" />
          </div>
          {errors.name && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500">Email Address</label>
          <div className="relative">
            <input
              type="email"
              placeholder="admin@dhyeybhuva.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email format",
                },
              })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-650/10 focus:border-purple-650"
            />
            <FaEnvelope className="absolute left-3.5 top-3.5 text-zinc-400 w-3.5 h-3.5" />
          </div>
          {errors.email && <p className="text-[10px] text-red-500">{errors.email.message}</p>}
        </div>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-850 pb-3 pt-4">
          Change Account Password
        </h3>

        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-550">Current Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              {...register("currentPassword")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-655/10 focus:border-purple-650"
            />
            <FaLock className="absolute left-3.5 top-3.5 text-zinc-400 w-3.5 h-3.5" />
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-555">New Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              {...register("newPassword", {
                validate: (val) => {
                  if (val && val.length < 6) {
                    return "New password must be at least 6 characters";
                  }
                  return true;
                },
              })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955 text-sm focus:outline-none focus:ring-2 focus:ring-purple-655/10 focus:border-purple-650"
            />
            <FaLock className="absolute left-3.5 top-3.5 text-zinc-400 w-3.5 h-3.5" />
          </div>
          {errors.newPassword && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              <span>Saving updates...</span>
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}
