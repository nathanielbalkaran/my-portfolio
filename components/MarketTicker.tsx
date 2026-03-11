"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

type TickerItem = {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
};

export function MarketTicker() {
  const [data, setData] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTickerData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/ticker");

      if (!res.ok) {
        throw new Error("Failed to fetch ticker data");
      }

      const json = (await res.json()) as TickerItem[];
      setData(json);
    } catch (error) {
      console.error("Error fetching ticker data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTickerData();
  }, [fetchTickerData]);

  const loopDuration = 40;

  const items = data.map((item) => ({
    ...item,
    key: item.symbol,
  }));

  // Repeat the symbols multiple times so the marquee is dense and fills wide screens
  const repeatCount = 6;
  const repeatedItems = Array.from({ length: repeatCount }, (_, idx) =>
    items.map((item) => ({
      ...item,
      key: `${item.symbol}-${idx}`,
    })),
  ).flat();

  const content = (
    <div className="flex items-center px-4">
      {repeatedItems.map((item) => {
        const baseClasses =
          "mr-8 flex items-center whitespace-nowrap text-[10px] font-mono tracking-tighter uppercase";

        const colorClasses = item.isPositive
          ? "text-emerald-500"
          : "text-red-500";

        return (
          <div key={item.key} className={`${baseClasses} ${colorClasses}`}>
            <span className="mr-1">{item.symbol}</span>
            <span className="mr-1">{item.price}</span>
            <span>({item.change})</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative z-50 flex h-8 w-full items-center overflow-hidden border-b border-gray-200 bg-white">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />

      <div className="h-full flex-1 overflow-hidden">
        <motion.div
          className="flex h-full items-center"
          aria-hidden="true"
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            ease: "linear",
            duration: loopDuration,
            repeat: Infinity,
          }}
        >
          {content}
          {content}
        </motion.div>
      </div>

      <button
        type="button"
        onClick={fetchTickerData}
        disabled={isLoading}
        className="absolute right-0 top-0 z-20 flex h-full cursor-pointer items-center justify-center border-l border-gray-200 bg-white px-3 text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed"
        aria-label="Refresh market data"
      >
        <RefreshCw
          className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
        />
      </button>
    </div>
  );
}

