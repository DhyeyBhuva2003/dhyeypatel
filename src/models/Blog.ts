import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  description: string;
  slug: string;
  content: string; // Markdown details
  imageUrl?: string; // Cloudinary cover image URL
  tags: string[];
  category: string;
  published: boolean;
  publishedAt?: Date;
  readTime: string; // e.g. "5 min read"
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    content: { type: String, required: true },
    imageUrl: { type: String, trim: true },
    tags: { type: [String], default: [] },
    category: { type: String, required: true, trim: true, index: true },
    published: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    readTime: { type: String, required: true },
  },
  { timestamps: true }
);

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
export default Blog;
