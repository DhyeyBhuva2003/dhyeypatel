import React from "react";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getBlogBySlug, getRelatedBlogs } from "@/lib/blogs";
import { getBlogPostingSchema } from "@/lib/seo";
import { queryKeys } from "@/constants/queryKeys";
import BlogDetailsClient from "./BlogDetailsClient";

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
  
  // 1. Fetch initial server-side query data for SEO
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

  // 2. Setup QueryClient and prefetch details query
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.blogs.detail(slug),
    queryFn: async () => {
      return JSON.parse(JSON.stringify(blog));
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Google Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <BlogDetailsClient
        slug={slug}
        initialRelatedBlogs={JSON.parse(JSON.stringify(relatedBlogs))}
      />
    </HydrationBoundary>
  );
}
