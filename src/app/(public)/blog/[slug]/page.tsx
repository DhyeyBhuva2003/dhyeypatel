import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft, FaCalendarAlt, FaClock, FaTag, FaBookOpen } from "react-icons/fa";
import { getBlogBySlug, getRelatedBlogs } from "@/lib/blogs";
import { formatDate } from "@/lib/utils";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getBlogPostingSchema } from "@/lib/seo";

interface BlogDetailsProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic sitemap/metadata titles
export async function generateMetadata({ params }: BlogDetailsProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  
  if (!blog) {
    return {
      title: "Article Not Found",
      description: "This blog article does not exist or has been removed.",
    };
  }

  return {
    title: `${blog.title} | Dhyey Bhuva Blog`,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      publishedTime: blog.publishedAt.toISOString(),
      authors: ["Dhyey Bhuva"],
      tags: blog.tags,
    },
  };
}

// Extract headers for sticky Table of Contents sidebar
function extractHeadings(content: string) {
  const headingRegex = /^(#{2,3})\s+(.*)$/gm;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length; // 2 for ##, 3 for ###
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");
    headings.push({ level, text, id });
  }
  
  return headings;
}

export default async function BlogDetails({ params }: BlogDetailsProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const headings = extractHeadings(blog.content);
  const relatedBlogs = await getRelatedBlogs(blog.slug, blog.tags);
  const blogSchema = getBlogPostingSchema({
    title: blog.title,
    description: blog.description,
    slug: blog.slug,
    publishedAt: blog.publishedAt,
    imageUrl: blog.imageUrl,
  });

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
      {/* Google Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      {/* Back to Blog Link */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-550 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
        >
          <FaArrowLeft /> Back to Articles
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-6 max-w-4xl">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400">
            {blog.category}
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight">
          {blog.title}
        </h1>
        
        <p className="text-base sm:text-lg text-zinc-550 dark:text-zinc-400 leading-relaxed">
          {blog.description}
        </p>

        {/* Date and Reading Time */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-450 border-y border-zinc-150 dark:border-zinc-850 py-4">
          <div className="flex items-center gap-1.5">
            <FaCalendarAlt className="text-zinc-405" />
            <span>Published {formatDate(blog.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaClock className="text-zinc-405" />
            <span>{blog.readTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-zinc-400">Source:</span>
            <span className="capitalize px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px]">
              {blog.source === "file" ? "Markdown File" : "Database"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Article content (left/main column) */}
        <div className="lg:col-span-8">
          <article className="bg-white dark:bg-zinc-950 rounded-2xl">
            <MarkdownRenderer content={blog.content} />
          </article>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-8 mt-12 border-t border-zinc-100 dark:border-zinc-850">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400"
              >
                <FaTag className="w-2.5 h-2.5 text-zinc-400" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Sticky table of contents and metadata (right sidebar) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-8">
          {/* Table of Contents */}
          {headings.length > 0 && (
            <div className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-zinc-850/50 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Table of Contents
              </h3>
              <nav className="space-y-2.5">
                {headings.map((heading, idx) => (
                  <a
                    key={idx}
                    href={`#${heading.id}`}
                    className={`block text-xs font-medium text-zinc-550 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition ${
                      heading.level === 3 ? "pl-3.5 border-l border-zinc-200 dark:border-zinc-800" : ""
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Author Profile */}
          <div className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-zinc-850/50 space-y-4 text-center sm:text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Author
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-800">
                {/* Author Avatar using Dhyey's image */}
                <img
                  src="/dhyey.png"
                  alt="Dhyey Bhuva"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                  Dhyey Bhuva
                </h4>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wide">
                  Staff Engineer & Writer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Blogs Section */}
      {relatedBlogs.length > 0 && (
        <section className="pt-12 border-t border-zinc-150 dark:border-zinc-850 space-y-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FaBookOpen className="text-purple-650" /> Related Articles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedBlogs.map((rBlog) => (
              <Link
                key={rBlog.slug}
                href={`/blog/${rBlog.slug}`}
                className="group p-6 rounded-2xl bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200/60 dark:border-zinc-850/60 hover:border-purple-500/30 transition duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                    <span>{rBlog.category}</span>
                    <span>{rBlog.readTime}</span>
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-purple-650 dark:group-hover:text-purple-400 transition line-clamp-2 text-sm sm:text-base">
                    {rBlog.title}
                  </h4>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {rBlog.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-850 flex justify-between items-center text-xs font-semibold text-zinc-400">
                  <span>{formatDate(rBlog.publishedAt)}</span>
                  <span className="text-purple-650 font-bold group-hover:translate-x-0.5 transition duration-200">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
