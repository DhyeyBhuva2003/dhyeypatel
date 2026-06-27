import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  user?: mongoose.Types.ObjectId;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  device?: string;
  browser?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
    device: { type: String },
    browser: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLog;
