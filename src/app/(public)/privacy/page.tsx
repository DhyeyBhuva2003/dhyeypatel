import React from "react";
import { Metadata } from "next";
import Accordion from "@/components/Accordion";
import FadeIn from "@/components/FadeIn";
import { FaShieldAlt, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Dhyey Bhuva",
  description:
    "Review our privacy practices regarding collection, usage, and security of user information. Based in Ahmedabad, Gujarat, India.",
  alternates: { canonical: "https://dhyeybhuva.com/privacy" },
  openGraph: {
    title: "Privacy Policy | Dhyey Bhuva",
    description:
      "Review our privacy practices regarding collection, usage, and security of user information. Based in Ahmedabad, Gujarat, India.",
    url: "https://dhyeybhuva.com/privacy",
    type: "website",
  },
};

export default function PrivacyPolicy() {
  const privacyItems = [
    {
      title: "1. Information We Collect",
      content: (
        <>
          <p className="text-text-sub leading-relaxed text-sm">
            We collect information that you directly provide to us when using our
            services or filling out forms on our platform. This includes:
          </p>
          <ul className="list-none space-y-2 mt-3">
            {[
              { label: "Personal Identity Data", desc: "Name, business name, or alias." },
              { label: "Contact Information", desc: "Email address, phone number, and mailing address." },
              { label: "Project Enquiries", desc: "Project specifications, budgets, timelines, and message history shared during scheduling." },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-text-sub">
                <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-brand-accent mt-1.5" />
                <span>
                  <strong className="text-text-main">{item.label}:</strong>{" "}
                  {item.desc}
                </span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      title: "2. How We Use Your Information",
      content: (
        <>
          <p className="text-text-sub leading-relaxed text-sm">
            The collected information is used solely to enhance your user
            experience, handle client inquiries, and execute service contracts.
            Specifically, we use it to:
          </p>
          <ul className="list-none space-y-2 mt-3">
            {[
              "Process, review, and respond to freelance services and consulting requests.",
              "Send newsletters, tech blog updates, and administrative communications (if opted in).",
              "Monitor, improve, and secure site operations and prevent suspicious activity.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-text-sub">
                <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-brand-accent mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      title: "3. Data Storage & Security",
      content: (
        <>
          <p className="text-text-sub leading-relaxed text-sm">
            We implement strict security protocols to prevent unauthorized
            access, alteration, disclosure, or destruction of your personal
            data.
          </p>
          <p className="mt-3 text-text-sub leading-relaxed text-sm">
            Your information is stored in highly secure cloud databases (MongoDB
            Atlas) using secure endpoints. We do not sell, rent, or trade your
            personal data to third parties under any circumstances.
          </p>
        </>
      ),
    },
    {
      title: "4. Cookies & Web Analytics",
      content: (
        <>
          <p className="text-text-sub leading-relaxed text-sm">
            This website utilizes standard browser cookies and local storage
            tokens to preserve UI settings (such as dark mode preferences) and
            to handle authentication session states securely.
          </p>
          <p className="mt-3 text-text-sub leading-relaxed text-sm">
            We may also collect anonymized visitor analytics to understand usage
            patterns and improve website layout and reading speed.
          </p>
        </>
      ),
    },
    {
      title: "5. Third-Party Integrations",
      content: (
        <>
          <p className="text-text-sub leading-relaxed text-sm">
            To facilitate web services, this site integrates with trusted
            third-party providers:
          </p>
          <ul className="list-none space-y-2 mt-3">
            {[
              { label: "MongoDB Atlas", desc: "Secure cloud database storage." },
              { label: "Cloudinary", desc: "Media hosting and delivery optimization." },
              { label: "Nodemailer & SMTP", desc: "Automated email dispatch for inquiry alerts." },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-text-sub">
                <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-brand-accent mt-1.5" />
                <span>
                  <strong className="text-text-main">{item.label}:</strong>{" "}
                  {item.desc}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-text-sub leading-relaxed text-sm">
            These platforms are authorized to process data only as necessary to
            execute service actions under strict confidentiality mandates.
          </p>
        </>
      ),
    },
    {
      title: "6. Governing Jurisdiction & Rights",
      content: (
        <>
          <p className="text-text-sub leading-relaxed text-sm">
            Dhyey Bhuva operates this platform in accordance with the laws of
            India. Any legal disputes, declarations, or policy disputes are
            governed by and construed in accordance with the jurisdiction of the
            courts in{" "}
            <strong className="text-text-main">Ahmedabad, Gujarat, India</strong>.
          </p>
          <p className="mt-3 text-text-sub leading-relaxed text-sm">
            You have the right to request access to, correction of, or deletion
            of your personal data stored on our servers. To do so, please
            contact us directly at{" "}
            <a
              href="mailto:dhyeybhuva2003@gmail.com"
              className="text-brand-primary font-semibold hover:underline"
            >
              dhyeybhuva2003@gmail.com
            </a>
            .
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="bg-bg-main text-text-main">
      <div className="max-w-[860px] mx-auto px-6 md:px-12 py-20 space-y-14">

        {/* Page Header */}
        <FadeIn direction="up">
          <div className="text-center space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-primary/8 border border-brand-primary/15 text-brand-primary dark:text-brand-accent shadow-sm">
              <FaShieldAlt className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest font-extrabold text-brand-primary dark:text-brand-accent">
                Legal
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-main">
                Privacy Policy
              </h1>
              <p className="text-sm text-text-sub max-w-md mx-auto leading-relaxed">
                Last Updated: June 21, 2026. Review our terms governing data
                collection, usage rights, and information protection.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Info Banner */}
        <FadeIn direction="up" delay={0.1}>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/15">
            <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-brand-primary mt-1.5" />
            <p className="text-sm text-text-sub leading-relaxed">
              We at{" "}
              <strong className="text-text-main">Dhyey Bhuva</strong> are committed
              to protecting your personal data and respecting your privacy. This
              policy applies to all data collected via our website or services.
            </p>
          </div>
        </FadeIn>

        {/* Accordion */}
        <FadeIn direction="up" delay={0.15}>
          <div className="space-y-3">
            <Accordion items={privacyItems} />
          </div>
        </FadeIn>

        {/* Footer Note */}
        <FadeIn direction="up" delay={0.2}>
          <div className="p-6 rounded-2xl bg-bg-sub border border-border-main flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-sub text-center sm:text-left">
              Questions about how we handle your data?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary/90 transition-all hover:scale-[1.02] shrink-0"
            >
              Contact Us <FaArrowRight size={11} />
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
