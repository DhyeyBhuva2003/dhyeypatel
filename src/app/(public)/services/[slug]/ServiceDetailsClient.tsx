"use client";

import React from "react";
import Link from "next/link";
import { FaArrowLeft, FaCheckCircle, FaChevronRight } from "react-icons/fa";
import * as FaIcons from "react-icons/fa";
import { useServiceDetails } from "@/hooks/useServices";
import FadeIn from "@/components/FadeIn";
import { ServiceDetailsSkeleton } from "@/components/ui/Skeletons";
import ErrorState from "@/components/ui/ErrorState";

interface ServiceDetailsClientProps {
  slug: string;
}

function getIconComponent(iconName: string) {
  let formattedName = iconName;
  if (iconName && !iconName.startsWith("Fa")) {
    formattedName = "Fa" + iconName.charAt(0).toUpperCase() + iconName.slice(1);
  }
  const IconComponent = (FaIcons as any)[formattedName];
  if (IconComponent) {
    return <IconComponent className="w-8 h-8 text-brand-primary dark:text-brand-accent" />;
  }
  return <FaIcons.FaDatabase className="w-8 h-8 text-brand-primary dark:text-brand-accent" />;
}

export default function ServiceDetailsClient({ slug }: ServiceDetailsClientProps) {
  const { data: service, isLoading, isError, refetch } = useServiceDetails(slug);

  if (isLoading) {
    return <ServiceDetailsSkeleton />;
  }

  if (isError || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState
          onRetry={refetch}
          message="Failed to load service details. It might have been removed."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main text-text-main pb-24 transition-colors duration-250">
      {/* Top Navigation */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-8">
        <FadeIn direction="up">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-sub hover:text-brand-primary transition group mb-6"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Services
          </Link>
        </FadeIn>

        {/* Breadcrumbs */}
        <FadeIn direction="up" delay={0.05}>
          <nav className="flex items-center gap-2 text-xs text-text-sub mb-8 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-brand-primary transition">
              Home
            </Link>
            <FaChevronRight size={8} />
            <Link href="/services" className="hover:text-brand-primary transition">
              Services
            </Link>
            <FaChevronRight size={8} />
            <span className="text-text-main font-medium truncate">{service.title}</span>
          </nav>
        </FadeIn>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 pb-12 space-y-12">
        {/* Main Card */}
        <FadeIn direction="up" delay={0.1}>
          <div className="p-8 sm:p-12 rounded-3xl border border-border-main bg-card-main flex flex-col md:flex-row gap-10 justify-between items-start shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="space-y-6 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/5 flex items-center justify-center border border-brand-primary/10">
                {getIconComponent(service.icon)}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight leading-tight">
                  {service.title}
                </h1>
                <p className="text-base text-text-sub leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Features List */}
              {service.features && service.features.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-sub">
                    What is Included
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.features.map((feature: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-xl border border-border-main bg-bg-sub/30"
                      >
                        <FaCheckCircle className="text-brand-success mt-0.5 shrink-0" size={15} />
                        <span className="text-xs text-text-main font-medium leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Pricing Side Panel */}
            <div className="w-full md:w-72 p-6 rounded-2xl bg-bg-sub border border-border-main flex flex-col gap-6 shrink-0 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-text-sub uppercase tracking-wider font-bold">
                  Starting Investment
                </span>
                <div className="text-3xl font-black text-text-main">{service.price}</div>
              </div>
              
              <div className="text-xs text-text-sub leading-relaxed">
                Prices depend on project complexity, scope, integrations, and delivery timelines. Let&apos;s talk to design a package for your business.
              </div>

              <Link
                href={`/contact?subject=${encodeURIComponent(`Inquiry regarding ${service.title}`)}`}
                className="w-full inline-flex items-center justify-center py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-sm shadow-md transition hover:scale-[1.02]"
              >
                Inquire & Start Build
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
