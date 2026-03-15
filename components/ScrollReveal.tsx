"use client";

import React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;
const REVEAL_DURATION = 0.4;
const STAGGER_DELAY = 0.05;

const baseRevealVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type ScrollRevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export function ScrollReveal({
  children,
  delay = 0,
  className,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        ...baseRevealVariants,
        visible: {
          ...baseRevealVariants.visible!,
          transition: {
            duration: REVEAL_DURATION,
            ease: REVEAL_EASE,
            delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export const staggerListVariants = (delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_DELAY,
      delayChildren,
    },
  },
});

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: REVEAL_DURATION,
      ease: REVEAL_EASE,
    },
  },
};

type ScrollBorderStrikeProps = {
  className?: string;
};

export function ScrollBorderStrike({ className }: ScrollBorderStrikeProps) {
  return (
    <motion.div
      className={`origin-left border-b border-gray-700 ${className ?? ""}`}
      aria-hidden
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: REVEAL_DURATION,
        ease: REVEAL_EASE,
      }}
    />
  );
}

type ParallaxImageProps = Omit<
  React.ComponentProps<typeof Image>,
  "fill" | "width" | "height"
> & {
  className?: string;
};

export function ParallaxImage({
  className,
  alt,
  ...props
}: ParallaxImageProps) {
  return (
    <motion.div
      initial={{ scale: 1.06 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true, amount: 0.7 }}
      transition={{
        duration: 0.6,
        ease: REVEAL_EASE,
      }}
      className={className}
    >
      <Image
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        {...props}
      />
    </motion.div>
  );
}
