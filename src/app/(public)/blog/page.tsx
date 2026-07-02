import React from "react";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getAllBlogs } from "@/lib/blogs";
import { queryKeys } from "@/constants/queryKeys";
import BlogPageClient from "./BlogPageClient";

export const revalidate = 60; // Cache pages for 1 minute

interface BlogPageProps {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: BlogPageProps) {
  const { category, q } = await searchParams;
  let title = "Technical Publication | Dhyey Bhuva";
  let description = "Detailed engineering write-ups, backend optimizations, and tips on structuring robust Next.js and MongoDB layouts.";

  if (category) {
    title = `${category} Articles | Dhyey Bhuva`;
  }
  if (q) {
    title = `Search Results for "${q}" | Dhyey Bhuva`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category: activeCategory, q: searchQuery, page: pageParam } = await searchParams;
  const currentPage = parseInt(pageParam || "1", 10);
  const limit = 12;

  // 1. Fetch static list for category aggregation
  const allBlogs = await getAllBlogs();
  const categories = Array.from(new Set(allBlogs.map((b) => b.category).filter(Boolean)));

  // 2. Setup QueryClient and prefetch the filtered query on server
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.blogs.all({
      category: activeCategory,
      q: searchQuery,
      page: currentPage,
      limit,
    }),
    queryFn: async () => {
      let filtered = allBlogs;

      if (activeCategory) {
        const catLower = activeCategory.toLowerCase();
        filtered = filtered.filter((b) => b.category?.toLowerCase() === catLower);
      }

      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (b) =>
            b.title?.toLowerCase().includes(queryLower) ||
            b.description?.toLowerCase().includes(queryLower) ||
            b.tags?.some((t) => t.toLowerCase().includes(queryLower))
        );
      }

      const total = filtered.length;
      const startIndex = (currentPage - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);
      const totalPages = Math.ceil(total / limit);

      // Serialize dates properly for client dehydration
      return JSON.parse(
        JSON.stringify({
          blogs: paginated,
          total,
          pages: totalPages,
          page: currentPage,
          limit,
        })
      );
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlogPageClient
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        currentPage={currentPage}
        categories={categories}
      />
    </HydrationBoundary>
  );
}
