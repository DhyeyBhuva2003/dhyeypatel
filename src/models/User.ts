import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "ADMIN" | "USER";
  provider?: "CREDENTIALS" | "GOOGLE" | "LINKEDIN";
  profileImage?: {
    public_id: string;
    secure_url: string;
  };
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: false },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    provider: { type: String, enum: ["CREDENTIALS", "GOOGLE", "LINKEDIN"], default: "CREDENTIALS" },
    profileImage: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "PENDING"],
      default: "ACTIVE",
    },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
