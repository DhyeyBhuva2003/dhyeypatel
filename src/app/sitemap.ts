import { MetadataRoute } from "next";
import { getAllBlogs } from "@/lib/blogs";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import Project from "@/models/Project";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dhyeybhuva.tech";

  // 1. Static site routing maps
  const staticRoutes: MetadataRoute.Sitemap = [
    { route: "", priority: 1.0, changeFrequency: "daily" as const },
    { route: "/services", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/portfolio", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/pricing", priority: 0.8, changeFrequency: "weekly" as const },
    { route: "/blog", priority: 0.8, changeFrequency: "daily" as const },
    { route: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { route: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ].map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  // 2. Dynamic Service sitemap paths
  let serviceRoutes: MetadataRoute.Sitemap = [];
  try {
    await connectToDatabase();
    const services = await Service.find({}).select("slug updatedAt createdAt").lean();
    serviceRoutes = services.map((service: any) => ({
      url: `${baseUrl}/services/${service.slug}`,
      lastModified: service.updatedAt ? new Date(service.updatedAt) : new Date(service.createdAt || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  } catch (err) {
    console.error("Sitemap dynamic services aggregation failed:", err);
  }

  // 3. Dynamic Project case study sitemap paths
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    await connectToDatabase();
    const projects = await Project.find({}).select("slug updatedAt createdAt").lean();
    projectRoutes = projects.map((project: any) => ({
      url: `${baseUrl}/portfolio/${project.slug}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(project.createdAt || Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error("Sitemap dynamic projects aggregation failed:", err);
  }

  // 4. Dynamic Blog sitemap paths
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogs = await getAllBlogs();
    blogRoutes = blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: new Date(blog.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("Sitemap dynamic blogs aggregation failed:", err);
  }

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes, ...blogRoutes];
}

