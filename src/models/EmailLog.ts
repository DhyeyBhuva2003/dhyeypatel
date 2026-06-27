import mongoose, { Schema, Document } from "mongoose";

export interface IEmailLog extends Document {
  queueId: string;
  campaign?: mongoose.Types.ObjectId;
  subscriber?: mongoose.Types.ObjectId;
  recipientEmail: string;
  status: "DELIVERED" | "OPENED" | "CLICKED" | "BOUNCED" | "SPAM" | "UNSUBSCRIBED";
  ipAddress?: string;
  userAgent?: string;
  clickedUrls: string[];
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  unsubscribedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    queueId: { type: String, required: true, index: true },
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign", index: true },
    subscriber: { type: Schema.Types.ObjectId, ref: "Subscriber", index: true },
    recipientEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    status: {
      type: String,
      enum: ["DELIVERED", "OPENED", "CLICKED", "BOUNCED", "SPAM", "UNSUBSCRIBED"],
      default: "DELIVERED",
      index: true,
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    clickedUrls: [{ type: String }],
    openedAt: { type: Date },
    clickedAt: { type: Date },
    bouncedAt: { type: Date },
    unsubscribedAt: { type: Date },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const EmailLog =
  mongoose.models.EmailLog || mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);
export default EmailLog;
