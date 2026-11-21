"use client";

import React, { useEffect, useState, useRef } from "react";
import { FaBriefcase, FaMicrochip, FaSmile, FaClock } from "react-icons/fa";

interface StatItem {
  icon: "briefcase" | "microchip" | "smile" | "clock";
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { icon: "briefcase", value: 25, suffix: "+", label: "Projects Completed" },
  { icon: "microchip", value: 10, suffix: "+", label: "Technologies" },
  { icon: "smile", value: 15, suffix: "+", label: "Happy Clients" },
  { icon: "clock", value: 2, suffix: "+", label: "Years Experience" },
];

function StatCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState<number>(0);
  const [hasMounted, setHasMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    setHasMounted(true);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          const duration = 1800; // 1.8s
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            // Ease out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOutProgress * target);

            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={containerRef} className="text-2xl font-extrabold text-text-main tabular-nums">
      {/* On SSR and for search engines, rendered statically; animates smoothly on client */}
      <span aria-hidden="true">{hasMounted ? `${count}${suffix}` : `${target}${suffix}`}</span>
      {/* Guaranteed indexable text for SEO crawlers and screen readers */}
      <span className="sr-only">{`${target}${suffix}`}</span>
    </div>
  );
}

export default function HeroStats() {
  const getIcon = (type: string) => {
    switch (type) {
      case "briefcase":
        return <FaBriefcase className="text-brand-primary" size={14} />;
      case "microchip":
        return <FaMicrochip className="text-brand-primary" size={14} />;
      case "smile":
        return <FaSmile className="text-brand-primary" size={14} />;
      case "clock":
        return <FaClock className="text-brand-primary" size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 max-w-lg mx-auto lg:mx-0">
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-text-sub mb-0.5">{getIcon(s.icon)}</div>
          <StatCounter target={s.value} suffix={s.suffix} />
          <div className="text-[11px] text-text-sub leading-tight">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
