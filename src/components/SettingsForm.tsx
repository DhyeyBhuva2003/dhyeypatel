"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Save, KeyRound, Image } from "lucide-react";
import { Toaster, toast } from "sonner";

import FormInput from "./forms/FormInput";
import FormPasswordInput from "./forms/FormPasswordInput";
import FormImageUpload from "./forms/FormImageUpload";
import apiClient from "@/api/client";

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

const settingsFormSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().min(1, "Email is required").email("Invalid email format").toLowerCase().trim(),
    currentPassword: z.string().optional().or(z.literal("")),
    newPassword: z.string().optional().or(z.literal("")),
    profileImage: z
      .object({
        public_id: z.string(),
        secure_url: z.string(),
      })
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    }
  );

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function SettingsForm({ admin }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);

  const methods = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: admin.name,
      email: admin.email,
      currentPassword: "",
      newPassword: "",
      profileImage: admin.profileImage || { public_id: "", secure_url: "" },
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setLoading(true);
    try {
      const response = await apiClient.put("/admin/settings", data);

      if (response.data && response.data.success) {
        toast.success("Profile credentials updated successfully!");
        methods.reset({
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          currentPassword: "",
          newPassword: "",
          profileImage: response.data.data.user.profileImage || { public_id: "", secure_url: "" },
        });
      } else {
        toast.error("Failed to update profile settings.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred during save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm max-w-2xl select-none animate-fadeIn">
      <Toaster position="top-right" richColors />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Avatar photo */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-850 pb-3 flex items-center gap-2 uppercase tracking-wider">
              <Image className="w-4 h-4 text-brand-primary" />
              <span>Profile Avatar Photo</span>
            </h3>
            <FormImageUpload
              name="profileImage.secure_url"
              publicIdName="profileImage.public_id"
              folder="avatars"
              description="PNG, JPG, WEBP formats allowed (Max 5MB)"
            />
          </div>

          {/* Profile details */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-850 pb-3 flex items-center gap-2 uppercase tracking-wider">
              <User className="w-4 h-4 text-brand-primary" />
              <span>Administrative details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="name"
                label="Full Name"
                placeholder="Dhyey Bhuva"
                disabled={loading}
                icon={<User className="w-3.5 h-3.5" />}
              />
              <FormInput
                name="email"
                label="Email Address"
                placeholder="admin@dhyeybhuva.com"
                disabled={loading}
                icon={<Mail className="w-3.5 h-3.5" />}
              />
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-850 pb-3 flex items-center gap-2 uppercase tracking-wider">
              <KeyRound className="w-4 h-4 text-brand-primary" />
              <span>Modify password credentials</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormPasswordInput
                name="currentPassword"
                label="Current Password"
                placeholder="••••••••"
                disabled={loading}
              />
              <FormPasswordInput
                name="newPassword"
                label="New Password"
                placeholder="••••••••"
                disabled={loading}
                showStrength={true}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-primary-hover text-white font-bold text-xs transition flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>Saving Credentials...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings Changes</span>
              </>
            )}
          </button>
        </form>
      </FormProvider>
    </div>
  );
}
