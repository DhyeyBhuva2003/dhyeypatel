import mongoose, { Schema, Document } from "mongoose";

export interface ICrmProfile extends Document {
  user?: mongoose.Types.ObjectId;
  subscriber?: mongoose.Types.ObjectId;
  device?: string;
  browser?: string;
  ipAddress?: string;
  referralSource?: string;
  campaignSource?: string; // utm_source
  utmParameters: Map<string, string>;
  landingPage?: string;
  loginHistory: Array<{
    loginAt: Date;
    ipAddress?: string;
    device?: string;
    browser?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CrmProfileSchema = new Schema<ICrmProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    subscriber: { type: Schema.Types.ObjectId, ref: "Subscriber", index: true },
    device: { type: String },
    browser: { type: String },
    ipAddress: { type: String },
    referralSource: { type: String },
    campaignSource: { type: String },
    utmParameters: { type: Map, of: String, default: {} },
    landingPage: { type: String },
    loginHistory: [
      {
        loginAt: { type: Date, default: Date.now },
        ipAddress: { type: String },
        device: { type: String },
        browser: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const CrmProfile = mongoose.models.CrmProfile || mongoose.model<ICrmProfile>("CrmProfile", CrmProfileSchema);
export default CrmProfile;
