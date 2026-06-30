"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface GalleryItem {
  image: string;
  alt: string;
}

interface ProjectGalleryProps {
  images: GalleryItem[];
  autoPlayInterval?: number;
}

export default function ProjectGallery({ images, autoPlayInterval = 4000 }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!images || images.length <= 1 || isHovered) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [images, isHovered, autoPlayInterval]);

  if (!images || images.length === 0) return null;

  const currentImage = images[activeIndex];

  return (
    <div className="space-y-4">
      {/* Main Large Image */}
      <div 
        className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 shadow-md group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={currentImage.image}
          alt={currentImage.alt}
          fill
          priority
          className="object-cover transition-all duration-500 ease-in-out hover:scale-[1.01]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
        />
        {/* Soft caption overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-12 pointer-events-none">
          <p className="text-sm font-medium text-white/95">{currentImage.alt}</p>
        </div>

        {/* Hover Controls (Next/Prev Arrows for enhanced user experience) */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm cursor-pointer z-10"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm cursor-pointer z-10"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
          {images.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-video w-24 md:w-32 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
                index === activeIndex
                  ? "border-brand-primary ring-2 ring-brand-primary/20 scale-[0.98]"
                  : "border-transparent hover:border-zinc-400 dark:hover:border-zinc-600 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
