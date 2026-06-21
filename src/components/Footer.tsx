import React from "react";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Tagline Column */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5"
            >
              <span>Dhyey</span>
              <span className="text-purple-600">Bhuva</span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              Full-Stack Software Engineer & Solutions Architect. Specializing in high-performance SaaS applications, database optimizations, and intelligent agent integrations.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 text-zinc-400 dark:text-zinc-500 pt-2">
              <a
                href="https://github.com/DhyeyBhuva2003"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition"
                aria-label="GitHub"
              >
                <FaGithub size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/dhyeybhuva/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition"
                aria-label="Twitter"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="mailto:inquiry@dhyeybhuva.com"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition"
                aria-label="Email"
              >
                <FaEnvelope size={18} />
              </a>
            </div>
          </div>

          {/* Quick links Column */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/portfolio"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  Blog Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Column */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Admin Gateway
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  Dashboard Access
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  Support & Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-200/50 dark:border-zinc-900/50 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
          <p>© {currentYear} Dhyey Bhuva. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-purple-500 transition">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-purple-500 transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
