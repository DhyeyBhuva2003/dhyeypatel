import mongoose, { Schema, Document } from "mongoose";

export interface IInquiry extends Document {
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "PENDING" | "CONTACTED" | "RESOLVED";
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentPublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    subject: { type: String, trim: true, default: "" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "CONTACTED", "RESOLVED"],
      default: "PENDING",
      index: true,
    },
    attachmentUrl: { type: String, default: "" },
    attachmentName: { type: String, default: "" },
    attachmentSize: { type: Number, default: 0 },
    attachmentPublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Inquiry = mongoose.models.Inquiry || mongoose.model<IInquiry>("Inquiry", InquirySchema);
export default Inquiry;
