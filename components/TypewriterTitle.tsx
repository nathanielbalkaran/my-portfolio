"use client";

import { useState, useEffect, useRef } from "react";

const TYPEWRITER_DURATION_MS = 400;

type Props = {
  text: string;
  obfuscatedText: string;
  className?: string;
};

export function TypewriterTitle({ text, obfuscatedText, className }: Props) {
  const [hovered, setHovered] = useState(false);
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const rafRef = useRef<number | null>(null);
  const len = Math.min(text.length, obfuscatedText.length);

  useEffect(() => {
    if (!hovered) {
      return;
    }
    const start = performance.now();
    const run = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / TYPEWRITER_DURATION_MS, 1);
      setTypewriterIndex(Math.floor(progress * (len + 1)));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(run);
      }
    };
    rafRef.current = requestAnimationFrame(run);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [hovered, len]);

  const displayText =
    !hovered || typewriterIndex === 0
      ? text
      : Array.from({ length: len }, (_, i) =>
          i < typewriterIndex ? obfuscatedText[i] : text[i],
        ).join("") + text.slice(len);

  return (
    <span
      role="text"
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setTypewriterIndex(0);
      }}
    >
      {displayText}
    </span>
  );
}
