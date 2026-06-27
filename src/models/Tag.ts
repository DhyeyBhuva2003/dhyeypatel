import mongoose, { Schema, Document } from "mongoose";

export interface ITag extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Tag = mongoose.models.Tag || mongoose.model<ITag>("Tag", TagSchema);
export default Tag;
