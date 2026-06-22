import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  title: string;
  description: string;
  icon: string; // Name of icon (e.g. from react-icons)
  features: string[]; // List of package features
  price: string; // Pricing text (e.g. "$499" or "Custom")
  slug: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true },
    features: { type: [String], default: [] },
    price: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Service = mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);
export default Service;
