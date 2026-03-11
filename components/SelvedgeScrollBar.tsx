"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function SelvedgeScrollBar() {
  const { scrollYProgress } = useScroll();

  const widthSpring = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 24,
    mass: 0.2,
  });

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100] h-1 w-full bg-[#F9F9F9]"
      style={{
        scaleX: widthSpring,
        transformOrigin: "left center",
      }}
      aria-hidden="true"
    >
      <div className="relative h-full w-full">
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#EF4444]" />
      </div>
    </motion.div>
  );
}

