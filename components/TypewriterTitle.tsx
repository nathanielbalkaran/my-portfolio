"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

const TYPEWRITER_DURATION_MS = 400;

type Props = {
  namespace: string;
  titleKey: string;
  titleObfuscatedKey: string;
  className?: string;
};

export function TypewriterTitle({
  namespace,
  titleKey,
  titleObfuscatedKey,
  className,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const rafRef = useRef<number | null>(null);
  const t = useTranslations(namespace);

  const fullText = t(titleKey);
  const obfuscated = t(titleObfuscatedKey);
  const len = Math.min(fullText.length, obfuscated.length);

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
      ? fullText
      : Array.from({ length: len }, (_, i) =>
          i < typewriterIndex ? obfuscated[i] : fullText[i],
        ).join("") + fullText.slice(len);

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
