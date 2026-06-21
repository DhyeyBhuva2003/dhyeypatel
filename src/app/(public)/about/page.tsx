import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGraduationCap, FaBriefcase, FaCode, FaServer, FaCogs, FaBrain } from "react-icons/fa";

export default function About() {
  const skillCategories = [
    {
      title: "Frontend Engineering",
      icon: <FaCode className="w-5 h-5 text-purple-500" />,
      skills: ["React (v19)", "Next.js (App Router)", "TypeScript", "Tailwind CSS v4", "Framer Motion", "HTML5/CSS3"],
    },
    {
      title: "Backend & Systems",
      icon: <FaServer className="w-5 h-5 text-purple-500" />,
      skills: ["Node.js", "Express.js", "RESTful APIs", "GraphQL", "JWT Authentication", "Middleware Design"],
    },
    {
      title: "Databases & Storage",
      icon: <FaCogs className="w-5 h-5 text-purple-500" />,
      skills: ["MongoDB", "Mongoose", "PostgreSQL", "Redis Caching", "Cloudinary (Media)", "Database Indexing"],
    },
    {
      title: "AI & Emerging Tech",
      icon: <FaBrain className="w-5 h-5 text-purple-500" />,
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
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-20">
      {/* Introduction Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 relative w-72 h-72 sm:w-85 sm:h-85 lg:w-full lg:aspect-square mx-auto rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900">
          <Image
            src="/dhyey.png"
            alt="Dhyey Bhuva portrait"
            fill
            className="object-cover"
          />
        </div>
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              About Dhyey Bhuva
            </h1>
            <p className="text-lg font-medium text-purple-600 dark:text-purple-400">
              Staff Engineer, Architect, and Tech Content Writer
            </p>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base md:text-lg">
            I am a results-oriented software engineer specializing in building modern web platforms that convert visitors into clients. My philosophy revolves around clean code architecture, absolute security, and high performance.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base">
            Over the past few years, I&apos;ve worked with several startup founders to design, build, and scale their MVP ideas. Beyond writing code, I publish technical blogs on Next.js 16 APIs and database indexing to help developers sharpen their skill sets.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex justify-center items-center px-6 py-3 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 transition"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Skills Matrix */}
      <section className="space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Engineering Competencies
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            A comprehensive overview of technologies I use to build enterprise-grade applications.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/25 border border-zinc-200/50 dark:border-zinc-800/40 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-950/40">
                  {category.icon}
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                  {category.title}
                </h3>
              </div>
              <ul className="space-y-2">
                {category.skills.map((skill, sIdx) => (
                  <li
                    key={sIdx}
                    className="text-xs text-zinc-650 dark:text-zinc-400 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Professional Timeline */}
      <section className="space-y-12 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Professional Timeline
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            A glance at my corporate work history and academic background.
          </p>
        </div>

        <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 space-y-8">
          {timelineEvents.map((event, idx) => (
            <div key={idx} className="relative pl-8">
              {/* Connector Pin */}
              <div className="absolute -left-3.5 top-1 w-7 h-7 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                {event.type === "work" ? (
                  <FaBriefcase className="w-3.5 h-3.5 text-purple-600" />
                ) : (
                  <FaGraduationCap className="w-4 h-4 text-purple-600" />
                )}
              </div>

              {/* Event Content Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                    {event.title}
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-650 dark:text-purple-400 font-semibold text-[10px] tracking-wide w-fit">
                    {event.date}
                  </span>
                </div>
                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {event.organization}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
