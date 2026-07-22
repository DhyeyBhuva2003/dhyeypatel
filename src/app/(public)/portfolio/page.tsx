import React from "react";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Metadata } from "next";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import { queryKeys } from "@/constants/queryKeys";
import PortfolioClient from "./PortfolioClient";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { getProjectsListSchema, getBreadcrumbSchema } from "@/lib/seo";

export const revalidate = 60; // Cache pages for 1 minute

interface PortfolioProps {
  searchParams: Promise<{ category?: string }>;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dhyeybhuva.tech";

export async function generateMetadata({ searchParams }: PortfolioProps): Promise<Metadata> {
  const { category } = await searchParams;
  let title = "Portfolio & Software Engineering Case Studies | Dhyey Bhuva";
  let description = "Explore a curated portfolio of full-stack web applications, SaaS platform MVPs, custom API solutions, and backend architectures built by Dhyey Bhuva.";

  if (category) {
    title = `${category} Projects Portfolio | Dhyey Bhuva`;
    description = `Explore ${category} software case studies and full-stack web engineering projects by Dhyey Bhuva.`;
  }

  const canonicalUrl = category ? `${baseUrl}/portfolio?category=${encodeURIComponent(category)}` : `${baseUrl}/portfolio`;

  return {
    title,
    description,
    keywords: [
      "Software Portfolio",
      "Next.js Case Studies",
      "Full Stack Development Projects",
      "SaaS MVP Portfolio",
      "Web Development Work",
      "Dhyey Bhuva Portfolio",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Dhyey Bhuva - Portfolio & Case Studies",
      images: [
        {
          url: `${baseUrl}/dhyey.png`,
          alt: "Dhyey Bhuva Portfolio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/dhyey.png`],
    },
  };
}

export default async function Portfolio({ searchParams }: PortfolioProps) {
  const { category: activeCategory } = await searchParams;

  await connectToDatabase();
  
  // 1. Fetch categories for filters
  const allProjects = await Project.find({}).sort({ order: 1, createdAt: -1 }).lean();
  const serializedProjects = JSON.parse(JSON.stringify(allProjects));
  const allCategories = Array.from(new Set(allProjects.map((p) => p.category).filter(Boolean))) as string[];

  // 2. Setup QueryClient and prefetch projects list query
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.projects.all({ category: activeCategory }),
    queryFn: async () => {
      if (!activeCategory) return serializedProjects;
      return serializedProjects.filter((p: any) => p.category === activeCategory);
    },
  });

  const projectsListSchema = getProjectsListSchema(serializedProjects);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Portfolio", url: "/portfolio" },
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AnalyticsTracker type="portfolio" />
      <PortfolioClient
        activeCategory={activeCategory}
        allCategories={allCategories}
      />
    </HydrationBoundary>
  );
}

