"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  ExpandableDataRoomRow,
  type DataRoomTab,
} from "@/components/ExpandableDataRoomRow";
import { TypewriterTitle } from "@/components/TypewriterTitle";
import {
  ScrollReveal,
  ScrollBorderStrike,
  staggerListVariants,
  staggerItemVariants,
} from "@/components/ScrollReveal";

const stagger = 0.05;

type DataRoomItem = {
  ticker: string;
  titleKey: string;
  contextKey: string;
  date: string;
  /** ISO YYYY-MM-DD; used to order newest → oldest */
  sortDate: string;
  tabs: DataRoomTab[];
};

export function FinancePageClient() {
  const t = useTranslations("finance");
  const tItems = useTranslations("financeItems");

  const items: DataRoomItem[] = [
    {
      ticker: "ATZ",
      titleKey: "aritziaTitle",
      contextKey: "aritziaContext",
      date: "Feb 2026",
      sortDate: "2026-02-01",
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
      sortDate: "2026-03-01",
      tabs: [
        { id: "research", label: t("tabResearch"), url: "/pdfs/lvmh.pdf" },
        { id: "model", label: t("tabModel"), url: null },
        { id: "deck", label: t("tabDeck"), url: null },
      ],
    },
    {
      ticker: "ICC",
      titleKey: "iccChamberEssayTitle",
      contextKey: "iccChamberEssayContext",
      date: "Mar 2026",
      sortDate: "2026-03-18",
      tabs: [
        {
          id: "research",
          label: t("tabResearch"),
          url: "/pdfs/international-chamber-commerce-essay-his1809.pdf",
        },
        { id: "model", label: t("tabModel"), url: null },
        { id: "deck", label: t("tabDeck"), url: null },
      ],
    },
  ].sort((a, b) => b.sortDate.localeCompare(a.sortDate));

  return (
    <main
      className="min-w-0 w-full max-w-full overflow-x-clip"
      aria-labelledby="finance-page-heading"
    >
      <div className="w-full min-w-0 max-w-5xl pb-14">
        <header className="text-left">
          <ScrollReveal>
            <h1
              id="finance-page-heading"
              className="max-w-full break-words font-sans text-4xl font-bold uppercase leading-tight tracking-tighter text-foreground transition-colors duration-200 hover:text-emerald-500 sm:text-7xl sm:leading-none md:text-8xl"
            >
              <TypewriterTitle
                namespace="finance"
                titleKey="title"
                titleObfuscatedKey="titleObfuscated"
              />
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={stagger}>
            <p className="font-mono text-sm text-gray-400 tracking-tight pb-8">
              {t("subtitle")}
            </p>
          </ScrollReveal>
          <ScrollBorderStrike className="mb-12" />
        </header>

        <ScrollReveal delay={stagger * 2}>
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500 mt-8 mb-6">
            {t("equityResearch")}
          </h2>
        </ScrollReveal>

        <motion.div
          className="border border-border"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerListVariants(stagger * 3)}
        >
          {items.map((item) => (
            <motion.div
              key={item.ticker + item.date}
              variants={staggerItemVariants}
            >
              <ExpandableDataRoomRow
                ticker={item.ticker}
                title={tItems(item.titleKey)}
                date={item.date}
                context={tItems(item.contextKey)}
                tabs={item.tabs}
                viewReportLabel={t("viewReport")}
                noDocumentLabel={t("noDocument")}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}

