"use client";

import { motion } from "framer-motion";

const snappyTween = {
  type: "tween" as const,
  duration: 0.2,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
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
        x: -16,
        opacity: 0,
      }}
      animate={{
        x: 0,
        opacity: 1,
      }}
      transition={{
        ...snappyTween,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
