"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const pages = [
  { href: "/", label: "Home" },
  { href: "/finance", label: "Pitches" },
  { href: "/marketing", label: "Marketing" },
  { href: "/about", label: "About" },
];

type Candle = {
  bodyHeight: number;
  wickHeight: number;
};

export function Footer() {
  const [candles, setCandles] = useState<Candle[]>([]);

  useEffect(() => {
    const count = 150;
    const prices: number[] = [];

    let price = 100;
    let trend = (Math.random() - 0.5) * 0.08;

    for (let i = 0; i < count; i++) {
      // small random walk with a slight trend for a smoother stock-like path
      const shock = (Math.random() - 0.5) * 0.6;
      trend += (Math.random() - 0.5) * 0.02;
      trend = Math.max(-0.15, Math.min(0.15, trend));

      price = price * (1 + trend + shock * 0.01);
      prices.push(price);
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;

    const minHeight = 40;
    const maxHeight = 220;

    const generated: Candle[] = prices.map((p) => {
      const normalized = (p - minPrice) / range;
      const height = minHeight + normalized * (maxHeight - minHeight);

      return {
        bodyHeight: height,
        wickHeight: height,
      };
    });

    setCandles(generated);
  }, []);

  return (
    <footer className="relative w-full">
      {/* Scroll-animated candlestick chart — tall strip so it’s visible as you scroll to footer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-full hidden md:flex" style={{ height: "250px" }}>
        <div className="flex h-full w-full items-end justify-between">
          {candles.map((candle, index) => (
            <motion.div
              key={index}
              className="flex flex-1 flex-col items-center"
              initial={{ height: 0, opacity: 0 }}
              whileInView={{ height: "auto", opacity: 1 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ delay: index * 0.02 }}
            >
              <div
                className="w-full bg-[#020B1A]"
                style={{ height: `${candle.bodyHeight}px` }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-[#020B1A] text-white py-12 px-8">
        {/* Prominent email */}
        <div className="mb-10">
          <a
            href="mailto:nbalkar2@uwo.ca"
            className="text-4xl md:text-6xl font-serif font-semibold tracking-tight hover:text-gray-300 transition-colors block"
          >
            nbalkar2@uwo.ca
          </a>
        </div>

        {/* Top Section: 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 text-sm">
          {/* Col 1: Brand */}
          <div>
            <span className="font-semibold">Nathaniel Balkaran</span>
          </div>

          {/* Col 2: Pages */}
          <nav aria-label="Footer pages">
            <ul className="space-y-2">
              {pages.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 3: Connect */}
          <div>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.linkedin.com/in/nathanielbalkaran"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="mailto:nbalkar2@uwo.ca"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Colophon */}
          <p className="text-gray-500">
            Built with Next.js and Tailwind. Deployed on Vercel. Help from Cursor
            and Gemini.
          </p>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-10 pt-6 flex justify-between text-xs text-gray-600">
          <span>© 2026 Nathaniel Balkaran</span>
          <div className="flex items-center gap-3">
            <a
              href="https://youtube.com/shorts/QuKVuuIfcE0?si=86gJe6n7YC_i67kS"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Easter egg"
              className="text-gray-700 hover:text-gray-400 transition-colors"
            >
              🍳
            </a>
            <span>v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
