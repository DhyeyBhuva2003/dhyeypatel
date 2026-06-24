"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

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

  // Prevent scrolling when mobile menu is open
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

  return (
    <nav
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        isOpen ? "inset-0" : "top-0"
      } ${
        isOpen
          ? scrolled
            ? "bg-white dark:bg-[#020617] py-3.5"
            : "bg-white dark:bg-[#020617] py-6"
          : scrolled
          ? "bg-bg-main/80 backdrop-blur-md border-b border-border-main py-3.5 shadow-sm"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-text-main hover:opacity-90 transition flex items-center gap-1.5"
        >
          <span>Dhyey</span>
          <span className="text-brand-primary">Bhuva</span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse mt-1.5"></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition duration-200 hover:text-brand-primary dark:hover:text-brand-accent ${
                  isActive
                    ? "text-brand-primary dark:text-brand-accent font-semibold"
                    : "text-text-sub"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Action Button & Theme Toggle */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition duration-300 shadow-lg shadow-brand-primary/10"
          >
            Hire Me
          </Link>

          {/* Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 rounded-xl border border-border-main hover:bg-bg-sub text-text-sub hover:text-text-main focus:outline-none transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`md:hidden fixed inset-0 top-[70px] bg-bg-main z-40 transition-transform duration-300 ease-in-out border-t border-border-main ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6 space-y-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-lg font-medium py-3 border-b border-border-main transition ${
                  isActive
                    ? "text-brand-primary dark:text-brand-accent font-semibold"
                    : "text-text-sub"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="flex items-center justify-center w-full px-5 py-3.5 mt-4 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary/95 transition"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </nav>
  );
}
