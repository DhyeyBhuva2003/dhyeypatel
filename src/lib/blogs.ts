import fs from "fs";
import path from "path";
import connectToDatabase from "./db";
import Blog from "@/models/Blog";
import { calculateReadTime } from "./utils";

export interface BlogMetadata {
  title: string;
  description: string;
  slug: string;
  publishedAt: Date;
  tags: string[];
  category: string;
  imageUrl?: string;
  readTime: string;
  source: "file" | "db";
  published: boolean;
}

export interface BlogPost extends BlogMetadata {
  content: string;
}

const blogsDirectory = path.join(process.cwd(), "content/blogs");

/**
 * Custom YAML-like frontmatter parser.
 * Handles standard attributes and markdown list structures (e.g. starting with '-' or '*').
 */
export function parseFrontmatter(fileContent: string): {
  metadata: Record<string, any>;
  content: string;
} {
  const lines = fileContent.split(/\r?\n/);

  if (lines.length === 0 || lines[0].trim() !== "---") {
    return { metadata: {}, content: fileContent };
  }

  const metadata: Record<string, any> = {};
  let i = 1;
  let currentKey: string | null = null;

  while (i < lines.length && lines[i].trim() !== "---") {
    const line = lines[i];

    // Check for array list items (e.g., "* tag" or "- tag") under a key like tags
    const listItemMatch = line.match(/^\s*[\*\-]\s*(.*)$/);
    if (listItemMatch && currentKey) {
      if (!Array.isArray(metadata[currentKey])) {
        metadata[currentKey] = [];
      }
      let val = listItemMatch[1].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      metadata[currentKey].push(val);
      i++;
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      let val = line.substring(colonIndex + 1).trim();
      currentKey = key;

      if (val) {
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }

        if (key === "tags") {
          if (val.startsWith("[") && val.endsWith("]")) {
            metadata.tags = val
              .slice(1, -1)
              .split(",")
              .map((t) => t.trim().replace(/['"]/g, ""));
          } else {
            metadata.tags = val.split(",").map((t) => t.trim());
          }
        } else if (key === "publishedAt") {
          metadata.publishedAt = new Date(val);
        } else if (key === "published") {
          metadata.published = val === "true";
        } else {
          metadata[key] = val;
        }
      } else {
        metadata[key] = null;
      }
    }
    i++;
  }

  const content = lines.slice(i + 1).join("\n");
  return { metadata, content };
}

/**
 * Retrieve all local blog posts from content/blogs/
 */
export function getLocalBlogs(): BlogPost[] {
  try {
    if (!fs.existsSync(blogsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(blogsDirectory);
    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx?$/, "");
        const fullPath = path.join(blogsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");

        const { metadata, content } = parseFrontmatter(fileContents);
        const readTime = calculateReadTime(content);

        return {
          title: metadata.title || "Untitled Post",
          description: metadata.description || "",
          slug: metadata.slug || slug,
          publishedAt: metadata.publishedAt ? new Date(metadata.publishedAt) : new Date(),
          tags: Array.isArray(metadata.tags) ? metadata.tags : [],
          category: metadata.category || "General",
          imageUrl: metadata.imageUrl || "",
          readTime: metadata.readTime || readTime,
          published: metadata.published !== false,
          source: "file" as const,
          content,
        };
      })
      .filter((post) => post.published); // Only return published posts

    return allPostsData;
  } catch (err) {
    console.error("Error reading local blogs:", err);
    return [];
  }
}

/**
 * Retrieve unified blog list (combines static markdown files and database logs)
 */
export async function getAllBlogs(): Promise<BlogPost[]> {
  // 1. Fetch file blogs
  const fileBlogs = getLocalBlogs();

  // 2. Fetch db blogs
  let dbBlogs: BlogPost[] = [];
  try {
    await connectToDatabase();
    const records = await Blog.find({ published: true }).lean();
    dbBlogs = records.map((record: any) => ({
      title: record.title,
      description: record.description,
      slug: record.slug,
      publishedAt: new Date(record.publishedAt || record.createdAt),
      tags: record.tags || [],
      category: record.category || "General",
      imageUrl: record.imageUrl || "",
      readTime: record.readTime || calculateReadTime(record.content),
      source: "db" as const,
      published: record.published,
      content: record.content,
    }));
  } catch (err) {
    console.error("Error retrieving DB blogs in aggregator:", err);
  }

  // 3. Combine lists (database blogs override file blogs on slug conflict)
  const combined = new Map<string, BlogPost>();
  
  fileBlogs.forEach((blog) => combined.set(blog.slug, blog));
  dbBlogs.forEach((blog) => combined.set(blog.slug, blog));

  // 4. Return sorted by date (newest first)
  return Array.from(combined.values()).sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );
}

/**
 * Retrieve a single blog post by its slug from local files or DB
 */
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  // 1. Try local file path first
  try {
    if (fs.existsSync(blogsDirectory)) {
      const mdPath = path.join(blogsDirectory, `${slug}.md`);
      const mdxPath = path.join(blogsDirectory, `${slug}.mdx`);
      let filePath = "";
      
      if (fs.existsSync(mdPath)) filePath = mdPath;
      else if (fs.existsSync(mdxPath)) filePath = mdxPath;

      if (filePath) {
        const fileContents = fs.readFileSync(filePath, "utf8");
        const { metadata, content } = parseFrontmatter(fileContents);
        const readTime = calculateReadTime(content);

        return {
          title: metadata.title || "Untitled Post",
          description: metadata.description || "",
          slug: metadata.slug || slug,
          publishedAt: metadata.publishedAt ? new Date(metadata.publishedAt) : new Date(),
          tags: Array.isArray(metadata.tags) ? metadata.tags : [],
          category: metadata.category || "General",
          imageUrl: metadata.imageUrl || "",
          readTime: metadata.readTime || readTime,
          published: metadata.published !== false,
          source: "file" as const,
          content,
        };
      }
    }
  } catch (err) {
    console.error(`Error reading local blog file [${slug}]:`, err);
  }

  // 2. Query MongoDB
  try {
    await connectToDatabase();
    const record: any = await Blog.findOne({ slug }).lean();
    if (record) {
      return {
        title: record.title,
        description: record.description,
        slug: record.slug,
        publishedAt: new Date(record.publishedAt || record.createdAt),
        tags: record.tags || [],
        category: record.category || "General",
        imageUrl: record.imageUrl || "",
        readTime: record.readTime || calculateReadTime(record.content),
        source: "db" as const,
        published: record.published,
        content: record.content,
      };
    }
  } catch (err) {
    console.error(`Error finding blog in DB [${slug}]:`, err);
  }

  return null;
}

/**
 * Fetch related blogs by tags intersection (excluding current post)
 */
export async function getRelatedBlogs(
  currentSlug: string,
  tags: string[],
  limit = 3
): Promise<BlogPost[]> {
  try {
    const allBlogs = await getAllBlogs();
    
    return allBlogs
      .filter((blog) => blog.slug !== currentSlug)
      .map((blog) => {
        // Calculate intersection score
        const matchCount = blog.tags.filter((t) => tags.includes(t)).length;
        return { blog, matchCount };
      })
      .filter((item) => item.matchCount > 0 || tags.length === 0)
      .sort((a, b) => b.matchCount - a.matchCount || b.blog.publishedAt.getTime() - a.blog.publishedAt.getTime())
      .slice(0, limit)
      .map((item) => item.blog);
  } catch (err) {
    console.error("Error finding related blogs:", err);
    return [];
  }
}
