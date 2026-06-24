"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticProps {
  children: React.ReactNode;
  range?: number; // Activation distance (in px)
  strength?: number; // Pull power percentage (e.g. 0.35)
}

export default function Magnetic({
  children,
  range = 65,
  strength = 0.35,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Calculate the center of the bounding rectangle
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Calculate distance from mouse to the center
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    // Calculate total Euclidean distance
    const distance = Math.hypot(distanceX, distanceY);
    
    if (distance < range) {
      // Pull towards mouse based on strength
      setPosition({ x: distanceX * strength, y: distanceY * strength });
    } else {
      // Return to center if mouse is outside range
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  // Find the actual React element child, ignoring whitespace text nodes
  const childrenArray = React.Children.toArray(children);
  const elementChild = childrenArray.find(
    (c) => React.isValidElement(c)
  ) as React.ReactElement | undefined;

  if (!elementChild) {
    return null;
  }

  const updatedChild = React.cloneElement(elementChild, {
    "data-cursor": "magnetic",
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x, y }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
      className="inline-block"
    >
      {updatedChild}
    </motion.div>
  );
}
