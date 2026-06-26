"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiRedux,
  SiTailwindcss,
  SiFramer,
  SiNodedotjs,
  SiExpress,
  SiNestjs,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiRedis,
  SiDocker,
  SiGit,
  SiNginx,
  SiPm2,
  SiPostman,
  SiSocketdotio
} from "react-icons/si";
import {
  FaAws,
  FaGitAlt,
  FaLinux,
  FaGithub,
  FaServer,
  FaCode,
  FaLaptopCode,
  FaDatabase,
  FaRegFileCode
} from "react-icons/fa";

// Register ScrollTrigger plugin on the client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Categories Data
const categories = [
  {
    title: "Frontend Engineering",
    description: "Building fast, responsive, and scalable user experiences with modern frontend technologies.",
    experience: "2+ Years",
    projects: "20+ Projects",
    icon: <FaLaptopCode className="text-brand-primary dark:text-brand-accent w-6 h-6" />,
    glowColor: "rgba(37, 99, 235, 0.15)", // Blue glow
    skills: [
      { name: "Next.js", icon: <SiNextdotjs className="w-5 h-5 text-zinc-950 dark:text-white" /> },
      { name: "React", icon: <SiReact className="w-5 h-5 text-cyan-400 animate-spin-slow" /> },
      { name: "TypeScript", icon: <SiTypescript className="w-5 h-5 text-blue-500" /> },
      { name: "Redux", icon: <SiRedux className="w-5 h-5 text-purple-500" /> },
      { name: "Tailwind CSS", icon: <SiTailwindcss className="w-5 h-5 text-sky-400" /> },
      { name: "Framer Motion", icon: <SiFramer className="w-5 h-5 text-pink-500" /> },
    ]
  },
  {
    title: "Backend Engineering",
    description: "Developing secure APIs, authentication systems, scalable server architectures, and real-time applications.",
    experience: "4+ Years",
    projects: "15+ Projects",
    icon: <FaServer className="text-brand-primary dark:text-brand-accent w-6 h-6" />,
    glowColor: "rgba(16, 185, 129, 0.15)", // Green glow
    skills: [
      { name: "Node.js", icon: <SiNodedotjs className="w-5 h-5 text-green-500" /> },
      { name: "Express.js", icon: <SiExpress className="w-5 h-5 text-zinc-400 dark:text-zinc-300" /> },
      { name: "NestJS", icon: <SiNestjs className="w-5 h-5 text-red-500" /> },
      { name: "JWT", icon: <span className="text-[8px] font-extrabold text-amber-500 px-0.5 border border-amber-500/40 rounded bg-amber-500/5 leading-none py-0.5 select-none">JWT</span> },
      { name: "REST APIs", icon: <FaCode className="w-5 h-5 text-blue-400" /> },
      { name: "Socket.IO", icon: <SiSocketdotio className="w-5 h-5 text-zinc-400 dark:text-zinc-200" /> },
    ]
  },
  {
    title: "Database & Cloud",
    description: "Designing optimized database structures and deploying scalable cloud infrastructure.",
    experience: "3+ Years",
    projects: "12+ Projects",
    icon: <FaDatabase className="text-brand-primary dark:text-brand-accent w-6 h-6" />,
    glowColor: "rgba(6, 182, 212, 0.15)", // Cyan glow
    skills: [
      { name: "MongoDB", icon: <SiMongodb className="w-5 h-5 text-green-400" /> },
      { name: "PostgreSQL", icon: <SiPostgresql className="w-5 h-5 text-blue-400" /> },
      { name: "MySQL", icon: <SiMysql className="w-5 h-5 text-orange-400" /> },
      { name: "Redis", icon: <SiRedis className="w-5 h-5 text-red-500" /> },
      { name: "Docker", icon: <SiDocker className="w-5 h-5 text-sky-500" /> },
      { name: "AWS", icon: <FaAws className="w-5.5 h-5.5 text-orange-400" /> },
    ]
  },
  {
    title: "Tools & DevOps",
    description: "Managing deployments, CI/CD workflows, version control, and production monitoring.",
    experience: "3+ Years",
    projects: "15+ Projects",
    icon: <FaRegFileCode className="text-brand-primary dark:text-brand-accent w-6 h-6" />,
    glowColor: "rgba(245, 158, 11, 0.15)", // Amber glow
    skills: [
      { name: "Git", icon: <SiGit className="w-5 h-5 text-red-500" /> },
      { name: "GitHub", icon: <FaGithub className="w-5 h-5 text-zinc-800 dark:text-zinc-200" /> },
      { name: "Linux", icon: <FaLinux className="w-5 h-5 text-amber-500" /> },
      { name: "Nginx", icon: <SiNginx className="w-5 h-5 text-green-600" /> },
      { name: "PM2", icon: <SiPm2 className="w-5 h-5 text-blue-600" /> },
      { name: "Postman", icon: <SiPostman className="w-5 h-5 text-orange-500" /> },
    ]
  }
];

