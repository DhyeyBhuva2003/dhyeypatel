import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft, FaCalendarAlt, FaClock, FaTag, FaBookOpen } from "react-icons/fa";
import { getBlogBySlug, getRelatedBlogs } from "@/lib/blogs";
import { formatDate } from "@/lib/utils";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getBlogPostingSchema } from "@/lib/seo";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import ShareButtons from "@/components/ShareButtons";
import FadeIn from "@/components/FadeIn";
import AnalyticsTracker from "@/components/AnalyticsTracker";

interface BlogDetailsProps {
  params: Promise<{ slug: string }>;
}

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

export default async function BlogDetails({ params }: BlogDetailsProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = await getRelatedBlogs(blog.slug, blog.tags);
  const blogSchema = getBlogPostingSchema({
    title: blog.title,
    description: blog.description,
    slug: blog.slug,
    publishedAt: blog.publishedAt,
    imageUrl: blog.imageUrl,
  });

  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://dhyeybhuva.com"}/blog/${blog.slug}`;

  return (
    <div className="min-h-screen bg-bg-main text-text-main pb-24 transition-colors duration-250">
      <AnalyticsTracker type="blog" params={{ slug: blog.slug, name: blog.title }} />
      {/* Scroll-Linked Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Google Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 space-y-12">
        {/* Back to Blog */}
        <FadeIn direction="up">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-sub hover:text-brand-primary transition group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Articles
          </Link>
        </FadeIn>

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
                  <span>Published {formatDate(blog.publishedAt)}</span>
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
              {blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
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
        {relatedBlogs.length > 0 && (
          <section className="pt-12 border-t border-border-main space-y-8">
            <FadeIn direction="up">
              <h3 className="text-2xl font-bold text-text-main flex items-center gap-2">
                <FaBookOpen className="text-brand-primary dark:text-brand-accent" /> Related Articles
              </h3>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((rBlog, idx) => (
                <FadeIn key={rBlog.slug} direction="up" delay={idx * 0.1}>
                  <Link
                    href={`/blog/${rBlog.slug}`}
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
                      <span>{formatDate(rBlog.publishedAt)}</span>
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
