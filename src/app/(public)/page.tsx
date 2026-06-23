import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaCode, FaRocket, FaServer, FaDatabase, FaGithub, FaLinkedin, FaEnvelope, FaCommentDots, FaChevronDown, FaBriefcase, FaMicrochip, FaSmile, FaClock } from "react-icons/fa";
import { SiNextdotjs, SiReact, SiNodedotjs, SiTypescript, SiMongodb } from "react-icons/si";
import { FaAws } from "react-icons/fa";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import Service from "@/models/Service";
import { getAllBlogs } from "@/lib/blogs";
import { formatDate } from "@/lib/utils";
import { getPersonSchema } from "@/lib/seo";
import FadeIn from "@/components/FadeIn";
import SkillsSection from "@/components/SkillsSection";

export const revalidate = 3600; // Revalidate page every hour

// Helper to map icon string to React Icon component
function getIconComponent(iconName: string) {
  switch (iconName) {
    case "FaCode":
      return <FaCode className="w-5 h-5 text-brand-primary dark:text-brand-accent" />;
    case "FaRocket":
      return <FaRocket className="w-5 h-5 text-brand-primary dark:text-brand-accent" />;
    case "FaServer":
      return <FaServer className="w-5 h-5 text-brand-primary dark:text-brand-accent" />;
    default:
      return <FaDatabase className="w-5 h-5 text-brand-primary dark:text-brand-accent" />;
  }
}

// Code Preview Card
function CodePreview() {
  return (
    <div className="w-full rounded-2xl border border-zinc-800/60 bg-zinc-950/80 text-zinc-300 p-4 font-mono text-[11px] shadow-2xl overflow-hidden select-none backdrop-blur-sm opacity-90">
      <div className="flex items-center gap-1.5 pb-3 border-b border-zinc-800/80 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <span className="text-[10px] text-zinc-500 pl-2">architectue.ts</span>
      </div>
      <pre className="overflow-x-auto leading-[1.85]">
        <code>
          <span className="text-blue-400">import</span> {" { "}<span className="text-yellow-300">Architect</span>{" } "}<span className="text-blue-400">from</span> <span className="text-emerald-400">&quot;@dhyey&quot;</span>;<br />
          <br />
          <span className="text-purple-400">const</span> <span className="text-white">solution</span> = <span className="text-purple-400">new</span> <span className="text-yellow-300">Architect</span>(<span className="text-zinc-400">{"{"}</span><br />
          &nbsp;&nbsp;<span className="text-blue-300">name</span>: <span className="text-emerald-400">&quot;Dhyey Bhuva&quot;</span>,<br />
          &nbsp;&nbsp;<span className="text-blue-300">role</span>: <span className="text-emerald-400">&quot;Solutions Architect &amp; Developer&quot;</span>,<br />
          &nbsp;&nbsp;<span className="text-blue-300">focus</span>: [<span className="text-emerald-400">&quot;SaaS&quot;</span>, <span className="text-emerald-400">&quot;AI&quot;</span>, <span className="text-emerald-400">&quot;Cloud&quot;</span>, <span className="text-emerald-400">&quot;Web&quot;</span>],<br />
          <span className="text-zinc-400">{"}"}</span>);<br />
          <br />
          <span className="text-purple-400">await</span> solution.<span className="text-yellow-300">build</span>(<span className="text-zinc-400">{"{"}</span><br />
          &nbsp;&nbsp;<span className="text-blue-300">performance</span>: <span className="text-emerald-400">&quot;High&quot;</span>,<br />
          &nbsp;&nbsp;<span className="text-blue-300">scalability</span>: <span className="text-emerald-400">&quot;Infinite&quot;</span>,<br />
          &nbsp;&nbsp;<span className="text-blue-300">impact</span>: <span className="text-emerald-400">&quot;Real&quot;</span>,<br />
          <span className="text-zinc-400">{"}"}</span>);
        </code>
      </pre>
    </div>
  );
}

