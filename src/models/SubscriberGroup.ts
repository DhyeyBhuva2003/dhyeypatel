import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriberGroup extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberGroupSchema = new Schema<ISubscriberGroup>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export const SubscriberGroup =
  mongoose.models.SubscriberGroup ||
  mongoose.model<ISubscriberGroup>("SubscriberGroup", SubscriberGroupSchema);
export default SubscriberGroup;
