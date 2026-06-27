import mongoose, { Schema, Document } from "mongoose";

export interface ICampaign extends Document {
  name: string;
  subject: string;
  template: mongoose.Types.ObjectId;
  senderName: string;
  replyTo: string;
  campaignType: "NEWSLETTER" | "PROMOTION" | "ANNOUNCEMENT" | "FOLLOW_UP" | "CUSTOM";
  audience: {
    type: "ALL" | "GROUPS" | "TAGS" | "MANUAL" | "CSV";
    groupIds?: mongoose.Types.ObjectId[];
    tagIds?: mongoose.Types.ObjectId[];
    manualEmails?: string[];
    csvUrl?: string;
  };
  attachments: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  schedule: {
    sendNow: boolean;
    scheduledAt?: Date;
    timezone: string;
  };
  status: "DRAFT" | "SCHEDULED" | "PROCESSING" | "COMPLETED" | "FAILED" | "PAUSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    template: { type: Schema.Types.ObjectId, ref: "EmailTemplate", required: true },
    senderName: { type: String, required: true, trim: true },
    replyTo: { type: String, required: true, trim: true },
    campaignType: {
      type: String,
      enum: ["NEWSLETTER", "PROMOTION", "ANNOUNCEMENT", "FOLLOW_UP", "CUSTOM"],
      default: "NEWSLETTER",
      index: true,
    },
    audience: {
      type: { type: String, enum: ["ALL", "GROUPS", "TAGS", "MANUAL", "CSV"], required: true },
      groupIds: [{ type: Schema.Types.ObjectId, ref: "SubscriberGroup" }],
      tagIds: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
      manualEmails: [{ type: String }],
      csvUrl: { type: String, default: "" },
    },
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number, required: true },
      },
    ],
    schedule: {
      sendNow: { type: Boolean, default: true },
      scheduledAt: { type: Date },
      timezone: { type: String, default: "UTC" },
    },
    status: {
      type: String,
      enum: ["DRAFT", "SCHEDULED", "PROCESSING", "COMPLETED", "FAILED", "PAUSED"],
      default: "DRAFT",
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
  },
  { timestamps: true }
);

export const Campaign =
  mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);
export default Campaign;
