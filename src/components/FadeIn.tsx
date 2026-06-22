"use client";

import React from "react";
import { motion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  className?: string;
  /** Distance the element travels before settling (px) */
  distance?: number;
  /** If true, animation plays every time element enters viewport */
  repeat?: boolean;
}

const directionMap: Record<Direction, { x?: number; y?: number }> = {
  up:    { y: 32 },
  down:  { y: -32 },
  left:  { x: 32 },
  right: { x: -32 },
  none:  {},
};

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.55,
  direction = "up",
  className,
  distance,
  repeat = false,
}: FadeInProps) {
  const offset = directionMap[direction];

  // Override default distance if provided
  const initial: Record<string, number> = { opacity: 0 };
  if (distance !== undefined) {
    if (direction === "up")    initial.y = distance;
    if (direction === "down")  initial.y = -distance;
    if (direction === "left")  initial.x = distance;
    if (direction === "right") initial.x = -distance;
  } else {
    if ("y" in offset) initial.y = offset.y!;
    if ("x" in offset) initial.x = offset.x!;
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: !repeat, margin: "-60px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // spring-like easing
      }}
    >
      {children}
    </motion.div>
  );
}
