import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaCode, FaRocket, FaServer, FaDatabase } from "react-icons/fa";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import Service from "@/models/Service";
import { getAllBlogs } from "@/lib/blogs";
import { formatDate } from "@/lib/utils";
import { getPersonSchema } from "@/lib/seo";

export const revalidate = 3600; // Revalidate page every hour

// Helper to map icon string to React Icon component
function getIconComponent(iconName: string) {
  switch (iconName) {
    case "FaCode":
      return <FaCode className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    case "FaRocket":
      return <FaRocket className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    case "FaServer":
      return <FaServer className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    default:
      return <FaDatabase className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
  }
}

export default async function Home() {
  let featuredProjects: any[] = [];
  let services: any[] = [];
  let latestBlogs: any[] = [];
  const personSchema = getPersonSchema();

  try {
    await connectToDatabase();
    // Fetch from Mongoose
    featuredProjects = await Project.find({ featured: true })
      .sort({ order: 1 })
      .limit(3)
      .lean();
    services = await Service.find({}).sort({ order: 1 }).limit(3).lean();
    
    // Fetch from unified blog aggregator
    const blogs = await getAllBlogs();
    latestBlogs = blogs.slice(0, 3);
  } catch (err) {
    console.error("Home page data prefetch failed:", err);
  }

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden">
      {/* Google Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-8 md:pt-16">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
              Available for Freelance & Consulting
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
              Architecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">Scalable SaaS</span> & Intelligent Systems
            </h1>
            
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              I&apos;m Dhyey Bhuva, a Solutions Architect and Developer. I build secure, enterprise-grade web applications, tune databases, and orchestrate automated AI workflows.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/portfolio"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 transition duration-300 shadow-lg shadow-purple-600/20"
              >
                <span>View Portfolio</span>
                <FaArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-55/10 dark:hover:bg-zinc-900/40 transition duration-300"
              >
                Let&apos;s Talk
              </Link>
            </div>
          </div>

          {/* Hero Visual (Profile Image with Glowing Card Rings) */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-72 h-72 sm:w-85 sm:h-85 lg:w-96 lg:h-96 group">
              {/* Outer decorative glowing ring */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition duration-500"></div>
              
              {/* Image Frame wrapper */}
              <div className="relative w-full h-full bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                <Image
                  src="/dhyey.png"
                  alt="Dhyey Bhuva"
                  fill
                  priority
                  className="object-cover group-hover:scale-[1.03] transition duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 px-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-250/10 dark:border-zinc-800/50 backdrop-blur-sm">
          {[
            { value: "5+", label: "Years Engineering" },
            { value: "40+", label: "Projects Shipped" },
            { value: "99%", label: "Client Satisfaction" },
            { value: "10k+", label: "Lines Seeded" },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Services Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest font-bold text-purple-600 dark:text-purple-400">
            Freelance Services
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
            High-Performance Solutions Tailored To Your Product
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service: any) => (
            <div
              key={service._id}
              className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm hover:shadow-md hover:border-purple-500/40 transition duration-300 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center border border-purple-100 dark:border-purple-900/30">
                  {getIconComponent(service.icon)}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {service.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2 pt-2">
                  {service.features.slice(0, 4).map((f: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-850 mt-6 flex justify-between items-center">
                <span className="text-xs text-zinc-400 dark:text-zinc-500">Starting at</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-white">{service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Portfolio Projects Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-xs uppercase tracking-widest font-bold text-purple-600 dark:text-purple-400">
              Selected Works
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Proven Architecture, Shipped In Production
            </p>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
          >
            <span>See all projects</span>
            <FaArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project: any) => (
            <div
              key={project._id}
              className="group overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm hover:shadow-md transition duration-300 flex flex-col"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 3).map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                    {project.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>
                <Link
                  href={`/portfolio`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Latest Blogs Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-xs uppercase tracking-widest font-bold text-purple-600 dark:text-purple-400">
              Technical Blog
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Engineering Insights & Deep Dives
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
          >
            <span>Read all articles</span>
            <FaArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestBlogs.map((blog: any) => (
            <Link
              key={blog.slug}
              href={`/blog/${blog.slug}`}
              className="group flex flex-col justify-between p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/25 border border-zinc-200/50 dark:border-zinc-800/40 hover:border-purple-500/30 transition duration-300"
            >
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <span>{blog.category}</span>
                  <span>{blog.readTime}</span>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {blog.description}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-zinc-150/40 dark:border-zinc-850/40 text-xs font-semibold text-zinc-400 dark:text-zinc-500 flex justify-between items-center">
                <span>{formatDate(blog.publishedAt)}</span>
                <span className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition duration-250">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Action Form Section */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-8 sm:p-12 md:p-16 border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-center gap-12">
          {/* Background Gradient Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to accelerate your product development?
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
              Let&apos;s build high-throughput dashboards, clean integrations, or robust AI agent automation together.
            </p>
            <div className="flex justify-center md:justify-start pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl font-semibold text-zinc-900 bg-white hover:bg-zinc-100 transition duration-300"
              >
                <span>Initiate a Project</span>
                <FaArrowRight size={12} />
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 p-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold tracking-tight">Direct Inquiry</h3>
            <p className="text-xs text-zinc-500">Submit a quick message to get a response within 24 hours.</p>
            <Link
              href="/contact"
              className="w-full inline-flex justify-center items-center py-2.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition"
            >
              Contact Form
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
