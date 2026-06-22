import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  slug: string;
  content: string; // Markdown details
  imageUrl: string; // Cloudinary image URL
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  
  // New Case Study Fields
  category?: string;
  shortDescription?: string;
  fullDescription?: string;
  thumbnail?: string;
  gallery: { image: string; alt: string }[];
  technologies: string[];
  features: string[];
  challenges: string[];
  solutions: string[];
  projectType?: string;
  clientName?: string;
  industry?: string;
  duration?: string;
  status: "Completed" | "In Progress";
  seo: {
    metaTitle?: string;
    metaDescription?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: true },
    tags: { type: [String], default: [] },
    demoUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    
    // New Case Study Fields
    category: { type: String, trim: true },
    shortDescription: { type: String, trim: true },
    fullDescription: { type: String, trim: true },
    thumbnail: { type: String, trim: true },
    gallery: {
      type: [
        {
          image: { type: String, required: true },
          alt: { type: String, required: true },
        },
      ],
      default: [],
    },
    technologies: { type: [String], default: [] },
    features: { type: [String], default: [] },
    challenges: { type: [String], default: [] },
    solutions: { type: [String], default: [] },
    projectType: { type: String, trim: true },
    clientName: { type: String, trim: true },
    industry: { type: String, trim: true },
    duration: { type: String, trim: true },
    status: { type: String, enum: ["Completed", "In Progress"], default: "Completed" },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

export const Project = mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
export default Project;
