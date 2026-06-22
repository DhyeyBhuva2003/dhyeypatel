"use client";

import React, { useState } from "react";
import Image from "next/image";

interface GalleryItem {
  image: string;
  alt: string;
}

interface ProjectGalleryProps {
  images: GalleryItem[];
}

export default function ProjectGallery({ images }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const currentImage = images[activeIndex];

  return (
    <div className="space-y-4">
      {/* Main Large Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 shadow-md">
        <Image
          src={currentImage.image}
          alt={currentImage.alt}
          fill
          priority
          className="object-cover transition-all duration-500 ease-in-out hover:scale-[1.01]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
        />
        {/* Soft caption overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5 pt-12">
          <p className="text-sm font-medium text-white/95">{currentImage.alt}</p>
        </div>
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
                  ? "border-purple-650 ring-2 ring-purple-500/20 scale-[0.98]"
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
