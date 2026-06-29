import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import FadeIn from "@/components/FadeIn";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const revalidate = 3600;

interface PortfolioProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Portfolio({ searchParams }: PortfolioProps) {
  let projects: any[] = [];
  let allCategories: string[] = [];
  
  // Await searchParams as required by Next.js 16
  const { category: activeCategory } = await searchParams;

  try {
    await connectToDatabase();
    
    // Get unique categories from all projects for filters
    const allProjects = await Project.find({}).select("category").lean();
    allCategories = Array.from(new Set(allProjects.map((p) => p.category).filter(Boolean)));

    // Fetch filtered projects based on activeCategory
    const query = activeCategory ? { category: activeCategory } : {};
    
    projects = await Project.find(query).sort({ order: 1, createdAt: -1 }).lean();
  } catch (err) {
    console.error("Failed to query projects for Portfolio page:", err);
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 space-y-12 bg-bg-main text-text-main">
      <AnalyticsTracker type="portfolio" />
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
            <Link
              href="/portfolio"
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition duration-200 ${
                !activeCategory
                  ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/10"
                  : "border-border-main bg-card-main/30 text-text-sub hover:bg-bg-sub hover:text-text-main"
              }`}
            >
              All Projects
            </Link>
            {allCategories.map((category) => (
              <Link
                key={category}
                href={`/portfolio?category=${encodeURIComponent(category)}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition duration-200 ${
                  activeCategory === category
                    ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/10"
                    : "border-border-main bg-card-main/30 text-text-sub hover:bg-bg-sub hover:text-text-main"
                }`}
              >
                {category}
              </Link>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <section className="py-20 text-center space-y-3">
          <p className="text-text-sub">No projects found matching the selected filters.</p>
          <Link href="/portfolio" className="text-sm font-semibold text-brand-primary hover:underline">
            Clear Filters
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <FadeIn key={project._id.toString()} direction="up" delay={idx * 0.05}>
              <div className="group overflow-hidden rounded-2xl bg-card-main border border-border-main hover:border-brand-primary/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[440px] shadow-sm">
                {/* Cover Image */}
                <div className="space-y-4">
                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="block relative aspect-video w-full overflow-hidden bg-bg-sub border-b border-border-main"
                  >
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-[1.04] transition duration-500"
                    />
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
