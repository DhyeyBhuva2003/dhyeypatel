import React from "react";
import Link from "next/link";
import { FaCheck } from "react-icons/fa";

export default function Pricing() {
  const packages = [
    {
      name: "Performance Audit",
      price: "$800",
      description: "Best for existing products encountering database blocks or slow API times.",
      features: [
        "Mongoose explain plan profiles",
        "Compound index recommendations",
        "API rate-limiting setup",
        "Memory leak diagnosis",
        "2-day delivery milestone",
        "PDF optimization report",
      ],
      popular: false,
      cta: "Book Audit",
    },
    {
      name: "SaaS MVP Build",
      price: "$3,000",
      description: "Best for startup founders wanting to launch a feature-complete MVP in weeks.",
      features: [
        "Responsive React & Next.js site",
        "JWT and secure HttpOnly cookie auth",
        "Stripe payment gateway flow",
        "Admin metrics dashboard",
        "Cloudinary upload validation",
        "4-week delivery, 1-week support",
      ],
      popular: true,
      cta: "Start MVP Build",
    },
    {
      name: "Consulting Retainer",
      price: "$1,500/mo",
      description: "Best for ongoing architecture support and staff engineering integration.",
      features: [
        "10 hours per week of coding",
        "Slack/Discord channel access",
        "Code review checks & PR reviews",
        "Cloud hosting (Vercel, AWS, Mongo)",
        "Priority bug response",
        "Weekly status calls",
      ],
      popular: false,
      cta: "Hire for Retainer",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-16">
      {/* Header */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Transparent, Value-Driven Pricing
        </h1>
        <p className="text-lg text-zinc-650 dark:text-zinc-400 leading-relaxed">
          No hidden fees. Choose a package tailored to your software milestones, or request a custom quote.
        </p>
      </section>

      {/* Pricing Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {packages.map((pkg, idx) => (
          <div
            key={idx}
            className={`p-8 rounded-3xl bg-white dark:bg-zinc-900 border flex flex-col justify-between relative transition duration-300 ${
              pkg.popular
                ? "border-purple-650 dark:border-purple-500 shadow-xl ring-2 ring-purple-600/10"
                : "border-zinc-200/60 dark:border-zinc-850 shadow-sm hover:shadow-md"
            }`}
          >
            {pkg.popular && (
              <span className="absolute top-0 right-8 -translate-y-1/2 bg-purple-600 text-white px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
                Most Popular
              </span>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {pkg.name}
                </h2>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">{pkg.price}</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pt-1">
                  {pkg.description}
                </p>
              </div>

              <ul className="space-y-3.5 border-t border-zinc-100 dark:border-zinc-850 pt-6">
                {pkg.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <FaCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/contact"
                className={`w-full inline-flex justify-center items-center py-3.5 rounded-xl text-xs font-semibold transition duration-200 ${
                  pkg.popular
                    ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-600/10"
                    : "border border-zinc-250 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-55/10 dark:hover:bg-zinc-900/40"
                }`}
              >
                {pkg.cta}
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto space-y-8 pt-8">
        <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              q: "How do milestones work for the SaaS MVP?",
              a: "We split the project into 4 key sprints (Auth & Setup, Core Features, Integrations, Polish & Deploy). Payments are released as each sprint is completed and tested.",
            },
            {
              q: "Do you offer post-launch support?",
              a: "Yes! Every project includes 1 week of free post-launch monitoring. Longer support plans can be arranged via the Monthly Retainer package.",
            },
            {
              q: "Can we start with a performance audit first?",
              a: "Absolutely. Many clients book a Performance Audit to find bottleneck profiles, and then contract me to implement the fixes under an MVP or Retainer plan.",
            },
            {
              q: "Do you sign non-disclosure agreements?",
              a: "Yes. I sign standard NDAs to ensure your product ideas and source codes remain strictly confidential and protected.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-zinc-850 space-y-2">
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                {faq.q}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
