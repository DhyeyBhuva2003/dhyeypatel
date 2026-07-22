import React from "react";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { queryKeys } from "@/constants/queryKeys";
import ServiceDetailsClient from "./ServiceDetailsClient";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { getServiceSchema, getBreadcrumbSchema } from "@/lib/seo";

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
      title: "Service Not Found | Dhyey Bhuva",
      description: "The requested engineering and consulting service could not be found.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dhyeybhuva.tech";
  const canonicalUrl = `${baseUrl}/services/${service.slug}`;
  const title = service.seo?.metaTitle || `${service.title} Services | Dhyey Bhuva`;
  const description = service.seo?.metaDescription || service.description;

  return {
    title,
    description,
    keywords: service.seo?.keywords || service.features || [service.title, "Freelance Engineering", "Web Development"],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Dhyey Bhuva - Freelance Development & Services",
      images: [
        {
          url: `${baseUrl}/dhyey.png`,
          alt: service.title,
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

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dhyeybhuva.tech";

  // Generate Google JSON-LD schemas
  const serviceSchema = getServiceSchema(service);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: service.title, url: `/services/${service.slug}` },
  ]);

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
      {/* Structured Data (JSON-LD) for Service & Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AnalyticsTracker type="service" params={{ slug: service.slug, name: service.title }} />
      <ServiceDetailsClient slug={slug} />
    </HydrationBoundary>
  );
}

