import React from "react";
import Link from "next/link";
import { FaSearch, FaBookOpen } from "react-icons/fa";
import { getAllBlogs } from "@/lib/blogs";
import { formatDate } from "@/lib/utils";

export const revalidate = 600; // Cache blog list for 10 minutes

interface BlogPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Await searchParams as required by Next.js 16
  const { category: activeCategory, q: searchQuery } = await searchParams;

  // Fetch all posts from dynamic and static engines
  const allBlogs = await getAllBlogs();

  // Aggregate categories for filters
  const categories = Array.from(new Set(allBlogs.map((b) => b.category)));

  // Filter posts on the server
  let filteredBlogs = allBlogs;

  if (activeCategory) {
    filteredBlogs = filteredBlogs.filter(
      (b) => b.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase().trim();
    filteredBlogs = filteredBlogs.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        b.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-12">
      {/* Header */}
      <section className="space-y-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Technical Publication
        </h1>
        <p className="text-lg text-zinc-650 dark:text-zinc-400 leading-relaxed">
          Detailed engineering write-ups, backend optimizations, and tips on structuring robust Next.js and MongoDB layouts.
        </p>
      </section>

      {/* Controls: Search and Filters */}
      <section className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 order-2 md:order-1">
          <Link
            href="/blog"
            className={`px-4.5 py-2 rounded-full text-xs font-semibold border transition ${
              !activeCategory
                ? "bg-purple-600 text-white border-purple-650"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-55/10 dark:hover:bg-zinc-900/40"
            }`}
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/blog?category=${encodeURIComponent(cat)}`}
              className={`px-4.5 py-2 rounded-full text-xs font-semibold border transition ${
                activeCategory === cat
                  ? "bg-purple-600 text-white border-purple-650"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-55/10 dark:hover:bg-zinc-900/40"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Server-based Search Form */}
        <form
          method="GET"
          action="/blog"
          className="relative w-full md:w-80 order-1 md:order-2"
        >
          {activeCategory && (
            <input type="hidden" name="category" value={activeCategory} />
          )}
          <input
            type="text"
            name="q"
            defaultValue={searchQuery || ""}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
          />
          <FaSearch className="absolute left-3.5 top-3.5 text-zinc-400 w-4 h-4" />
        </form>
      </section>

      {/* Blog Cards Grid */}
      {filteredBlogs.length === 0 ? (
        <section className="py-20 text-center space-y-3">
          <p className="text-zinc-550">No articles match your search or filter.</p>
          <Link href="/blog" className="text-sm font-semibold text-purple-650 hover:underline">
            Reset All Filters
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <article
              key={blog.slug}
              className="group flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-250/15 dark:border-zinc-850 hover:border-purple-500/30 shadow-sm hover:shadow-md transition duration-300"
            >
              <div className="space-y-4">
                {/* Meta details */}
                <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    {blog.category}
                  </span>
                  <span>{blog.readTime}</span>
                </div>
                
                {/* Title */}
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-purple-650 dark:group-hover:text-purple-400 transition leading-tight">
                  <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                </h2>
                
                {/* Description */}
                <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed line-clamp-3">
                  {blog.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {blog.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[9px] font-semibold tracking-wide bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-450"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom footer bar */}
              <div className="pt-5 mt-6 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">
                  {formatDate(blog.publishedAt)}
                </span>
                <Link
                  href={`/blog/${blog.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-650 dark:text-purple-400 hover:text-purple-750"
                >
                  <span>Read Article</span>
                  <FaBookOpen size={12} />
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
