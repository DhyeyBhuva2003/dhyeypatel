"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Services", href: "/services" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Detect scroll to toggle sticky glassmorphism style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white hover:opacity-90 transition flex items-center gap-1.5"
        >
          <span>Dhyey</span>
          <span className="text-purple-600">Bhuva</span>
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse mt-1.5"></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition duration-200 hover:text-purple-600 dark:hover:text-purple-400 ${
                  isActive
                    ? "text-purple-600 dark:text-purple-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Action Button & Menu Icon */}
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition duration-300 shadow-md shadow-purple-500/15"
          >
            Hire Me
          </Link>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none transition"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`md:hidden fixed inset-0 top-[60px] bg-white dark:bg-zinc-950 z-40 transition-transform duration-300 ease-in-out border-t border-zinc-150 dark:border-zinc-900 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6 space-y-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-lg font-medium py-2.5 border-b border-zinc-100 dark:border-zinc-900 transition ${
                  isActive
                    ? "text-purple-600 dark:text-purple-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="flex items-center justify-center w-full px-5 py-3 mt-4 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </nav>
  );
}
