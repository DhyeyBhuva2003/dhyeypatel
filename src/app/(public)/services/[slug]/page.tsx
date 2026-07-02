import React from "react";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { queryKeys } from "@/constants/queryKeys";
import ServiceDetailsClient from "./ServiceDetailsClient";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getServiceBySlug(slug: string) {
  try {
    await connectToDatabase();
    const service = await Service.findOne({ slug }).lean();
    if (!service) return null;
    return JSON.parse(JSON.stringify(service));
  } catch (err) {
    console.error(`Failed to fetch service by slug: ${slug}`, err);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    await connectToDatabase();
    const services = await Service.find({}).select("slug").lean();
    return services.map((s: any) => ({
      slug: s.slug,
    }));
  } catch (err) {
    console.error("Failed in generateStaticParams for Services:", err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found",
      description: "The requested consulting service could not be found.",
    };
  }

  return {
    title: `${service.title} | Dhyey Bhuva`,
    description: service.description,
    openGraph: {
      title: `${service.title} | Dhyey Bhuva`,
      description: service.description,
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  // Prefetch details query on server for hydration
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.services.detail(slug),
    queryFn: async () => {
      return JSON.parse(JSON.stringify(service));
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnalyticsTracker type="service" params={{ slug: service.slug, name: service.title }} />
      <ServiceDetailsClient slug={slug} />
    </HydrationBoundary>
  );
}
