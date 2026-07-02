"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FaSearch, FaBookOpen, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useBlogs } from "@/hooks/useBlogs";
import { formatDate } from "@/lib/utils";
import FadeIn from "@/components/FadeIn";
import { BlogListSkeleton } from "@/components/ui/Skeletons";
import ErrorState from "@/components/ui/ErrorState";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import axios from "axios";

interface BlogPageClientProps {
  activeCategory?: string;
  searchQuery?: string;
  currentPage: number;
  categories: string[];
}

export default function BlogPageClient({
  activeCategory,
  searchQuery,
  currentPage,
  categories,
}: BlogPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState(searchQuery || "");

  // Sync search input with prop changes (e.g. back navigation or filters reset)
  useEffect(() => {
    setSearchInput(searchQuery || "");
  }, [searchQuery]);

  const { data, isLoading, isError, refetch } = useBlogs({
    category: activeCategory,
    q: searchQuery,
    page: currentPage,
    limit: 12,
  });

  // Prefetch details of a blog post on hover
  const handlePrefetchBlog = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.blogs.detail(slug),
      queryFn: async () => {
        const { data } = await axios.get("/api/blogs", {
          params: { slug },
        });
        return data.data;
      },
      staleTime: 60 * 1000,
    });
  };

  const getPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handleCategoryClick = (cat?: string) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    // Reset page to 1 on filter changes
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (searchInput.trim()) params.set("q", searchInput.trim());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 text-center">
        <ErrorState onRetry={refetch} message="Failed to load blog posts." />
      </div>
    );
  }

  const blogs = data?.blogs || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.pages || 0;
  const pageSize = data?.limit || 12;
  const startIndex = ((currentPage || 1) - 1) * pageSize;

  // Pagination Range Builder
  const siblingCount = 1;
  const paginationRange: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - siblingCount && i <= currentPage + siblingCount)
    ) {
      paginationRange.push(i);
    } else if (paginationRange[paginationRange.length - 1] !== "...") {
      paginationRange.push("...");
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 space-y-12 bg-bg-main text-text-main">
      {/* Header */}
      <section className="space-y-4 max-w-3xl">
        <FadeIn direction="up">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-main leading-tight">
            Technical Publication
          </h1>
        </FadeIn>
        <FadeIn direction="up" delay={0.1}>
          <p className="text-lg text-text-sub leading-relaxed">
            Detailed engineering write-ups, backend optimizations, and tips on structuring robust Next.js and MongoDB layouts.
          </p>
        </FadeIn>
      </section>

      {/* Controls: Search and Filters */}
      <FadeIn direction="up" delay={0.2}>
        <section className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 order-2 md:order-1">
            <button
              onClick={() => handleCategoryClick()}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold border transition duration-200 cursor-pointer ${
                !activeCategory
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "border-border-main text-text-sub hover:bg-bg-sub"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4.5 py-2 rounded-xl text-xs font-bold border transition duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "border-border-main text-text-sub hover:bg-bg-sub"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full md:w-80 order-1 md:order-2"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-main bg-card-main text-sm text-text-main placeholder-text-sub/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary"
            />
            <FaSearch className="absolute left-3.5 top-3.5 text-text-sub/60 w-3.5 h-3.5" />
          </form>
        </section>
      </FadeIn>

      {/* Loading Skeletons */}
      {isLoading ? (
        <BlogListSkeleton />
      ) : blogs.length === 0 ? (
        <section className="py-20 text-center space-y-3">
          <p className="text-text-sub">No articles match your search or filter.</p>
          <button
            onClick={() => {
              setSearchInput("");
              router.push(pathname);
            }}
            className="text-sm font-semibold text-brand-primary hover:underline cursor-pointer bg-transparent border-0"
          >
            Reset All Filters
          </button>
        </section>
      ) : (
        <div className="space-y-12">
          {/* Blog Cards Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog: any, idx: number) => (
              <FadeIn key={blog.slug} direction="up" delay={idx * 0.05}>
                <article
                  onMouseEnter={() => handlePrefetchBlog(blog.slug)}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-card-main border border-border-main hover:border-brand-primary/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 min-h-[380px] shadow-sm"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-bg-sub border-b border-border-main">
                    <img
                      src={blog.imageUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop"}
                      alt={blog.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      {/* Meta details */}
                      <div className="flex justify-between items-center text-[10px] font-bold text-text-sub uppercase tracking-wider">
                        <span className="text-brand-primary dark:text-brand-accent">
                          {blog.category}
                        </span>
                        <span>{blog.readTime}</span>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-xl font-bold text-text-main group-hover:text-brand-primary transition leading-snug line-clamp-2">
                        <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                      </h2>
                      
                      {/* Description */}
                      <p className="text-xs text-text-sub leading-relaxed line-clamp-3">
                        {blog.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {blog.tags.slice(0, 3).map((tag: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded text-[9px] font-semibold bg-bg-sub border border-border-main text-text-sub"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom footer bar */}
                    <div className="pt-5 mt-6 border-t border-border-main flex items-center justify-between">
                      <span className="text-xs text-text-sub font-medium">
                        {formatDate(new Date(blog.publishedAt))}
                      </span>
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary dark:text-brand-accent hover:underline"
                      >
                        <span>Read Article</span>
                        <FaBookOpen size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </section>

          {/* Numbered Pagination Control Section */}
          {totalPages > 1 && (
            <div className="border-t border-border-main pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-text-sub font-semibold">
                Showing {startIndex + 1}–{Math.min(startIndex + pageSize, totalCount)} of {totalCount} Articles
              </span>

              <div className="flex items-center gap-1.5">
                {/* Previous Page Link */}
                <Link
                  href={currentPage > 1 ? getPageUrl(currentPage - 1) : "#"}
                  className={`p-2.5 rounded-xl border border-border-main flex items-center justify-center transition ${
                    currentPage > 1
                      ? "bg-card-main text-text-main hover:bg-bg-sub cursor-pointer"
                      : "text-text-sub/40 bg-zinc-100/50 dark:bg-zinc-950/20 cursor-not-allowed border-dashed"
                  }`}
                  aria-label="Previous Page"
                >
                  <FaChevronLeft className="w-3 h-3" />
                </Link>

                {/* Page Number Pills */}
                {paginationRange.map((pageNumber, idx) => {
                  if (pageNumber === "...") {
                    return (
                      <span
                        key={idx}
                        className="px-3.5 py-2 text-xs font-bold text-text-sub/50 selection:bg-transparent"
                      >
                        ...
                      </span>
                    );
                  }

                  const pageNum = pageNumber as number;
                  const isActive = pageNum === currentPage;

                  return (
                    <Link
                      key={idx}
                      href={getPageUrl(pageNum)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                        isActive
                          ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                          : "bg-card-main border-border-main text-text-sub hover:bg-bg-sub cursor-pointer"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                {/* Next Page Link */}
                <Link
                  href={currentPage < totalPages ? getPageUrl(currentPage + 1) : "#"}
                  className={`p-2.5 rounded-xl border border-border-main flex items-center justify-center transition ${
                    currentPage < totalPages
                      ? "bg-card-main text-text-main hover:bg-bg-sub cursor-pointer"
                      : "text-text-sub/40 bg-zinc-100/50 dark:bg-zinc-950/20 cursor-not-allowed border-dashed"
                  }`}
                  aria-label="Next Page"
                >
                  <FaChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
