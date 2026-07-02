"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { usePortfolio } from "@/hooks/usePortfolio";
import FadeIn from "@/components/FadeIn";
import { PortfolioListSkeleton } from "@/components/ui/Skeletons";
import ErrorState from "@/components/ui/ErrorState";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import axios from "axios";

interface PortfolioClientProps {
  activeCategory?: string;
  allCategories: string[];
}

export default function PortfolioClient({
  activeCategory,
  allCategories,
}: PortfolioClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, isError, refetch } = usePortfolio({
    category: activeCategory,
  });

  // Prefetch project detail on hover
  const handlePrefetchProject = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.projects.detail(slug),
      queryFn: async () => {
        const { data } = await axios.get("/api/projects", {
          params: { slug },
        });
        return data.data;
      },
      staleTime: 60 * 1000,
    });
  };

  const handleCategoryClick = (cat?: string) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 text-center">
        <ErrorState onRetry={refetch} message="Failed to load project portfolio." />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 space-y-12 bg-bg-main text-text-main">
      {/* Header */}
      <section className="space-y-4 max-w-3xl">
        <FadeIn direction="up">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-main leading-tight">
            Project Portfolio & Case Studies
          </h1>
        </FadeIn>
        <FadeIn direction="up" delay={0.1}>
          <p className="text-lg text-text-sub leading-relaxed">
            Explore a curated selection of full-stack web applications, SaaS platform MVPs, and systems integrations I&apos;ve shipped.
          </p>
        </FadeIn>
      </section>

      {/* Category Filter */}
      <FadeIn direction="up" delay={0.2}>
        <section className="space-y-2.5 pt-2 pb-4">
          <span className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-text-sub/70">
            Filter by Category
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryClick()}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition duration-200 cursor-pointer ${
                !activeCategory
                  ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/10"
                  : "border-border-main bg-card-main/30 text-text-sub hover:bg-bg-sub hover:text-text-main"
              }`}
            >
              All Projects
            </button>
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition duration-200 cursor-pointer ${
                  activeCategory === category
                    ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/10"
                    : "border-border-main bg-card-main/30 text-text-sub hover:bg-bg-sub hover:text-text-main"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Loading Skeletons */}
      {isLoading ? (
        <PortfolioListSkeleton />
      ) : projects.length === 0 ? (
        <section className="py-20 text-center space-y-3">
          <p className="text-text-sub">No projects found matching the selected filters.</p>
          <button
            onClick={() => router.push(pathname)}
            className="text-sm font-semibold text-brand-primary hover:underline cursor-pointer bg-transparent border-0"
          >
            Clear Filters
          </button>
        </section>
      ) : (
        /* Projects Grid */
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project: any, idx: number) => (
            <FadeIn key={project._id.toString()} direction="up" delay={idx * 0.05}>
              <div
                onMouseEnter={() => handlePrefetchProject(project.slug)}
                className="group overflow-hidden rounded-2xl bg-card-main border border-border-main hover:border-brand-primary/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[440px] shadow-sm"
              >
                {/* Cover Image */}
                <div className="space-y-4">
                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="block relative aspect-video w-full overflow-hidden bg-bg-sub border-b border-border-main"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-[1.04] transition duration-500"
                        loading="lazy"
                      />
                    </div>
                    {project.category && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-bg-main/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-brand-accent border border-border-main">
                        {project.category}
                      </span>
                    )}
                  </Link>
                  
                  {/* Info */}
                  <div className="px-6 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag: string, tIdx: number) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-bg-sub border border-border-main text-text-sub"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/portfolio/${project.slug}`}
                      className="block group-hover:text-brand-primary transition duration-200"
                    >
                      <h3 className="text-xl font-bold text-text-main leading-snug">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-text-sub leading-relaxed line-clamp-4">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Action Links */}
                <div className="p-6 border-t border-border-main mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-sub hover:text-brand-primary transition"
                        title="View GitHub Repository"
                      >
                        <FaGithub size={18} />
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-sub hover:text-brand-primary transition"
                        title="Visit Live Application"
                      >
                        <FaExternalLinkAlt size={14} />
                      </a>
                    )}
                  </div>
                  
                  {/* View Details Link */}
                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="text-xs font-bold text-brand-primary dark:text-brand-accent hover:underline flex items-center gap-1 group/btn"
                  >
                    Read Case Study
                    <span className="group-hover/btn:translate-x-0.5 transition-transform inline-block">→</span>
                  </Link>
                </div>
              </div>
            </FadeIn>
          ))}
        </section>
      )}
    </div>
  );
}
