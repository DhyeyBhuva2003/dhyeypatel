import mongoose, { Schema, Document } from "mongoose";

export interface IPreferences extends Document {
  user: mongoose.Types.ObjectId;
  marketingOptIn: boolean;
  marketingOptInDate?: Date;
  marketingOptInSource?: string;
  marketingOptInIp?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PreferencesSchema = new Schema<IPreferences>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    marketingOptIn: { type: Boolean, default: false },
    marketingOptInDate: { type: Date },
    marketingOptInSource: { type: String },
    marketingOptInIp: { type: String },
  },
  { timestamps: true }
);

export const Preferences = mongoose.models.Preferences || mongoose.model<IPreferences>("Preferences", PreferencesSchema);
export default Preferences;
