"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ExpandableDataRoomRow, type DataRoomTab } from "@/components/ExpandableDataRoomRow";
import { TypewriterTitle } from "@/components/TypewriterTitle";

const snappy = { type: "tween" as const, duration: 0.2, ease: [0.16, 1, 0.3, 1] as const };
const stagger = 0.05;

type DataRoomItem = {
  ticker: string;
  titleKey: string;
  contextKey: string;
  date: string;
  tabs: DataRoomTab[];
};

export default function FinancePage() {
  const t = useTranslations("finance");
  const tItems = useTranslations("financeItems");

  const items: DataRoomItem[] = [
    {
      ticker: "ATZ",
      titleKey: "aritziaTitle",
      contextKey: "aritziaContext",
      date: "Feb 2026",
      tabs: [
        { id: "research", label: t("tabResearch"), url: "/pdfs/aritzia.pdf" },
        { id: "model", label: t("tabModel"), url: null },
        { id: "deck", label: t("tabDeck"), url: null },
      ],
    },
    {
      ticker: "LVMH",
      titleKey: "lvmhTitle",
      contextKey: "lvmhContext",
      date: "Mar 2026",
      tabs: [
        { id: "research", label: t("tabResearch"), url: "/pdfs/lvmh.pdf" },
        { id: "model", label: t("tabModel"), url: null },
        { id: "deck", label: t("tabDeck"), url: null },
      ],
    },
  ];

  return (
    <main>
      <div className="w-full max-w-5xl pb-14">
        <header className="text-left">
          <motion.h1
            className="font-sans text-4xl font-bold tracking-tighter uppercase leading-tight text-foreground sm:text-7xl md:text-8xl sm:leading-none transition-colors duration-200 hover:text-emerald-500"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...snappy, delay: 0 }}
          >
            <TypewriterTitle
              namespace="finance"
              titleKey="title"
              titleObfuscatedKey="titleObfuscated"
            />
          </motion.h1>
          <motion.p
            className="font-mono text-sm text-gray-400 tracking-tight pb-8"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...snappy, delay: stagger }}
          >
            {t("subtitle")}
          </motion.p>
          <motion.div
            className="origin-left border-b border-gray-700 mb-12"
            aria-hidden
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ ...snappy, delay: stagger }}
          />
        </header>

        <motion.h2
          className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500 mt-8 mb-6"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...snappy, delay: stagger * 2 }}
        >
          {t("equityResearch")}
        </motion.h2>

        <motion.div
          className="border border-border"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...snappy, delay: stagger * 3 }}
        >
          {items.map((item) => (
            <ExpandableDataRoomRow
              key={item.ticker + item.date}
              ticker={item.ticker}
              title={tItems(item.titleKey)}
              date={item.date}
              context={tItems(item.contextKey)}
              tabs={item.tabs}
              viewReportLabel={t("viewReport")}
              noDocumentLabel={t("noDocument")}
            />
          ))}
        </motion.div>
      </div>
    </main>
  );
}
