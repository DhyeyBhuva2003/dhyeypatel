import mongoose, { Schema, Document } from "mongoose";

export interface IBrandSetting extends Document {
  brandName: string;
  logoUrl?: string;
  lightLogoUrl?: string;
  darkLogoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  supportEmail: string;
  replyEmail: string;
  website: string;
  address: string;
  phone?: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
  };
  footerText?: string;
  copyright: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSettingSchema = new Schema<IBrandSetting>(
  {
    brandName: { type: String, required: true, default: "My Brand" },
    logoUrl: { type: String, default: "" },
    lightLogoUrl: { type: String, default: "" },
    darkLogoUrl: { type: String, default: "" },
    primaryColor: { type: String, default: "#4f46e5" },
    secondaryColor: { type: String, default: "#475569" },
    accentColor: { type: String, default: "#2563eb" },
    supportEmail: { type: String, required: true, default: "support@example.com" },
    replyEmail: { type: String, required: true, default: "reply@example.com" },
    website: { type: String, required: true, default: "https://example.com" },
    address: { type: String, required: true, default: "123 Main St, City, Country" },
    phone: { type: String, default: "" },
    socialLinks: {
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
    footerText: { type: String, default: "You are receiving this email because you subscribed to our list." },
    copyright: { type: String, required: true, default: "All rights reserved." },
  },
  { timestamps: true }
);

export const BrandSetting =
  mongoose.models.BrandSetting || mongoose.model<IBrandSetting>("BrandSetting", BrandSettingSchema);
export default BrandSetting;
