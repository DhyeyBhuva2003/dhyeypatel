import React from "react";
import Link from "next/link";
import { FaCode, FaRocket, FaServer, FaDatabase, FaCogs, FaCheckCircle } from "react-icons/fa";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";

export const revalidate = 3600;

function getIconComponent(iconName: string) {
  switch (iconName) {
    case "FaCode":
      return <FaCode className="w-8 h-8 text-purple-600 dark:text-purple-400" />;
    case "FaRocket":
      return <FaRocket className="w-8 h-8 text-purple-600 dark:text-purple-400" />;
    case "FaServer":
      return <FaServer className="w-8 h-8 text-purple-600 dark:text-purple-400" />;
    default:
      return <FaDatabase className="w-8 h-8 text-purple-600 dark:text-purple-400" />;
  }
}

export default async function Services() {
  let services: any[] = [];
  try {
    await connectToDatabase();
    services = await Service.find({}).sort({ order: 1 }).lean();
  } catch (err) {
    console.error("Failed to query services on Services page:", err);
  }

  const processSteps = [
    {
      step: "01",
      title: "Discovery & Scope",
      desc: "We align on requirements, draft user journeys, outline core integrations, and finalize pricing contracts.",
    },
    {
      step: "02",
      title: "Architecture & Design",
      desc: "Creating database models, security layouts, caching maps, and visual user interface mockups.",
    },
    {
      step: "03",
      title: "Agile Development",
      desc: "Writing production-grade, type-safe Next.js code with standard test coverages and secure checks.",
    },
    {
      step: "04",
      title: "Optimization & QA",
      desc: "Profiling database indexes, checking API rate-limits, compiling sitemaps, and performing user tests.",
    },
    {
      step: "05",
      title: "Deployment & Support",
      desc: "Deploying to production, configuring analytics tracking, and providing documentation templates.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-24">
      {/* Page Header */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Freelance Services & Solutions
        </h1>
        <p className="text-lg text-zinc-650 dark:text-zinc-400 leading-relaxed">
          From drafting initial specifications to scaling application layers, I supply Stafford-grade technical consultancy for startup products.
        </p>
      </section>

      {/* Services Detailed List */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service) => (
          <div
            key={service._id.toString()}
            className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-purple-500/30 transition duration-300"
          >
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center border border-purple-100 dark:border-purple-900/30">
                {getIconComponent(service.icon)}
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {service.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {service.description}
                </p>
              </div>
              
              <ul className="space-y-3 border-t border-zinc-100 dark:border-zinc-850 pt-5">
                {service.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <FaCheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 mt-8 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="block text-[10px] text-zinc-400 uppercase tracking-wide">Investment</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-white">{service.price}</span>
              </div>
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Process Lifecycle */}
      <section className="space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            How I Deliver Value
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            A linear, milestone-driven development process designed to launch products on time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {processSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/25 border border-zinc-200/50 dark:border-zinc-800/40 relative space-y-4"
            >
              <div className="text-4xl font-extrabold text-purple-600/20 dark:text-purple-400/20 absolute right-6 top-4">
                {step.step}
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base pt-2">
                {step.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
