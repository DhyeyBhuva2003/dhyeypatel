"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorType = "default" | "hover" | "magnetic" | "text" | "hidden";

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState<CursorType>("default");
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // High performance Motion Values for direct coordinate translation
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring configuration for smooth outer ring motion lag
  const ringX = useSpring(mouseX, { stiffness: 350, damping: 30, mass: 0.4 });
  const ringY = useSpring(mouseY, { stiffness: 350, damping: 30, mass: 0.4 });

  useEffect(() => {
    // 1. Device check: Only disable if there is NO fine pointer (mouse/trackpad) available
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer) {
      return;
    }

    setEnabled(true);
    document.body.classList.add("custom-cursor-active");

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    const handleMouseEnterWindow = () => {
      setIsVisible(true);
    };

    // Event delegation to capture active hovering target
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const hasMagnetic = target.closest('[data-cursor="magnetic"]');
      const hasHoverAttr = target.closest('[data-cursor="hover"]');
      const hasHiddenAttr = target.closest('[data-cursor="hidden"]');
      
      const closestInteractive = target.closest(
        "a, button, [role='button'], .cursor-pointer"
      );
      const closestInput = target.closest(
        "input, textarea, [contenteditable='true']"
      );

      if (hasHiddenAttr) {
        setCursorType("hidden");
      } else if (hasMagnetic) {
        setCursorType("magnetic");
      } else if (hasHoverAttr || closestInteractive) {
        setCursorType("hover");
      } else if (closestInput) {
        setCursorType("text");
      } else {
        setCursorType("default");
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeaveWindow);
    window.addEventListener("mouseenter", handleMouseEnterWindow);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeaveWindow);
      window.removeEventListener("mouseenter", handleMouseEnterWindow);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mouseX, mouseY]);

  if (!enabled) return null;

  // Visual settings depending on current interactive state
  const ringVariants = {
    default: {
      width: 36,
      height: 36,
      scale: isClicking ? 0.8 : 1,
      backgroundColor: "rgba(37, 99, 235, 0)", // transparent primary
      borderColor: "var(--primary, #2563eb)",
      borderWidth: "1.5px",
    },
    hover: {
      width: 56,
      height: 56,
      scale: isClicking ? 0.85 : 1,
      backgroundColor: "rgba(6, 182, 212, 0.06)", // cyan tint
      borderColor: "var(--accent, #06b6d4)",
      borderWidth: "1px",
      boxShadow: "0 0 15px rgba(6, 182, 212, 0.3)",
    },
    magnetic: {
      width: 68,
      height: 68,
      scale: isClicking ? 0.85 : 1.1,
      backgroundColor: "rgba(6, 182, 212, 0.12)",
      borderColor: "var(--accent, #06b6d4)",
      borderWidth: "2px",
      boxShadow: "0 0 25px rgba(6, 182, 212, 0.45)",
    },
    text: {
      width: 0,
      height: 0,
      scale: 0,
      borderColor: "rgba(0, 0, 0, 0)",
      borderWidth: "0px",
    },
    hidden: {
      width: 0,
      height: 0,
      scale: 0,
    },
  };

  const dotVariants = {
    default: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: "var(--primary, #2563eb)",
      scale: isClicking ? 1.4 : 1,
    },
    hover: {
      width: 0,
      height: 0,
      backgroundColor: "var(--accent, #06b6d4)",
      scale: 0,
    },
    magnetic: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      backgroundColor: "var(--accent, #06b6d4)",
      scale: isClicking ? 1.6 : [1, 1.4, 1], // Pulsing effect
      transition: {
        repeat: Infinity,
        duration: 1.2,
      },
    },
    text: {
      width: 2,
      height: 20,
      borderRadius: "1px",
      backgroundColor: "var(--primary, #2563eb)",
      scale: 1,
    },
    hidden: {
      width: 0,
      height: 0,
    },
  };

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[9999]"
      animate={{ opacity: isVisible && cursorType !== "hidden" ? 1 : 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* Outer Spring Ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none rounded-full flex items-center justify-center border"
        variants={ringVariants}
        animate={cursorType}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 28,
        }}
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* Inner Precision Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none rounded-full"
        variants={dotVariants}
        animate={cursorType}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 25,
        }}
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </motion.div>
  );
}
