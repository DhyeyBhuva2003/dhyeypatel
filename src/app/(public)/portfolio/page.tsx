import React from "react";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import { queryKeys } from "@/constants/queryKeys";
import PortfolioClient from "./PortfolioClient";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const revalidate = 60; // Cache pages for 1 minute

interface PortfolioProps {
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ searchParams }: PortfolioProps) {
  const { category } = await searchParams;
  let title = "Portfolio & Case Studies | Dhyey Bhuva";
  let description = "Explore a curated selection of full-stack web applications, SaaS platform MVPs, and systems integrations Dhyey Bhuva has shipped.";

  if (category) {
    title = `${category} Portfolio | Dhyey Bhuva`;
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

export default async function Portfolio({ searchParams }: PortfolioProps) {
  const { category: activeCategory } = await searchParams;

  await connectToDatabase();
  
  // 1. Fetch categories for filters
  const allProjects = await Project.find({}).select("category").lean();
  const allCategories = Array.from(new Set(allProjects.map((p) => p.category).filter(Boolean)));

  // 2. Setup QueryClient and prefetch projects list query
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.projects.all({ category: activeCategory }),
    queryFn: async () => {
      const query = activeCategory ? { category: activeCategory } : {};
      const projects = await Project.find(query).sort({ order: 1, createdAt: -1 }).lean();
      return JSON.parse(JSON.stringify(projects));
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnalyticsTracker type="portfolio" />
      <PortfolioClient
        activeCategory={activeCategory}
        allCategories={allCategories}
      />
    </HydrationBoundary>
  );
}
