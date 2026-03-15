"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const snappyTween = {
  type: "tween" as const,
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={snappyTween}
    >
      {children}
    </motion.div>
  );
}