export default async function Home() {
  let featuredProjects: any[] = [];
  let services: any[] = [];
  let latestBlogs: any[] = [];
  const personSchema = getPersonSchema();

  try {
    await connectToDatabase();
    featuredProjects = await Project.find({ featured: true })
      .sort({ order: 1 })
      .limit(3)
      .lean();
    services = await Service.find({}).sort({ order: 1 }).limit(3).lean();

    const blogs = await getAllBlogs();
    latestBlogs = blogs.slice(0, 3);
  } catch (err) {
    console.error("Home page data prefetch failed:", err);
  }

  return (
    <div className="pb-24 space-y-32 relative overflow-x-hidden bg-bg-main text-text-main">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Google Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      {/* 1. Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">

        {/* Scattered stars */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          {[
            { top: "12%", left: "5%", size: 2 }, { top: "25%", left: "12%", size: 1.5 },
            { top: "55%", left: "3%", size: 2 }, { top: "70%", left: "18%", size: 1 },
            { top: "10%", right: "10%", size: 1.5 }, { top: "38%", right: "5%", size: 2 },
            { top: "80%", right: "12%", size: 1 }, { top: "48%", left: "45%", size: 1.5 },
          ].map((dot, i) => (
            <div key={i} className="absolute rounded-full bg-blue-400/40 animate-pulse"
              style={{ top: dot.top, left: (dot as any).left, right: (dot as any).right, width: dot.size * 4, height: dot.size * 4, animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </div>

        {/* Main grid */}
        <div className="flex-1 max-w-[1400px] mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center pt-16 pb-4">

          {/* LEFT — Text */}
          <div className="space-y-7 z-10 text-center lg:text-left">
            <FadeIn direction="up" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-primary/30 bg-brand-primary/8 text-brand-primary dark:text-brand-accent text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Available for Freelance &amp; Consulting
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <h1 className="text-5xl sm:text-6xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.08] text-text-main">
                Architecting{" "}
                <span className="text-brand-primary">Scalable SaaS</span>
                {" "}&amp; Intelligent Systems
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={0.3}>
              <p className="text-base lg:text-lg text-text-sub leading-relaxed max-w-lg mx-auto lg:mx-0">
                I build secure, high-performance web applications, tune databases, and orchestrate AI-driven workflows that help businesses scale.
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={0.4}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/portfolio"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary/90 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-brand-primary/25"
                >
                  <span>View My Work</span>
                  <FaArrowRight size={13} />
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-text-main border border-border-main hover:bg-bg-sub/60 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                >
                  <span>Let&apos;s Talk</span>
                  <FaCommentDots size={13} />
                </Link>
              </div>
            </FadeIn>

            {/* Stats row */}
            <FadeIn direction="up" delay={0.55}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-border-main max-w-lg mx-auto lg:mx-0">
                {[
                  { icon: <FaBriefcase className="text-brand-primary" size={14} />, value: "25+", label: "Projects Completed" },
                  { icon: <FaMicrochip className="text-brand-primary" size={14} />, value: "10+", label: "Technologies" },
                  { icon: <FaSmile className="text-brand-primary" size={14} />, value: "15+", label: "Happy Clients" },
                  { icon: <FaClock className="text-brand-primary" size={14} />, value: "2+", label: "Years Experience" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-text-sub mb-0.5">{s.icon}</div>
                    <div className="text-2xl font-extrabold text-text-main">{s.value}</div>
                    <div className="text-[11px] text-text-sub leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* RIGHT — Person + Code card + floating badges */}
          <div className="relative flex items-center justify-center h-[420px] lg:h-[640px]">

            {/* Large glowing orb behind person */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-72 h-72 lg:w-[420px] lg:h-[420px] rounded-full bg-gradient-to-b from-[#005eff] via-[#00259e] to-[#000b2b] blur-[2px] shadow-[0_0_140px_50px_rgba(0,94,255,0.5)]" />
            {/* Orbital ellipse ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] w-[300px] h-[200px] lg:w-[420px] lg:h-[280px] rounded-full border border-blue-400/25 shadow-[0_0_15px_rgba(96,165,250,0.1)] rotate-[15deg]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] w-[280px] h-[180px] lg:w-[400px] lg:h-[260px] rounded-full border border-blue-500/15 shadow-[0_0_12px_rgba(59,130,246,0.08)] -rotate-[5deg]" />
            {/* Orbital dots */}
            <div className="absolute top-[48%] left-[23%] lg:left-[21%] w-2.5 h-2.5 rounded-full bg-blue-300 shadow-[0_0_12px_5px_rgba(96,165,250,0.5)] animate-pulse hidden lg:block" />
            <div className="absolute top-[38%] right-[22%] lg:right-[20%] w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_10px_4px_rgba(96,165,250,0.4)] animate-pulse hidden lg:block" />

            {/* Person image — natural, no circle clip */}
            <FadeIn direction="up" delay={0.25}>
              <div className="relative z-10 h-[420px] lg:h-[520px] w-[280px] lg:w-[400px]">
                <Image
                  src="/DhyeyFinal.png"
                  alt="Dhyey Bhuva"
                  fill
                  priority
                  className="object-cover object-top"
                />
              </div>
            </FadeIn>

            {/* Code card — bottom left */}
            <FadeIn direction="right" delay={0.45} className="hidden lg:block">
              <div className="absolute bottom-4 left-0 lg:-left-4 z-20 w-64 lg:w-72">
                <CodePreview />
              </div>
            </FadeIn>

            {/* Years experience badge — top right */}
            <FadeIn direction="left" delay={0.5} className="hidden lg:block">
              <div className="absolute top-8 right-0 lg:-right-2 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 backdrop-blur-md shadow-xl">
                <div>
                  <div className="text-2xl font-extrabold text-white leading-none">2+</div>
                  <div className="text-[11px] text-zinc-400 leading-tight mt-0.5">Years of<br />Experience</div>
                </div>
                <div className="text-brand-primary opacity-60"><FaCode size={20} /></div>
              </div>
            </FadeIn>

            {/* Code brackets badge — bottom right */}
            <FadeIn direction="left" delay={0.6} className="hidden lg:block">
              <div className="absolute bottom-24 right-0 lg:-right-2 z-20 w-14 h-14 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 backdrop-blur-md shadow-xl flex items-center justify-center">
                <span className="text-xl font-bold text-brand-primary font-mono">&#123;&#125;</span>
              </div>
            </FadeIn>

          </div>
        </div>

        {/* Trusted by Technologies bar */}
        <FadeIn direction="up" delay={0.7}>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full pb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-sub mb-5">Trusted by Technologies</p>
            <div className="flex flex-wrap items-center gap-8 text-text-sub">
              {[
                { icon: <SiNextdotjs size={18} />, label: "Next.js" },
                { icon: <SiReact size={18} className="text-cyan-400" />, label: "React" },
                { icon: <SiNodedotjs size={18} className="text-green-500" />, label: "Node.js" },
                { icon: <SiTypescript size={18} className="text-blue-400" />, label: "TypeScript" },
                { icon: <SiMongodb size={18} className="text-green-400" />, label: "MongoDB" },
                { icon: <FaAws size={20} className="text-orange-400" />, label: "AWS" },
              ].map((tech, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium hover:text-text-main transition">
                  {tech.icon}
                  <span>{tech.label}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>


      </section>

      {/* 2. Skills & Expertise Section */}
      <SkillsSection />

      {/* 3. Featured Services Section */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <FadeIn direction="up">
            <h2 className="text-xs uppercase tracking-widest font-extrabold text-brand-primary dark:text-brand-accent">
              Freelance Services
            </h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.1}>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight leading-tight">
              High-Performance Solutions Tailored To Your Product
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service: any, idx: number) => (
            <FadeIn key={service._id} direction="up" delay={idx * 0.1}>
              <div className="p-8 rounded-2xl bg-card-main border border-border-main hover:border-brand-primary/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[380px] shadow-sm">
                <div className="space-y-5">
                  <div className="w-11 h-11 rounded-xl bg-brand-primary/5 flex items-center justify-center border border-brand-primary/10">
                    {getIconComponent(service.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-text-main">
                    {service.title}
                  </h3>
                  <p className="text-sm text-text-sub leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2 pt-2">
                    {service.features.slice(0, 4).map((f: string, iIndex: number) => (
                      <li key={iIndex} className="flex items-center gap-2 text-xs text-text-sub">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-6 border-t border-border-main mt-6 flex justify-between items-center">
                  <span className="text-xs text-text-sub">Starting at</span>
                  <span className="text-lg font-extrabold text-text-main">{service.price}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 4. Featured Portfolio Projects Section */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-4 max-w-2xl">
            <FadeIn direction="up">
              <h2 className="text-xs uppercase tracking-widest font-extrabold text-brand-primary dark:text-brand-accent">
                Selected Works
              </h2>
            </FadeIn>
            <FadeIn direction="up" delay={0.1}>
              <p className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight leading-tight">
                Proven Architecture, Shipped In Production
              </p>
            </FadeIn>
          </div>
          <FadeIn direction="left">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary dark:text-brand-accent hover:underline transition"
            >
              <span>See all projects</span>
              <FaArrowRight size={12} />
            </Link>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project: any, idx: number) => (
            <FadeIn key={project._id} direction="up" delay={idx * 0.1}>
              <div className="group overflow-hidden rounded-2xl bg-card-main border border-border-main hover:border-brand-primary/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col min-h-[420px] shadow-sm">
                <div className="relative aspect-video w-full overflow-hidden bg-bg-sub border-b border-border-main">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                  {/* Category overlay */}
                  {project.category && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-bg-main/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-brand-accent border border-border-main">
                      {project.category}
                    </span>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 3).map((tag: string, iIndex: number) => (
                        <span
                          key={iIndex}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-bg-sub border border-border-main text-text-sub"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-text-main group-hover:text-brand-primary transition">
                      {project.title}
                    </h3>
                    <p className="text-xs text-text-sub leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>
                  <Link
                    href={`/portfolio`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary dark:text-brand-accent hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 5. Latest Blogs Section */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-4 max-w-2xl">
            <FadeIn direction="up">
              <h2 className="text-xs uppercase tracking-widest font-extrabold text-brand-primary dark:text-brand-accent">
                Technical Blog
              </h2>
            </FadeIn>
            <FadeIn direction="up" delay={0.1}>
              <p className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight leading-tight">
                Engineering Insights & Deep Dives
              </p>
            </FadeIn>
          </div>
          <FadeIn direction="left">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary dark:text-brand-accent hover:underline transition"
            >
              <span>Read all articles</span>
              <FaArrowRight size={12} />
            </Link>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestBlogs.map((blog: any, idx: number) => (
            <FadeIn key={blog.slug} direction="up" delay={idx * 0.1}>
              <Link
                href={`/blog/${blog.slug}`}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-card-main border border-border-main hover:border-brand-primary/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 min-h-[220px] shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-text-sub uppercase tracking-wider">
                    <span>{blog.category}</span>
                    <span>{blog.readTime}</span>
                  </div>
                  <h3 className="text-base font-bold text-text-main group-hover:text-brand-primary transition line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-text-sub leading-relaxed line-clamp-3">
                    {blog.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border-main text-[11px] font-medium text-text-sub flex justify-between items-center">
                  <span>{formatDate(blog.publishedAt)}</span>
                  <span className="text-brand-primary group-hover:translate-x-1.5 transition-transform duration-200">
                    →
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 6. Action Form Section */}
      <section className="max-w-[1200px] mx-auto px-6">
        <FadeIn direction="up">
          <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white p-8 sm:p-12 md:p-16 border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-center gap-12">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl -z-10"></div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Ready to accelerate your product development?
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                Let&apos;s build high-throughput dashboards, clean integrations, or robust AI agent automation together.
              </p>
              <div className="flex justify-center md:justify-start pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-zinc-950 bg-white hover:bg-zinc-100 transition duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Initiate a Project</span>
                  <FaArrowRight size={12} />
                </Link>
              </div>
            </div>

            <div className="w-full md:w-80 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-bold tracking-tight">Direct Inquiry</h3>
              <p className="text-xs text-zinc-400">Submit a quick message to get a response within 24 hours.</p>
              <Link
                href="/contact"
                className="w-full inline-flex justify-center items-center py-2.5 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/90 transition hover:scale-[1.02]"
              >
                Contact Form
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
