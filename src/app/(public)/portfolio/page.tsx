import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";

export const revalidate = 3600;

interface PortfolioProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function Portfolio({ searchParams }: PortfolioProps) {
  let projects: any[] = [];
  let allTags: string[] = [];
  
  // Await searchParams as required by Next.js 16
  const { tag: activeTag } = await searchParams;

  try {
    await connectToDatabase();
    
    // Get unique tags from all projects for filters
    const allProjects = await Project.find({}).select("tags").lean();
    allTags = Array.from(new Set(allProjects.flatMap((p) => p.tags)));

    // Fetch filtered projects
    const query = activeTag ? { tags: activeTag } : {};
    projects = await Project.find(query).sort({ order: 1, createdAt: -1 }).lean();
  } catch (err) {
    console.error("Failed to query projects for Portfolio page:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-12">
      {/* Header */}
      <section className="space-y-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Project Portfolio
        </h1>
        <p className="text-lg text-zinc-650 dark:text-zinc-400 leading-relaxed">
          Explore a curated selection of full-stack web applications, SaaS platform MVPs, and systems integrations I&apos;ve shipped.
        </p>
      </section>

      {/* Filter Buttons */}
      <section className="flex flex-wrap gap-2 pt-2">
        <Link
          href="/portfolio"
          className={`px-4.5 py-2 rounded-full text-xs font-semibold border transition ${
            !activeTag
              ? "bg-purple-600 text-white border-purple-650"
              : "border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-55/10 dark:hover:bg-zinc-900/40"
          }`}
        >
          All Projects
        </Link>
        {allTags.map((tag) => (
          <Link
            key={tag}
            href={`/portfolio?tag=${encodeURIComponent(tag)}`}
            className={`px-4.5 py-2 rounded-full text-xs font-semibold border transition ${
              activeTag === tag
                ? "bg-purple-600 text-white border-purple-650"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-55/10 dark:hover:bg-zinc-900/40"
            }`}
          >
            {tag}
          </Link>
        ))}
      </section>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <section className="py-20 text-center space-y-3">
          <p className="text-zinc-500">No projects found for active filter.</p>
          <Link href="/portfolio" className="text-sm font-semibold text-purple-650 hover:underline">
            Clear Filters
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project._id.toString()}
              className="group overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-300"
            >
              {/* Cover Image */}
              <div className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition duration-500"
                  />
                </div>
                
                {/* Info */}
                <div className="px-6 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {project.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed line-clamp-4">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Action Links */}
              <div className="p-6 border-t border-zinc-100 dark:border-zinc-850 mt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
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
                      className="text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
                      title="Visit Live Application"
                    >
                      <FaExternalLinkAlt size={15} />
                    </a>
                  )}
                </div>
                
                {/* Details layout toggle helper */}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Active Project
                </span>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