// Stats Data
const stats = [
  { target: 25, suffix: "+", label: "Projects Completed" },
  { target: 10, suffix: "+", label: "Technologies" },
  { target: 15, suffix: "+", label: "Happy Clients" },
  { target: 2, suffix: "+", label: "Years Experience" }
];

export default function SkillsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Single context for unified GSAP animations
    const sectionCtx = gsap.context(() => {
      // Create a master timeline for the entire section triggered by scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        }
      });

      // 1. Overall Section Fade In & Slide Up (snappy y offset)
      tl.fromTo(sectionRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      // 2. Card Animation - Appear sequentially with stagger delay in the same timeline
      const cards = gsap.utils.toArray<HTMLElement>(".skills-card");
      tl.fromTo(cards,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out" },
        "-=0.4"
      ); // Slightly overlap to feel fast and seamless

      // 3. Icon Animation - Scale from 0.85 to 1, rotate slightly
      const techIcons = gsap.utils.toArray<HTMLElement>(".tech-icon");
      tl.fromTo(techIcons,
        { scale: 0.85, rotation: -4, opacity: 0.5 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.4, stagger: 0.02, ease: "back.out(1.5)" },
        "-=0.4"
      );

      // 4. Stats Counter Animation using GSAP CountUp mechanism
      const counterElements = gsap.utils.toArray<HTMLElement>(".stat-counter");
      counterElements.forEach((el) => {
        const target = parseInt(el.getAttribute("data-target") || "0", 10);
        const suffix = el.getAttribute("data-suffix") || "";
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.textContent = Math.floor(obj.val) + suffix;
          }
        });
      });

    }, sectionRef);

    return () => {
      sectionCtx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative max-w-[1400px] mx-auto px-6 md:px-12 py-4 space-y-8 overflow-hidden"
    >
      {/* Background Gradient & Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-20" />

      {/* Floating Blur Circles (Subtle Premium Background Orbs) */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-brand-primary/5 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-brand-accent/5 blur-3xl -z-10 pointer-events-none" />

      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xs uppercase tracking-[0.2em] font-extrabold text-brand-primary dark:text-brand-accent">
          Skills &amp; Expertise
        </h2>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight leading-tight">
          Build Technologies That Scale
        </h3>
        <p className="text-sm sm:text-base text-text-sub leading-relaxed max-w-2xl mx-auto">
          From frontend experiences to backend architecture and cloud deployment, I create complete production-ready solutions.
        </p>
      </div>

      {/* 4-Column Category Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 skills-grid"
      >
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="skills-card relative flex flex-col justify-between p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_30px_-8px_var(--primary-glow)] hover:border-zinc-300/80 dark:hover:border-zinc-700/50 group overflow-hidden"
          >
            {/* Glowing Border Background Mask */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${cat.glowColor}, transparent 70%)`
              }}
            />

            <div>
              {/* Category Header with Icon Grid */}
              <div className="grid grid-cols-6 gap-2 mb-6">
                {cat.skills.map((skill, sIdx) => (
                  <div
                    key={sIdx}
                    className="tech-icon w-8.5 h-8.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/30 shadow-sm transition-all duration-300 hover:scale-110 hover:border-brand-primary/40 group/icon cursor-default"
                    title={skill.name}
                  >
                    {skill.icon}
                  </div>
                ))}
              </div>

              {/* Title & Icon Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-brand-primary/5 dark:bg-brand-accent/5 border border-brand-primary/10">
                  {cat.icon}
                </div>
                <h4 className="text-base font-bold text-text-main group-hover:text-brand-primary dark:group-hover:text-brand-accent transition-colors duration-300">
                  {cat.title}
                </h4>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-text-sub leading-relaxed mb-6">
                {cat.description}
              </p>
            </div>

            {/* Metrics Footer */}
            <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs">
              <div>
                <span className="block text-[10px] uppercase font-semibold text-text-sub/60 leading-none mb-1">Experience</span>
                <span className="font-bold text-text-main">{cat.experience}</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] uppercase font-semibold text-text-sub/60 leading-none mb-1">Projects</span>
                <span className="font-bold text-text-main">{cat.projects}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-t border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-500/5 rounded-2xl backdrop-blur-sm max-w-5xl mx-auto px-6 md:px-12">
        {stats.map((s, idx) => (
          <div key={idx} className="text-center space-y-1">
            <span
              className="stat-counter block text-3xl sm:text-4xl font-extrabold text-brand-primary dark:text-brand-accent tracking-tight"
              data-target={s.target}
              data-suffix={s.suffix}
            >
              0
            </span>
            <span className="block text-xs text-text-sub font-medium uppercase tracking-wider">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
