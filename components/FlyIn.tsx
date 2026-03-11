"use client";

import { motion } from "framer-motion";

const jigglySpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 22,
  mass: 0.9,
};

type FlyInProps = {
  children: React.ReactNode;
  /** Stagger delay in seconds */
  delay?: number;
  className?: string;
};

export function FlyIn({ children, delay = 0, className }: FlyInProps) {
  return (
    <motion.div
      initial={{
        y: 48,
        opacity: 0,
        scale: 0.98,
      }}
      animate={{
        y: 0,
        opacity: 1,
        scale: 1,
      }}
      transition={{
        ...jigglySpring,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
