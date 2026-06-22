import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaArrowLeft,
  FaBriefcase,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaBuilding,
  FaChevronRight,
  FaTools,
} from "react-icons/fa";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import ProjectGallery from "@/components/ProjectGallery";
import FadeIn from "@/components/FadeIn";

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
  const galleryImages =
    project.gallery && project.gallery.length > 0
      ? project.gallery
      : [{ image: project.imageUrl, alt: project.title }];

  const challenges = project.challenges || [];
  const solutions = project.solutions || [];
  const maxPairs = Math.max(challenges.length, solutions.length);

  return (
    <div className="min-h-screen bg-bg-main text-text-main pb-24 transition-colors duration-250">
      {/* Top Navigation */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8">
        <FadeIn direction="up">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-sub hover:text-brand-primary transition group mb-6"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Portfolio
          </Link>
        </FadeIn>

        {/* Breadcrumbs */}
        <FadeIn direction="up" delay={0.05}>
          <nav className="flex items-center gap-2 text-xs text-text-sub mb-8 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-brand-primary transition">
              Home
            </Link>
            <FaChevronRight size={8} />
            <Link href="/portfolio" className="hover:text-brand-primary transition">
              Portfolio
            </Link>
            <FaChevronRight size={8} />
            <span className="text-text-main font-medium truncate">{project.title}</span>
          </nav>
        </FadeIn>
      </div>

      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12">
        <FadeIn direction="up" delay={0.1}>
          <div className="bg-bg-sub border border-border-main p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-sm flex flex-col lg:flex-row gap-10 items-center justify-between">
            {/* Subtle Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            {/* Hero Left Content */}
            <div className="space-y-6 max-w-xl lg:max-w-2xl flex-1">
              <div className="flex flex-wrap gap-2 items-center">
                {project.category && (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-primary/5 text-brand-primary">
                    {project.category}
                  </span>
                )}
                {project.projectType && (
                  <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-bg-main border border-border-main text-text-sub">
                    {project.projectType}
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    project.status === "Completed"
                      ? "bg-brand-success/5 text-brand-success border-brand-success/20"
                      : "bg-brand-warning/5 text-brand-warning border-brand-warning/20"
                  }`}
                >
                  {project.status || "Completed"}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-main leading-tight">
                {project.title}
              </h1>

              <p className="text-base md:text-lg text-text-sub leading-relaxed">
                {project.shortDescription || project.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white font-bold transition duration-200 text-sm hover:scale-[1.02]"
                  >
                    <FaExternalLinkAlt size={13} />
                    Live Demonstration
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card-main hover:bg-bg-sub text-text-main border border-border-main font-bold transition duration-200 text-sm hover:scale-[1.02]"
                  >
                    <FaGithub size={15} />
                    Source Code
                  </a>
                )}
              </div>
            </div>

            {/* Hero Right Image Panel */}
            <div className="relative aspect-video w-full lg:w-[420px] xl:w-[500px] overflow-hidden rounded-2xl bg-bg-sub border border-border-main shadow-lg">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                priority
                className="object-cover hover:scale-[1.02] transition duration-500"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Main Content Layout Grid */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Columns - Narrative */}
        <div className="lg:col-span-2 space-y-12">
          {/* Narrative Content */}
          <FadeIn direction="up" delay={0.15}>
            <div className="bg-card-main border border-border-main p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-text-main border-b border-border-main pb-3">
                Project Narrative
              </h2>
              {project.fullDescription ? (
                <p className="text-text-sub leading-relaxed text-base md:text-lg">
                  {project.fullDescription}
                </p>
              ) : null}
              
              {project.content && (
                <div className="mt-4">
                  <MarkdownRenderer content={project.content} />
                </div>
              )}
            </div>
          </FadeIn>

          {/* Features Grid */}
          {project.features && project.features.length > 0 && (
            <FadeIn direction="up">
              <div className="bg-card-main border border-border-main p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
                <h2 className="text-2xl font-bold text-text-main border-b border-border-main pb-3">
                  Key Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.features.map((feature: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex gap-3 items-start p-3.5 rounded-xl border border-border-main hover:border-brand-primary/20 hover:bg-brand-primary/[0.02] transition-all duration-300"
                    >
                      <FaCheckCircle className="text-brand-primary dark:text-brand-accent mt-1 flex-shrink-0" size={15} />
                      <span className="text-sm md:text-base text-text-main font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Screenshots Gallery */}
          <FadeIn direction="up">
            <div className="bg-card-main border border-border-main p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-text-main border-b border-border-main pb-3">
                Interface & Experience Gallery
              </h2>
              <ProjectGallery images={galleryImages} />
            </div>
          </FadeIn>

          {/* Challenges & Solutions */}
          {maxPairs > 0 && (
            <FadeIn direction="up">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-text-main px-2">
                  Engineering Challenges & Solutions
                </h2>
                <div className="space-y-6">
                  {Array.from({ length: maxPairs }).map((_, idx) => {
                    const challenge = challenges[idx];
                    const solution = solutions[idx];

                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1.5 rounded-2xl border border-border-main bg-bg-sub/40"
                      >
                        {challenge && (
                          <div className="bg-card-main border border-brand-error/20 p-6 rounded-xl flex flex-col gap-3 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-2 text-brand-error font-bold text-xs uppercase tracking-wider">
                              <FaExclamationTriangle className="flex-shrink-0" />
                              Challenge #{idx + 1}
                            </div>
                            <p className="text-sm md:text-base text-text-main leading-relaxed font-medium">
                              {challenge}
                            </p>
                          </div>
                        )}
                        {solution && (
                          <div className="bg-card-main border border-brand-success/20 p-6 rounded-xl flex flex-col gap-3 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-2 text-brand-success font-bold text-xs uppercase tracking-wider">
                              <FaLightbulb className="flex-shrink-0" />
                              Solution Response
                            </div>
                            <p className="text-sm md:text-base text-text-main leading-relaxed font-medium">
                              {solution}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>
          )}
        </div>

        {/* Right Column - Project Specs (Sticky Card) */}
        <div className="space-y-6">
          <FadeIn direction="up" delay={0.2}>
            <div className="lg:sticky lg:top-24 bg-card-main border border-border-main p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-text-main border-b border-border-main pb-3 flex items-center gap-2">
                <FaBriefcase className="text-brand-primary dark:text-brand-accent" />
                Project Specifications
              </h3>

              {/* Quick Details List */}
              <div className="space-y-4 text-sm">
                {project.clientName && (
                  <div className="flex items-center justify-between py-2 border-b border-border-main">
                    <span className="text-text-sub font-medium flex items-center gap-1.5">
                      <FaBuilding size={12} /> Client
                    </span>
                    <span className="text-text-main font-semibold">{project.clientName}</span>
                  </div>
                )}
                {project.industry && (
                  <div className="flex items-center justify-between py-2 border-b border-border-main">
                    <span className="text-text-sub font-medium flex items-center gap-1.5">
                      <FaBriefcase size={12} /> Industry
                    </span>
                    <span className="text-text-main font-semibold">{project.industry}</span>
                  </div>
                )}
                {project.duration && (
                  <div className="flex items-center justify-between py-2 border-b border-border-main">
                    <span className="text-text-sub font-medium flex items-center gap-1.5">
                      <FaCalendarAlt size={12} /> Duration
                    </span>
                    <span className="text-text-main font-semibold">{project.duration}</span>
                  </div>
                )}
                {project.projectType && (
                  <div className="flex items-center justify-between py-2 border-b border-border-main">
                    <span className="text-text-sub font-medium flex items-center gap-1.5">
                      <FaClock size={12} /> Type
                    </span>
                    <span className="text-text-main font-semibold">{project.projectType}</span>
                  </div>
                )}
              </div>

              {/* Technologies Grid */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-sub flex items-center gap-1.5">
                    <FaTools size={10} /> Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-bg-sub border border-border-main text-text-main hover:scale-105 transition-transform cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sticky Action buttons */}
              <div className="space-y-3 pt-4 border-t border-border-main">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white font-bold shadow-md transition duration-200 text-sm hover:scale-[1.02]"
                  >
                    <FaExternalLinkAlt size={13} />
                    Live Preview
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card-main hover:bg-bg-sub text-text-main border border-border-main font-bold transition duration-200 text-sm hover:scale-[1.02]"
                  >
                    <FaGithub size={15} />
                    GitHub Codebase
                  </a>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 mt-20 pt-12 border-t border-border-main">
          <FadeIn direction="up">
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-main mb-8">
              Explore Other Case Studies
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProjects.map((relProject: any, idx: number) => (
              <FadeIn key={relProject._id} direction="up" delay={idx * 0.1}>
                <div className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-card-main border border-border-main hover:border-brand-primary/30 hover:scale-[1.01] hover:shadow-xl transition-all duration-300 min-h-[380px] shadow-sm">
                  <div>
                    <div className="relative aspect-video w-full overflow-hidden bg-bg-sub border-b border-border-main">
                      <Image
                        src={relProject.imageUrl || "/images/placeholder.jpg"}
                        alt={relProject.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-500"
                        sizes="(max-width: 768px) 100vw, 350px"
                      />
                    </div>
                    <div className="p-6 space-y-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                        {relProject.category || "Case Study"}
                      </span>
                      <h3 className="text-lg font-bold text-text-main leading-snug line-clamp-1 group-hover:text-brand-primary transition">
                        {relProject.title}
                      </h3>
                      <p className="text-xs text-text-sub leading-relaxed line-clamp-3">
                        {relProject.shortDescription || relProject.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-2 border-t border-border-main flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {relProject.githubUrl && (
                        <a
                          href={relProject.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-sub hover:text-brand-primary transition"
                        >
                          <FaGithub size={16} />
                        </a>
                      )}
                      {relProject.demoUrl && (
                        <a
                          href={relProject.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-sub hover:text-brand-primary transition"
                        >
                          <FaExternalLinkAlt size={13} />
                        </a>
                      )}
                    </div>
                    <Link
                      href={`/portfolio/${relProject.slug}`}
                      className="text-xs font-bold text-brand-primary dark:text-brand-accent hover:underline inline-flex items-center gap-1 group/link"
                    >
                      View Details
                      <FaChevronRight size={7} className="group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
