import React from "react";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Metadata } from "next";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { queryKeys } from "@/constants/queryKeys";
import ServicesClient from "./ServicesClient";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { getServicesListSchema, getBreadcrumbSchema } from "@/lib/seo";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dhyeybhuva.tech";

export const metadata: Metadata = {
  title: "Freelance Development Services & Technical Consulting | Dhyey Bhuva",
  description: "Explore professional full-stack development services by Dhyey Bhuva: Next.js SaaS MVP development, custom REST & GraphQL APIs, database optimization, cloud architecture, and speed audits.",
  keywords: [
    "Freelance Full Stack Developer",
    "Next.js Development Services",
    "SaaS MVP Development",
    "Backend Architecture Consulting",
    "TypeScript & MongoDB Services",
    "Web Development Freelancer",
  ],
  alternates: {
    canonical: `${baseUrl}/services`,
  },
  openGraph: {
    title: "Freelance Development Services & Technical Consulting | Dhyey Bhuva",
    description: "Startup-grade full stack Next.js web application development and cloud backend engineering services.",
    url: `${baseUrl}/services`,
    type: "website",
    siteName: "Dhyey Bhuva - Freelance Development Services",
    images: [
      {
        url: `${baseUrl}/dhyey.png`,
        alt: "Dhyey Bhuva Freelance Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance Development Services & Consulting | Dhyey Bhuva",
    description: "Full-stack web application development, custom API architectures, and performance engineering.",
    images: [`${baseUrl}/dhyey.png`],
  },
};

export default async function Services() {
  await connectToDatabase();
  const services = await Service.find({}).sort({ order: 1 }).lean();
  const serializedServices = JSON.parse(JSON.stringify(services));

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.services.all(),
    queryFn: async () => serializedServices,
  });

  const servicesListSchema = getServicesListSchema(serializedServices);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
  ]);

  const processSteps = [
    {
      step: "01",
      title: "Discovery & Scope",
      desc: "We align on requirements, draft user journeys, outline core integrations, and finalize pricing contracts.",
    },
    {
      step: "02",
      title: "Architecture & Design",
      desc: "Creating database models, security layouts, caching maps, and visual user interface mockups.",
    },
    {
      step: "03",
      title: "Agile Development",
      desc: "Writing production-grade, type-safe Next.js code with standard test coverages and secure checks.",
    },
    {
      step: "04",
      title: "Optimization & QA",
      desc: "Profiling database indexes, checking API rate-limits, compiling sitemaps, and performing user tests.",
    },
    {
      step: "05",
      title: "Deployment & Support",
      desc: "Deploying to production, configuring analytics tracking, and providing documentation templates.",
    },
  ];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AnalyticsTracker type="service" params={{ slug: "all", name: "All Services" }} />
      <ServicesClient processSteps={processSteps} />
    </HydrationBoundary>
  );
}

