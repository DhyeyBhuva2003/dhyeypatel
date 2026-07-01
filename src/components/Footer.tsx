"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "sonner";
import {
  FaGithub,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCalendarAlt
} from "react-icons/fa";
import { SiUpwork } from "react-icons/si";
import {
  trackNewsletterSignup,
  trackEmailClick,
  trackPhoneClick,
  trackLinkedInClick,
  trackGitHubClick,
  trackYouTubeClick,
  trackEvent,
  trackBookConsultationClick
} from "@/lib/analytics";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Social Icons Data
const socialLinks = [
  { href: "https://github.com/dhyeybhuva2003", icon: <FaGithub size={18} />, label: "GitHub", color: "hover:bg-zinc-800 hover:text-white hover:shadow-zinc-800/25", onClick: () => trackGitHubClick() },
  { href: "https://linkedin.com/in/dhyeybhuva/", icon: <FaLinkedinIn size={18} />, label: "LinkedIn", color: "hover:bg-blue-600 hover:text-white hover:shadow-blue-600/25", onClick: () => trackLinkedInClick() },
  { href: "https://www.upwork.com/freelancers/~01d4c44951f41c2c1d?mp_source=share", icon: <SiUpwork size={18} />, label: "Upwork", color: "hover:bg-[#14a800] hover:text-white hover:shadow-[#14a800]/25", onClick: () => trackEvent("upwork_click") },
  { href: "https://www.youtube.com/@DhyeyBhuva1008", icon: <FaYoutube size={18} />, label: "YouTube", color: "hover:bg-red-600 hover:text-white hover:shadow-red-600/25", onClick: () => trackYouTubeClick() },
  { href: "https://instagram.com/dhyey_bhuva_003", icon: <FaInstagram size={18} />, label: "Instagram", color: "hover:bg-pink-600 hover:text-white hover:shadow-pink-600/25", onClick: () => trackEvent("instagram_click") },
  { href: "https://x.com/Dhyey_bhuva", icon: <FaTwitter size={18} />, label: "Twitter", color: "hover:bg-sky-500 hover:text-white hover:shadow-sky-500/25", onClick: () => trackEvent("twitter_click") },
  { href: "mailto:dhyeybhuva2003@gmail.com", icon: <FaEnvelope size={18} />, label: "Email", color: "hover:bg-brand-primary hover:text-white hover:shadow-brand-primary/25", onClick: () => trackEmailClick("dhyeybhuva2003@gmail.com") }
];



