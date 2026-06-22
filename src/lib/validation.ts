import { z } from "zod";

// Admin Authentication Validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Project Validation Schema
export const projectSchema = z.object({
  title: z.string().min(2, "Title is too short").trim(),
  description: z.string().min(5, "Description is too short").trim(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  imageUrl: z.string().url("Must be a valid Cloudinary/image URL"),
  tags: z.array(z.string()).default([]),
  demoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  featured: z.boolean().default(false),
  order: z.number().default(0),
  
  // Rich Case Study Fields
  category: z.string().optional().or(z.literal("")),
  shortDescription: z.string().optional().or(z.literal("")),
  fullDescription: z.string().optional().or(z.literal("")),
  thumbnail: z.string().optional().or(z.literal("")),
  gallery: z.array(
    z.object({
      image: z.string(),
      alt: z.string(),
    })
  ).default([]),
  technologies: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  solutions: z.array(z.string()).default([]),
  projectType: z.string().optional().or(z.literal("")),
  clientName: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  duration: z.string().optional().or(z.literal("")),
  status: z.enum(["Completed", "In Progress"]).default("Completed"),
  seo: z.object({
    metaTitle: z.string().optional().or(z.literal("")),
    metaDescription: z.string().optional().or(z.literal("")),
  }).optional().default({}),
});

// Service Validation Schema
export const serviceSchema = z.object({
  title: z.string().min(2, "Title is too short").trim(),
  description: z.string().min(5, "Description is too short").trim(),
  icon: z.string().min(1, "Icon class/name is required").trim(),
  features: z.array(z.string()).default([]),
  price: z.string().min(1, "Price is required").trim(),
  order: z.number().default(0),
});

// Blog Validation Schema
export const blogSchema = z.object({
  title: z.string().min(2, "Title is too short").trim(),
  description: z.string().min(5, "Description is too short").trim(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  imageUrl: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  category: z.string().min(2, "Category is too short").trim(),
  published: z.boolean().default(false),
  readTime: z.string().min(1, "Read time is required").trim(),
});

// Client Inquiry Validation Schema
export const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  subject: z.string().trim().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").trim(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type BlogInput = z.infer<typeof blogSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
