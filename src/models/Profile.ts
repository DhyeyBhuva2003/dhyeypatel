import mongoose, { Schema, Document } from "mongoose";

export interface IProfile extends Document {
  user: mongoose.Types.ObjectId;
  fullName: string;
  profilePicture?: string;
  country?: string;
  language?: string;
  timezone?: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    profilePicture: { type: String },
    country: { type: String, trim: true },
    language: { type: String, trim: true },
    timezone: { type: String, trim: true },
    company: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Profile = mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);
export default Profile;
