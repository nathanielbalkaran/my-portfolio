"use client";

/**
 * Pure CSS twinkling starscape. Rendered only inside dark-mode container (layout).
 * 1px white dots, sparse, very slow opacity pulse — subtle ambient texture.
 */
export function StarsBackground() {
  const count = 36;
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: (i * 19 + (i % 13) * 23) % 100,
    top: (i * 29 + (i % 9) * 17) % 100,
    delay: (i % 15) * 0.6,
  }));

  return (
    <div
      className="stars-background pointer-events-none absolute inset-0 h-full w-full opacity-0"
      aria-hidden
    >
      {stars.map(({ id, left, top, delay }) => (
        <span
          key={id}
          className="star-dot absolute bg-white"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
