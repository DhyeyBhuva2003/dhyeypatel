import React from "react";
import { Metadata } from "next";
import Accordion from "@/components/Accordion";
import { FaFileContract } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Terms of Service | Dhyey Bhuva",
  description: "Review our Terms of Service outlining project inquiry, consulting engagement rules, and legal agreements. Based in Ahmedabad, Gujarat, India.",
  alternates: {
    canonical: "https://dhyeybhuva.com/terms",
  },
  openGraph: {
    title: "Terms of Service | Dhyey Bhuva",
    description: "Review our Terms of Service outlining project inquiry, consulting engagement rules, and legal agreements. Based in Ahmedabad, Gujarat, India.",
    url: "https://dhyeybhuva.com/terms",
    type: "website",
  },
};

export default function TermsOfService() {
  const termsItems = [
    {
      title: "1. Acceptance of Terms",
      content: (
        <>
          <p>
            By accessing, browsing, or utilizing this website, portfolio, and freelance lead submission system, you agree to comply with and be bound by these Terms of Service.
          </p>
          <p className="mt-2">
            If you do not agree with any part of these terms, you are prohibited from submitting scheduling requests, using services, or downloading portfolio templates.
          </p>
        </>
      ),
    },
    {
      title: "2. Services and Engagements",
      content: (
        <>
          <p>
            Dhyey Bhuva provides freelance software engineering, full-stack systems architecture, database tuning, and AI agent integration consulting services.
          </p>
          <p className="mt-2">
            All freelance projects are subject to separate formal statements of work (SOW) or service level agreements (SLA) which detail the final deliverables, payment schedules, and resource dependencies.
          </p>
        </>
      ),
    },
    {
      title: "3. Intellectual Property Rights",
      content: (
        <>
          <p>
            Unless otherwise agreed in writing, all source code, software architectures, written articles, case study documents, diagrams, and media displayed on this site are the intellectual property of Dhyey Bhuva.
          </p>
          <p className="mt-2">
            You may not republish, reproduce, distribute, or copy content from the blog directory or project pages without prior written permission.
          </p>
        </>
      ),
    },
    {
      title: "4. Client Inquiries & Communications",
      content: (
        <>
          <p>
            When utilizing the contact form or inquiry submission tool, you represent and warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>The contact details, email address, and project details provided are accurate and truthful.</li>
            <li>You will not upload malicious scripts, spam links, or offensive content through form fields.</li>
            <li>All communication remains professional and constructive.</li>
          </ul>
        </>
      ),
    },
    {
      title: "5. Limitation of Liability",
      content: (
        <>
          <p>
            The content, code snippets, and blog guides provided on this site are provided on an &quot;as is&quot; and &quot;as available&quot; basis, without warranties of any kind.
          </p>
          <p className="mt-2">
            Under no circumstances shall Dhyey Bhuva be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this site, its blog recommendations, or code snippet examples.
          </p>
        </>
      ),
    },
    {
      title: "6. Governing Law & Jurisdiction",
      content: (
        <>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of India.
          </p>
          <p className="mt-2">
            Any disputes arising from or relating to the use of this website, consulting inquiries, or freelance service agreements will be subject to the exclusive jurisdiction of the courts located in <strong>Ahmedabad, Gujarat, India</strong>.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 space-y-12">
      {/* Title section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3.5 bg-purple-100 dark:bg-purple-950/40 rounded-3xl text-purple-650 dark:text-purple-400 shadow-sm">
          <FaFileContract className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
            Last Updated: June 21, 2026. Review the legal parameters governing site usage, intellectual property, and contracting parameters.
          </p>
        </div>
      </div>

      {/* Accordion Container */}
      <div className="space-y-6">
        <Accordion items={termsItems} />
      </div>

      {/* Footer Contact Note */}
      <div className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/25 border border-zinc-200/50 dark:border-zinc-800/40 text-center text-xs text-zinc-500">
        Need clarification on a project term? Let&apos;s talk. Reach out to discuss client contract clauses on our{" "}
        <a href="/contact" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
          Contact Page
        </a>
        .
      </div>
    </div>
  );
}
