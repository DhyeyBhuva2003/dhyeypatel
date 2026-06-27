import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  user: mongoose.Types.ObjectId;
  provider: "GOOGLE" | "LINKEDIN";
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  expiry?: Date;
  avatar?: string;
  verifiedEmail?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, enum: ["GOOGLE", "LINKEDIN"], required: true, index: true },
    providerId: { type: String, required: true, index: true },
    accessToken: { type: String },
    refreshToken: { type: String },
    expiry: { type: Date },
    avatar: { type: String },
    verifiedEmail: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AccountSchema.index({ user: 1, provider: 1 }, { unique: true });
AccountSchema.index({ provider: 1, providerId: 1 }, { unique: true });

export const Account = mongoose.models.Account || mongoose.model<IAccount>("Account", AccountSchema);
export default Account;
