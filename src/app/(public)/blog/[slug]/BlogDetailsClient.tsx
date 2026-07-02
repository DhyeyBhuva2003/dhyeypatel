"use client";

import React from "react";
import Link from "next/link";
import { FaArrowLeft, FaCalendarAlt, FaClock, FaTag, FaBookOpen, FaChevronRight } from "react-icons/fa";
import { useBlog } from "@/hooks/useBlogs";
import { formatDate } from "@/lib/utils";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import ShareButtons from "@/components/ShareButtons";
import FadeIn from "@/components/FadeIn";
import { BlogDetailsSkeleton } from "@/components/ui/Skeletons";
import ErrorState from "@/components/ui/ErrorState";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import axios from "axios";

interface BlogDetailsClientProps {
  slug: string;
  initialRelatedBlogs: any[];
}

export default function BlogDetailsClient({
  slug,
  initialRelatedBlogs,
}: BlogDetailsClientProps) {
  const { data: blog, isLoading, isError, refetch } = useBlog(slug);
  const queryClient = useQueryClient();

  // Prefetch details of a related blog on hover
  const handlePrefetchRelated = (rSlug: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.blogs.detail(rSlug),
      queryFn: async () => {
        const { data } = await axios.get("/api/blogs", {
          params: { slug: rSlug },
        });
        return data.data;
      },
      staleTime: 60 * 1000,
    });
  };

  if (isLoading) {
    return <BlogDetailsSkeleton />;
  }

  if (isError || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState
          onRetry={refetch}
          message="Failed to load article details. It might have been deleted or unpublished."
        />
      </div>
    );
  }

  const articleUrl = `${typeof window !== "undefined" ? window.location.origin : "https://dhyeybhuva.com"}/blog/${blog.slug}`;

  return (
    <div className="min-h-screen bg-bg-main text-text-main pb-24 transition-colors duration-250">
      {/* Scroll-Linked Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Top Navigation */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-8">
        <FadeIn direction="up">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-sub hover:text-brand-primary transition group mb-6"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Articles
          </Link>
        </FadeIn>

        {/* Breadcrumbs */}
        <FadeIn direction="up" delay={0.05}>
          <nav className="flex items-center gap-2 text-xs text-text-sub mb-8 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-brand-primary transition">
              Home
            </Link>
            <FaChevronRight size={8} />
            <Link href="/blog" className="hover:text-brand-primary transition">
              Blog
            </Link>
            <FaChevronRight size={8} />
            <span className="text-text-main font-medium truncate">{blog.title}</span>
          </nav>
        </FadeIn>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 pb-12 space-y-12">
        {/* Article Header */}
        <header className="space-y-6">
          <FadeIn direction="up" delay={0.05}>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                {blog.category}
              </span>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main leading-tight tracking-tight">
              {blog.title}
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.15}>
            <p className="text-base sm:text-lg text-text-sub leading-relaxed font-normal">
              {blog.description}
            </p>
          </FadeIn>

          {/* Metadata & Share Buttons */}
          <FadeIn direction="up" delay={0.2}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-y border-border-main py-4">
              <div className="flex flex-wrap items-center gap-6 text-xs text-text-sub">
                <div className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-brand-primary/80 dark:text-brand-accent/80" />
                  <span>Published {formatDate(new Date(blog.publishedAt))}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaClock className="text-brand-primary/80 dark:text-brand-accent/80" />
                  <span>{blog.readTime}</span>
                </div>
              </div>

              {/* Share Component */}
              <ShareButtons url={articleUrl} title={blog.title} />
            </div>
          </FadeIn>
        </header>

        {/* Markdown Content (Centered Single Column) */}
        <FadeIn direction="up" delay={0.25}>
          <article className="prose prose-zinc dark:prose-invert max-w-none bg-card-main border border-border-main p-6 sm:p-8 md:p-12 rounded-3xl shadow-sm leading-relaxed text-text-main">
            <MarkdownRenderer content={blog.content} />

            {/* Footer Section: Author Info & Tags */}
            <div className="pt-8 mt-12 border-t border-border-main space-y-6 not-prose">
              {/* Author Info */}
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border-main bg-bg-sub">
                  <img
                    src="/dhyey.png"
                    alt="Dhyey Bhuva"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-main">Dhyey Bhuva</h4>
                  <p className="text-[10px] text-text-sub font-semibold">Full Stack Developer</p>
                </div>
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-bg-sub border border-border-main text-text-sub hover:scale-105 transition-transform"
                    >
                      <FaTag className="w-2.5 h-2.5 text-brand-primary dark:text-brand-accent" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        </FadeIn>

        {/* Related Articles */}
        {initialRelatedBlogs.length > 0 && (
          <section className="pt-12 border-t border-border-main space-y-8">
            <FadeIn direction="up">
              <h3 className="text-2xl font-bold text-text-main flex items-center gap-2">
                <FaBookOpen className="text-brand-primary dark:text-brand-accent" /> Related Articles
              </h3>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {initialRelatedBlogs.map((rBlog, idx) => (
                <FadeIn key={rBlog.slug} direction="up" delay={idx * 0.1}>
                  <Link
                    href={`/blog/${rBlog.slug}`}
                    onMouseEnter={() => handlePrefetchRelated(rBlog.slug)}
                    className="group p-6 rounded-2xl bg-card-main border border-border-main hover:border-brand-primary/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[220px] shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[9px] font-bold text-text-sub uppercase tracking-wider">
                        <span>{rBlog.category}</span>
                        <span>{rBlog.readTime}</span>
                      </div>
                      <h4 className="font-bold text-text-main group-hover:text-brand-primary transition line-clamp-2 text-sm sm:text-base leading-snug">
                        {rBlog.title}
                      </h4>
                      <p className="text-xs text-text-sub line-clamp-2 leading-relaxed">
                        {rBlog.description}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-border-main flex justify-between items-center text-xs font-semibold text-text-sub">
                      <span>{formatDate(new Date(rBlog.publishedAt))}</span>
                      <span className="text-brand-primary font-bold group-hover:translate-x-1.5 transition duration-200">
                        →
                      </span>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
