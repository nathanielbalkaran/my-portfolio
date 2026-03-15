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

function formatTickerTime() {
  const d = new Date();
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function MarketTicker() {
  const [data, setData] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [liveTime, setLiveTime] = useState(formatTickerTime);

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

  useEffect(() => {
    const t = setInterval(() => setLiveTime(formatTickerTime()), 1000);
    return () => clearInterval(t);
  }, []);

  const loopDuration = 40;

  const items = data.map((item) => ({
    ...item,
    key: item.symbol,
  }));

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
          ? "text-[#10B981]"
          : "text-[#F97316]";

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
    <div className="market-ticker relative z-50 flex h-6 w-full items-stretch border-b border-gray-700 bg-transparent dark:bg-black/20">
      <div className="market-ticker-fade pointer-events-none absolute inset-y-0 right-[3.75rem] z-10 w-16 bg-gradient-to-l from-background to-transparent dark:from-black/20" />

      {/* LIVE + timestamp — same width as header name cell (9.5rem) so right borders align */}
      <div className="flex h-full w-[9.5rem] shrink-0 items-center border-r border-gray-700 bg-transparent px-3 font-mono text-[10px] uppercase tracking-widest text-foreground/70 dark:bg-black/10">
        <span className="mr-2 inline-block h-1.5 w-1.5 bg-[#10B981]" aria-hidden />
        <span>LIVE</span>
        <span className="ml-2 tabular-nums">{liveTime}</span>
      </div>

      <div className="relative h-full min-w-0 flex-1 overflow-hidden">
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

      {/* Reload cell — same width as theme toggle (3.75rem) so borders align */}
      <div className="flex w-[3.75rem] shrink-0 items-stretch border-l border-gray-700">
        <button
          type="button"
          onClick={fetchTickerData}
          disabled={isLoading}
          className="market-ticker-btn flex h-full w-full cursor-pointer items-center justify-center bg-gray-100 text-gray-600 transition-none hover:bg-white hover:text-black disabled:cursor-not-allowed dark:bg-gray-900 dark:text-gray-400"
          aria-label="Refresh market data"
        >
          <RefreshCw
            className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
