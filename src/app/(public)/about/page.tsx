import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGraduationCap, FaBriefcase, FaCode, FaServer, FaCogs, FaBrain } from "react-icons/fa";
import FadeIn from "@/components/FadeIn";

export default function About() {
  const skillCategories = [
    {
      title: "Frontend Engineering",
      icon: <FaCode className="w-5 h-5 text-brand-primary dark:text-brand-accent" />,
      skills: ["React (v19)", "Next.js (App Router)", "TypeScript", "Tailwind CSS v4", "Framer Motion", "HTML5/CSS3"],
    },
    {
      title: "Backend & Systems",
      icon: <FaServer className="w-5 h-5 text-brand-primary dark:text-brand-accent" />,
      skills: ["Node.js", "Express.js", "RESTful APIs", "GraphQL", "JWT Authentication", "Middleware Design"],
    },
    {
      title: "Databases & Storage",
      icon: <FaCogs className="w-5 h-5 text-brand-primary dark:text-brand-accent" />,
      skills: ["MongoDB", "Mongoose", "PostgreSQL", "Redis Caching", "Cloudinary (Media)", "Database Indexing"],
    },
    {
      title: "AI & Emerging Tech",
      icon: <FaBrain className="w-5 h-5 text-brand-primary dark:text-brand-accent" />,
      skills: ["Autonomous AI Agents", "LLM Integrations (OpenAI, Gemini)", "LangChain", "Vector Databases", "Prompt Engineering"],
    },
  ];

  const timelineEvents = [
    {
      type: "work",
      title: "Staff Software Engineer & Consultant",
      organization: "Freelance & Consulting",
      date: "2024 - Present",
      description: "Helping startups ship MVPs, optimizing slow database query pipelines, and integrating intelligent AI agents to automate business workflows.",
    },
    {
      type: "work",
      title: "Senior Full-Stack Engineer",
      organization: "Tech Innovators Lab",
      date: "2022 - 2024",
      description: "Lead developer on SaaS workspace products. Architected Next.js pages, optimized Mongoose models, and lowered server overheads by 30%.",
    },
    {
      type: "education",
      title: "Bachelor of Technology in Computer Science",
      organization: "Gujarat Technological University",
      date: "2019 - 2023",
      description: "Specialized in software architectures, web technologies, database indexing, and distributed systems algorithms.",
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 space-y-28 bg-bg-main text-text-main">
      {/* Introduction Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 relative w-72 h-72 sm:w-80 sm:h-80 lg:w-full lg:aspect-square mx-auto rounded-3xl overflow-hidden shadow-xl border border-border-main bg-bg-sub">
          <FadeIn direction="right">
            <Image
              src="/dhyey.png"
              alt="Dhyey Bhuva portrait"
              fill
              className="object-cover hover:scale-[1.02] transition duration-500"
            />
          </FadeIn>
        </div>
        <div className="lg:col-span-7 space-y-6">
          <FadeIn direction="up">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-text-main leading-tight">
                About Dhyey Bhuva
              </h1>
              <p className="text-lg font-bold text-brand-primary">
                Staff Engineer, Architect, and Tech Content Writer
              </p>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={0.1}>
            <p className="text-text-sub leading-relaxed text-base md:text-lg">
              I am a results-oriented software engineer specializing in building modern web platforms that convert visitors into clients. My philosophy revolves around clean code architecture, absolute security, and high performance.
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={0.15}>
            <p className="text-text-sub leading-relaxed text-base">
              Over the past few years, I&apos;ve worked with several startup founders to design, build, and scale their MVP ideas. Beyond writing code, I publish technical blogs on Next.js 16 APIs and database indexing to help developers sharpen their skill sets.
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex justify-center items-center px-6 py-3 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary/95 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Get in Touch
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Skills Matrix */}
      <section className="space-y-12">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <FadeIn direction="up">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-main leading-tight">
              Engineering Competencies
            </h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.1}>
            <p className="text-sm text-text-sub">
              A comprehensive overview of technologies I use to build enterprise-grade applications.
            </p>
          </FadeIn>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category, idx) => (
            <FadeIn key={idx} direction="up" delay={idx * 0.08}>
              <div
                className="p-6 rounded-2xl bg-card-main border border-border-main space-y-4 hover:scale-[1.02] hover:shadow-md transition-all duration-300 shadow-sm min-h-[220px]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-text-main text-sm sm:text-base tracking-tight">
                    {category.title}
                  </h3>
                </div>
                <ul className="space-y-2 border-t border-border-main pt-3">
                  {category.skills.map((skill, sIdx) => (
                    <li
                      key={sIdx}
                      className="text-xs text-text-sub flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Professional Timeline */}
      <section className="space-y-16 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <FadeIn direction="up">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-main leading-tight">
              Professional Timeline
            </h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.1}>
            <p className="text-sm text-text-sub">
              A glance at my corporate work history and academic background.
            </p>
          </FadeIn>
        </div>

        <div className="relative border-l border-border-main ml-4 space-y-8">
          {timelineEvents.map((event, idx) => (
            <FadeIn key={idx} direction="up" delay={idx * 0.1}>
              <div className="relative pl-8">
                {/* Connector Pin */}
                <div className="absolute -left-[15px] top-1 w-7 h-7 rounded-full bg-bg-main border border-border-main flex items-center justify-center shadow-sm">
                  {event.type === "work" ? (
                    <FaBriefcase className="w-3.5 h-3.5 text-brand-primary" />
                  ) : (
                    <FaGraduationCap className="w-4 h-4 text-brand-primary" />
                  )}
                </div>

                {/* Event Content Card */}
                <div className="p-6 rounded-2xl bg-card-main border border-border-main shadow-sm hover:scale-[1.01] transition-transform duration-300 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-bold text-text-main text-base">
                      {event.title}
                    </h3>
                    <span className="px-2.5 py-1 rounded-xl bg-brand-primary/5 border border-brand-primary/10 text-brand-primary font-bold text-[10px] tracking-wide w-fit">
                      {event.date}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-text-sub uppercase tracking-wider">
                    {event.organization}
                  </div>
                  <p className="text-xs text-text-sub leading-relaxed pt-1">
                    {event.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
