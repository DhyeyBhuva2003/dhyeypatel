"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import Magnetic from "./Magnetic";
import { trackHireMeClick } from "@/lib/analytics";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const lastScrollY = useRef(0);

  // Handle scroll detection:
  // - Track if scrolled > 20 for backdrop density
  // - Hide on scroll down, reveal on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Track whether page is scrolled
      if (currentScrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Hide/Show logic on scroll
      if (currentScrollY <= 40) {
        // At or near the top: always show
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY - lastScrollY.current > 6) {
        // Scrolling DOWN: hide header
        setVisible(false);
      } else if (currentScrollY < lastScrollY.current && lastScrollY.current - currentScrollY > 6) {
        // Scrolling UP: show header
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isHeaderVisible = visible || isOpen;

  return (
    <header
      className={`fixed top-3 sm:top-5 left-0 right-0 z-50 flex flex-col items-center px-4 sm:px-6 pointer-events-none transition-all duration-300 ease-in-out ${
        isHeaderVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-28 opacity-0"
      }`}
    >
      {/* Floating Rounded Island Navbar */}
      <nav
        className={`w-full max-w-5xl rounded-full transition-all duration-300 pointer-events-auto border flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 ${
          scrolled
            ? "bg-white/85 dark:bg-[#0a0f1d]/85 backdrop-blur-xl border-zinc-200/80 dark:border-zinc-800/80 shadow-lg shadow-black/5 dark:shadow-black/30"
            : "bg-white/70 dark:bg-[#0a0f1d]/70 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
        }`}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="text-base sm:text-lg font-extrabold tracking-tight text-text-main hover:opacity-90 transition flex items-center gap-1.5"
        >
          <span>Dhyey</span>
          <span className="text-brand-primary">Bhuva</span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse mt-1"></span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs lg:text-sm font-medium transition duration-200 hover:text-brand-primary dark:hover:text-brand-accent relative py-1 ${
                  isActive
                    ? "text-brand-primary dark:text-brand-accent font-semibold"
                    : "text-text-sub"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary dark:bg-brand-accent rounded-full animate-fadeIn" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Action Button & Theme Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          <Magnetic>
            <Link
              href="/contact"
              onClick={() => trackHireMeClick("navbar")}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition duration-300 shadow-md shadow-brand-primary/20"
            >
              Hire Me
            </Link>
          </Magnetic>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full border border-border-main hover:bg-bg-sub text-text-sub hover:text-text-main focus:outline-none transition cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation-menu"
          >
            {isOpen ? <FaTimes size={15} /> : <FaBars size={15} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Dropdown Card */}
      {isOpen && (
        <div
          id="mobile-navigation-menu"
          className="w-full max-w-5xl mt-2 rounded-3xl bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl p-6 pointer-events-auto transition-all animate-scaleUp md:hidden"
        >
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-base font-medium py-2.5 px-3 rounded-xl transition ${
                    isActive
                      ? "text-brand-primary dark:text-brand-accent bg-brand-primary/10 font-semibold"
                      : "text-text-sub hover:bg-zinc-100 dark:hover:bg-zinc-850"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/contact"
              onClick={() => trackHireMeClick("mobile_navbar")}
              className="flex items-center justify-center w-full px-5 py-3 mt-2 rounded-full text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/95 transition shadow-lg shadow-brand-primary/20"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
