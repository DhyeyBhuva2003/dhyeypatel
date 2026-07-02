"use client";

import React from "react";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import * as FaIcons from "react-icons/fa";
import { useServices } from "@/hooks/useServices";
import FadeIn from "@/components/FadeIn";
import { ServiceListSkeleton } from "@/components/ui/Skeletons";
import ErrorState from "@/components/ui/ErrorState";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import axios from "axios";

interface ServicesClientProps {
  processSteps: { step: string; title: string; desc: string }[];
}

// Helper to map icon string to React Icon component dynamically
function getIconComponent(iconName: string) {
  let formattedName = iconName;
  if (iconName && !iconName.startsWith("Fa")) {
    formattedName = "Fa" + iconName.charAt(0).toUpperCase() + iconName.slice(1);
  }
  const IconComponent = (FaIcons as any)[formattedName];
  if (IconComponent) {
    return <IconComponent className="w-6 h-6 text-brand-primary dark:text-brand-accent" />;
  }
  return <FaIcons.FaDatabase className="w-6 h-6 text-brand-primary dark:text-brand-accent" />;
}

export default function ServicesClient({ processSteps }: ServicesClientProps) {
  const { data: services = [], isLoading, isError, refetch } = useServices();
  const queryClient = useQueryClient();

  const handlePrefetchService = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.services.detail(slug),
      queryFn: async () => {
        const { data } = await axios.get("/api/services", {
          params: { slug },
        });
        return data.data;
      },
      staleTime: 60 * 1000,
    });
  };

  if (isError) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 text-center">
        <ErrorState onRetry={refetch} message="Failed to load development services." />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 space-y-32 bg-bg-main text-text-main">
      {/* Page Header */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <FadeIn direction="up">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-text-main">
            Freelance Services & Solutions
          </h1>
        </FadeIn>
        <FadeIn direction="up" delay={0.1}>
          <p className="text-lg text-text-sub leading-relaxed">
            From drafting initial specifications to scaling application layers, I supply Stafford-grade technical consultancy for startup products.
          </p>
        </FadeIn>
      </section>

      {/* Services Detailed List */}
      <section className="space-y-8">
        {isLoading ? (
          <ServiceListSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service: any, idx: number) => (
              <FadeIn key={service._id.toString()} direction="up" delay={idx * 0.1}>
                <div
                  id={service.slug}
                  className="p-8 rounded-2xl bg-card-main border border-border-main hover:border-brand-primary/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between shadow-sm min-h-[480px]"
                >
                  <div className="space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 flex items-center justify-center border border-brand-primary/10">
                      {getIconComponent(service.icon)}
                    </div>
                    <div className="space-y-2">
                      <Link
                        href={`/services/${service.slug}`}
                        onMouseEnter={() => handlePrefetchService(service.slug)}
                        className="block hover:text-brand-primary transition duration-200"
                      >
                        <h2 className="text-2xl font-bold text-text-main tracking-tight">
                          {service.title}
                        </h2>
                      </Link>
                      <p className="text-xs text-text-sub leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    </div>
                    
                    <ul className="space-y-3 border-t border-border-main pt-5">
                      {service.features.slice(0, 4).map((feature: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs text-text-sub">
                          <FaCheckCircle className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8 mt-8 border-t border-border-main flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-text-sub uppercase tracking-wider font-bold">Starting at</span>
                      <span className="text-xl font-extrabold text-text-main">{service.price}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/services/${service.slug}`}
                        onMouseEnter={() => handlePrefetchService(service.slug)}
                        className="text-xs font-bold text-text-sub hover:text-brand-primary transition"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/contact?subject=${encodeURIComponent(`Inquiry regarding ${service.title}`)}`}
                        className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs hover:scale-[1.02] transition"
                      >
                        Get Started
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      {/* Process Lifecycle */}
      <section className="space-y-16">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <FadeIn direction="up">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-main">
              How I Deliver Value
            </h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.1}>
            <p className="text-sm text-text-sub">
              A linear, milestone-driven development process designed to launch products on time.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {processSteps.map((step, idx) => (
            <FadeIn key={idx} direction="up" delay={idx * 0.1}>
              <div className="p-6 rounded-2xl bg-bg-sub border border-border-main relative space-y-4 hover:scale-[1.02] transition-transform duration-300 shadow-sm">
                <div className="text-4xl font-black text-brand-primary/10 dark:text-brand-accent/10 absolute right-6 top-4">
                  {step.step}
                </div>
                <h3 className="font-bold text-text-main text-base pt-2">
                  {step.title}
                </h3>
                <p className="text-xs text-text-sub leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
