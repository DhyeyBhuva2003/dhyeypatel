import mongoose, { Schema, Document } from "mongoose";

export interface IEmailTemplate extends Document {
  name: string;
  slug: string;
  category: string;
  subject: string;
  html: string;
  jsonLayout: any; // Block array format for the Builder
  variables: string[]; // List of extracted variables in template
  previewImage?: string;
  version: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    category: { type: String, default: "General", index: true },
    subject: { type: String, required: true, trim: true },
    html: { type: String, required: true },
    jsonLayout: { type: Schema.Types.Mixed, default: [] },
    variables: [{ type: String }],
    previewImage: { type: String, default: "" },
    version: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const EmailTemplate =
  mongoose.models.EmailTemplate || mongoose.model<IEmailTemplate>("EmailTemplate", EmailTemplateSchema);
export default EmailTemplate;
