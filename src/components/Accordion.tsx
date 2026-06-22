"use client";

import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm transition-all duration-300"
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full px-6 py-5 flex justify-between items-center text-left font-bold text-zinc-900 dark:text-white hover:bg-zinc-50/50 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer focus:outline-none"
            >
              <span className="text-sm md:text-base tracking-tight">{item.title}</span>
              <FaChevronDown
                className={`w-4 h-4 text-purple-600 dark:text-purple-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[1000px] border-t border-zinc-100 dark:border-zinc-850" : "max-h-0"
                }`}
            >
              <div className="px-6 py-5 text-sm leading-relaxed text-zinc-650 dark:text-zinc-400 space-y-4 bg-zinc-50/20 dark:bg-zinc-950/20">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
