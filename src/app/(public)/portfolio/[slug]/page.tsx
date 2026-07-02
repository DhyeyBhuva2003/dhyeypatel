import React from "react";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import { queryKeys } from "@/constants/queryKeys";
import PortfolioDetailsClient from "./PortfolioDetailsClient";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProjectBySlug(slug: string) {
  try {
    await connectToDatabase();
    const project = await Project.findOne({ slug }).lean();
    if (!project) return null;
    return JSON.parse(JSON.stringify(project));
  } catch (err) {
    console.error(`Failed to fetch project by slug: ${slug}`, err);
    return null;
  }
}

async function getRelatedProjects(category: string, currentSlug: string) {
  try {
    await connectToDatabase();
    let related = await Project.find({
      slug: { $ne: currentSlug },
      category: category,
    })
      .sort({ order: 1, createdAt: -1 })
      .limit(3)
      .lean();

    if (related.length < 3) {
      const excludedSlugs = [currentSlug, ...related.map((p: any) => p.slug)];
      const additional = await Project.find({
        slug: { $nin: excludedSlugs },
      })
        .sort({ order: 1, createdAt: -1 })
        .limit(3 - related.length)
        .lean();
      related = [...related, ...additional];
    }

    return JSON.parse(JSON.stringify(related));
  } catch (err) {
    console.error("Failed to fetch related projects:", err);
    return [];
  }
}

export async function generateStaticParams() {
  try {
    await connectToDatabase();
    const projects = await Project.find({}).select("slug").lean();
    return projects.map((p: any) => ({
      slug: p.slug,
    }));
  } catch (err) {
    console.error("Failed in generateStaticParams:", err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project case study could not be found.",
    };
  }

  const metaTitle = project.seo?.metaTitle || `${project.title} - Case Study`;
  const metaDesc = project.seo?.metaDescription || project.shortDescription || project.description;

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      images: [
        {
          url: project.imageUrl || "/images/placeholder.jpg",
          alt: project.title,
        },
      ],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = await getRelatedProjects(project.category || "", project.slug);

  // Prefetch details query on server for instant render & hydration
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.projects.detail(slug),
    queryFn: async () => {
      return JSON.parse(JSON.stringify(project));
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnalyticsTracker type="project" params={{ slug: project.slug, name: project.title }} />
      <PortfolioDetailsClient
        slug={slug}
        initialRelatedProjects={JSON.parse(JSON.stringify(relatedProjects))}
      />
    </HydrationBoundary>
  );
}
