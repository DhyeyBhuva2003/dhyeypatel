import React from "react";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { queryKeys } from "@/constants/queryKeys";
import ServicesClient from "./ServicesClient";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const revalidate = 3600;

export const metadata = {
  title: "Freelance Development Services | Dhyey Bhuva",
  description: "Freelance Services personal startup builds, custom SaaS API architectures, system migrations, database designs, and speed improvements.",
  openGraph: {
    title: "Freelance Development Services | Dhyey Bhuva",
    description: "Startup-grade full stack Next.js and backend engineering contract structures.",
    type: "website",
  },
};

export default async function Services() {
  const queryClient = new QueryClient();

  // Prefetch services list query on the server side
  await queryClient.prefetchQuery({
    queryKey: queryKeys.services.all(),
    queryFn: async () => {
      await connectToDatabase();
      const services = await Service.find({}).sort({ order: 1 }).lean();
      return JSON.parse(JSON.stringify(services));
    },
  });

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
      <AnalyticsTracker type="service" params={{ slug: "all", name: "All Services" }} />
      <ServicesClient processSteps={processSteps} />
    </HydrationBoundary>
  );
}
