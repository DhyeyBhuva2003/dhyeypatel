"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { FaUser, FaEnvelope, FaLock, FaCloudUploadAlt, FaTrashAlt, FaSpinner } from "react-icons/fa";
import UserAvatar from "./admin/UserAvatar";

interface SettingsFormProps {
  admin: {
    name: string;
    email: string;
    profileImage?: {
      public_id: string;
      secure_url: string;
    };
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
  const [avatar, setAvatar] = useState<{ public_id: string; secure_url: string } | null>(
    admin.profileImage || null
  );
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const uploadFile = async (file: File) => {
    // 1. Client-Side Format Verification
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and WEBP formats are supported");
      return;
    }

    // 2. Client-Side File Size Verification (Max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("Avatar size exceeds maximum limit of 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "avatars");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setAvatar({
          public_id: resData.data.public_id,
          secure_url: resData.data.url,
        });
        toast.success("Profile avatar uploaded successfully!");
      } else {
        toast.error(resData.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      toast.error("Image compression or communication error.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    toast.success("Avatar staged for removal. Save changes to commit.");
  };

  const onSubmit = async (data: SettingsInputs) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, profileImage: avatar }),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        toast.success("Settings updated successfully!");
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
    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm max-w-2xl select-none">
      <Toaster position="top-right" richColors />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-850 pb-3">
          Profile Photo
        </h3>

        {/* Profile Avatar Uploader */}
        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
          <div className="relative group shrink-0">
            <UserAvatar name={admin.name} imageUrl={avatar?.secure_url} size="xl" />
            {uploading && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white">
                <FaSpinner className="animate-spin w-6 h-6" />
              </div>
            )}
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-2 ${
              dragActive
                ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/10"
                : "border-zinc-200 dark:border-zinc-800 hover:border-purple-500 hover:bg-zinc-50/30 dark:hover:bg-zinc-950/20"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <FaCloudUploadAlt size={24} className="text-zinc-400" />
            <div className="text-xs font-semibold text-zinc-500">
              Drag and drop your avatar, or{" "}
              <button
                type="button"
                onClick={triggerFileSelect}
                className="text-purple-600 hover:underline font-bold cursor-pointer"
              >
                browse files
              </button>
            </div>
            <p className="text-[10px] text-zinc-400">
              Supports: WEBP, PNG, JPG, JPEG (Max 5MB).
            </p>

            {avatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20 text-[10px] font-bold transition cursor-pointer"
              >
                <FaTrashAlt size={10} />
                <span>Remove Current</span>
              </button>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-850 pb-3 pt-2">
          Personal Profile Details
        </h3>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500">Full Name</label>
          <div className="relative">
            <input
              type="text"
              disabled={loading}
              placeholder="Dhyey Bhuva"
              {...register("name", { required: "Name is required" })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-650/10 focus:border-purple-650 transition"
            />
            <FaUser className="absolute left-3.5 top-3.5 text-zinc-450 dark:text-zinc-500 w-3.5 h-3.5" />
          </div>
          {errors.name && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500">Email Address</label>
          <div className="relative">
            <input
              type="email"
              disabled={loading}
              placeholder="admin@dhyeybhuva.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email format",
                },
              })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-650/10 focus:border-purple-650 transition"
            />
            <FaEnvelope className="absolute left-3.5 top-3.5 text-zinc-450 dark:text-zinc-500 w-3.5 h-3.5" />
          </div>
          {errors.email && <p className="text-[10px] text-red-500">{errors.email.message}</p>}
        </div>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-850 pb-3 pt-4">
          Change Account Password
        </h3>

        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500">Current Password</label>
          <div className="relative">
            <input
              type="password"
              disabled={loading}
              placeholder="••••••••"
              {...register("currentPassword")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-655/10 focus:border-purple-650 transition"
            />
            <FaLock className="absolute left-3.5 top-3.5 text-zinc-455 dark:text-zinc-500 w-3.5 h-3.5" />
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500">New Password</label>
          <div className="relative">
            <input
              type="password"
              disabled={loading}
              placeholder="••••••••"
              {...register("newPassword", {
                validate: (val) => {
                  if (val && val.length < 6) {
                    return "New password must be at least 6 characters";
                  }
                  return true;
                },
              })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-655/10 focus:border-purple-650 transition"
            />
            <FaLock className="absolute left-3.5 top-3.5 text-zinc-455 dark:text-zinc-500 w-3.5 h-3.5" />
          </div>
          {errors.newPassword && (
            <p className="text-[10px] text-red-500 font-semibold">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition flex justify-center items-center gap-2 cursor-pointer"
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