export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);

  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendly.com/dhyeybhuva2003/30min";

  const [localTime, setLocalTime] = useState<string>("");
  const [dynamicServices, setDynamicServices] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("subscribed") === "true") {
        toast.success("Thank you for subscribing to our updates!");
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const sorted = [...json.data].sort((a, b) => (a.order || 0) - (b.order || 0));
          setDynamicServices(sorted.slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to fetch services in footer:", err);
      }
    };
    fetchServices();
  }, []);

  // Time Synced to Ahmedabad (Asia/Kolkata)
  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      const formatter = new Intl.DateTimeFormat([], options);
      setLocalTime(formatter.format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // GSAP Animations (using fromTo to bypass StrictMode duplicate run opacity locking)
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Footer Container Slide Up and Fade In on scroll
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        }
      });

      mainTl.fromTo(footerRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
      );

      // 2. Footer Columns Reveal Sequentially
      const columns = gsap.utils.toArray<HTMLElement>(".footer-column");
      mainTl.fromTo(columns,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power2.out" },
        "-=0.8"
      );

      // 3. Social Icons Stagger Animation
      const socialIcons = gsap.utils.toArray<HTMLElement>(".social-btn");
      mainTl.fromTo(socialIcons,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" },
        "-=0.6"
      );


    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative w-full border-t border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md overflow-hidden"
    >
      {/* Visual Design Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none -z-10 opacity-70" />
      <div className="absolute inset-0 bg-noise-overlay pointer-events-none -z-10 opacity-[0.03]" />

      {/* Floating Blur Circles (Subtle Premium Background Orbs) */}
      <div className="absolute top-12 left-1/4 w-72 h-72 rounded-full bg-brand-primary/5 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-80 h-80 rounded-full bg-brand-accent/5 blur-3xl -z-10 pointer-events-none" />

      {/* Main Footer Container */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 space-y-16">

        {/* Newsletter Section */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/60 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-900/20 backdrop-blur-md p-8 md:p-12 shadow-xl shadow-black/5 glow-line-top max-w-5xl mx-auto">
          {/* Subtle inside gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 via-transparent to-brand-accent/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center lg:text-left max-w-lg">
              <h3 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
                Stay Updated
              </h3>
              <p className="text-xs sm:text-sm text-text-sub leading-relaxed">
                Get development insights, SaaS architecture tips, and technical articles directly in your inbox.
              </p>
            </div>

            <div className="w-full lg:w-auto flex flex-col items-center lg:items-start gap-2.5">
              <span className="text-xs sm:text-sm text-text-sub font-bold uppercase tracking-wider">
                Subscribe instantly with:
              </span>
              <div className="flex gap-2.5">
                <a
                  href="/api/auth/oauth/google"
                  onClick={() => trackNewsletterSignup("google")}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 transition cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" className="fill-[#4285F4] dark:fill-white" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" className="fill-[#34A853] dark:fill-white" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" className="fill-[#FBBC05] dark:fill-white" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" className="fill-[#EA4335] dark:fill-white" />
                  </svg>
                  <span>Google</span>
                </a>
                {/* <a
                  href="/api/auth/oauth/linkedin"
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-350 transition cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4 shrink-0 text-[#0077b5]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a> */}
              </div>
            </div>
          </div>
        </div>


        {/* Footer Grid */}
        <div
          ref={columnsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-8"
        >
          {/* Column 1 - Brand */}
          <div className="footer-column space-y-5 text-center lg:text-left">
            <div>
              <Link
                href="/"
                className="text-xl font-extrabold tracking-tight text-text-main flex items-center justify-center lg:justify-start gap-1"
              >
                <span>Dhyey</span>
                <span className="text-brand-primary">Bhuva</span>
              </Link>
              <p className="text-xs font-semibold text-brand-primary/80 dark:text-brand-accent/80 uppercase tracking-widest mt-1">
                Full Stack Developer
              </p>
            </div>

            <p className="text-xs sm:text-sm text-text-sub leading-relaxed max-w-sm mx-auto lg:mx-0">
              Building scalable SaaS applications, modern web platforms, enterprise systems, and AI-powered solutions.
            </p>

            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Available for Freelance Projects
            </div>
          </div>

          {/* Column 2 - Services */}
          <div className="footer-column text-center lg:text-left space-y-4">
            <h4 className="text-xs font-extrabold text-text-main uppercase tracking-widest">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-text-sub">
              {dynamicServices.length > 0 ? (
                dynamicServices.map((service) => (
                  <li key={service._id}>
                    <Link
                      href={`/services#${service.slug}`}
                      className="hover:text-brand-primary dark:hover:text-brand-accent transition-colors duration-250"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))
              ) : (
                [
                  { title: "E-Commerce Website Development", slug: "ecommerce-development" },
                  { title: "Custom ERP Software Development", slug: "erp-software-development" },
                  { title: "CRM Software Development", slug: "crm-software-development" },
                  { title: "Custom Business Software", slug: "custom-business-software" },
                  { title: "Cross-Platform Mobile App Development", slug: "mobile-app-development" },
                  { title: "AI Automation & Business Solutions", slug: "ai-automation-solutions" },
                ].map((s, index) => (
                  <li key={index}>
                    <Link
                      href={`/services#${s.slug}`}
                      className="hover:text-brand-primary dark:hover:text-brand-accent transition-colors duration-250"
                    >
                      {s.title}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Column 3 - Quick Links */}
          <div className="footer-column text-center lg:text-left space-y-4">
            <h4 className="text-xs font-extrabold text-text-main uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-text-sub">
              {[
                { label: "Home", href: "/" },
                { label: "Portfolio", href: "/portfolio" },
                { label: "Services", href: "/services" },
                { label: "Case Studies", href: "/portfolio" },
                { label: "Blog", href: "/blog" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" }
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-brand-primary dark:hover:text-brand-accent transition-colors duration-250">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact & CTA */}
          <div className="footer-column text-center lg:text-left space-y-5">
            <h4 className="text-xs font-extrabold text-text-main uppercase tracking-widest">
              Let&apos;s Build Something Great
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-text-sub">
              <li className="flex items-center justify-center lg:justify-start gap-2.5">
                <FaEnvelope className="text-brand-primary shrink-0" size={13} />
                <a
                  href="mailto:dhyeybhuva2003@gmail.com"
                  onClick={() => trackEmailClick("dhyeybhuva2003@gmail.com")}
                  className="hover:text-brand-primary transition break-all"
                >
                  dhyeybhuva2003@gmail.com
                </a>
              </li>
              <li className="flex items-center justify-center lg:justify-start gap-2.5">
                <FaPhoneAlt className="text-brand-primary shrink-0" size={13} />
                <a
                  href="tel:+916355830394"
                  onClick={() => trackPhoneClick("+916355830394")}
                  className="hover:text-brand-primary transition"
                >
                  +91 6355830394
                </a>
              </li>
              <li className="flex items-center justify-center lg:justify-start gap-2.5">
                <FaMapMarkerAlt className="text-brand-primary shrink-0" size={13} />
                <span>Ahmedabad, Gujarat</span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackBookConsultationClick(bookingUrl)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/90 transition-all duration-300 hover:scale-[1.03] shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 relative overflow-hidden group/btn"
              >
                {/* Glow Pulse Animation Layer */}
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                <FaCalendarAlt size={12} />
                <span>Schedule a Call</span>
              </a>
            </div>
          </div>
        </div>


        {/* Social Icons Section */}
        <div
          ref={socialRef}
          className="flex justify-center items-center gap-3 pt-2"
        >
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={social.onClick}
              className={`social-btn p-3 rounded-full bg-zinc-100/60 dark:bg-zinc-900/60 text-text-sub border border-zinc-200/50 dark:border-zinc-800/40 hover:scale-110 hover:-translate-y-0.5 ${social.color} transition-all duration-300 flex items-center justify-center hover:shadow-md cursor-pointer`}
              aria-label={social.label}
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* Copyright Section (Premium Bottom Bar) */}
        <div className="border-t border-zinc-200/50 dark:border-zinc-800/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-text-sub">
          {/* Left copyright statement */}
          <div className="text-center md:text-left space-y-0.5">
            <p>© {new Date().getFullYear()} Dhyey Bhuva. All rights reserved.</p>
            {/* <p className="text-[10px] text-text-sub/60">Crafted with Next.js, TypeScript &amp; Passion.</p> */}
          </div>

          {/* Center Dynamic Time Clock */}
          {localTime && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-text-sub/65 border border-zinc-200/40 dark:border-zinc-800/30 rounded-lg bg-zinc-500/5 px-3 py-1 bg-opacity-30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Ahmedabad, India: {localTime}</span>
            </div>
          )}

          {/* Right link lists */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/privacy" className="hover:text-brand-primary dark:hover:text-brand-accent transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-primary dark:hover:text-brand-accent transition">
              Terms of Service
            </Link>
            <a
              href="https://github.com/dhyeybhuva2003/dhyeypatel"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-primary dark:hover:text-brand-accent transition"
            >
              Source Code
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
