"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const expandSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};

export type DataRoomTab = {
  id: string;
  label: string;
  url: string | null;
};

export type ExpandableDataRoomRowProps = {
  ticker: string;
  title: string;
  date: string;
  context: string;
  tabs: DataRoomTab[];
  viewReportLabel?: string;
  noDocumentLabel?: string;
};

export function ExpandableDataRoomRow({
  ticker,
  title,
  date,
  context,
  tabs,
  viewReportLabel = "VIEW REPORT",
  noDocumentLabel = "No document available",
}: ExpandableDataRoomRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id ?? "");
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const activeTabPdfUrl = activeTab?.url ?? "";

  return (
    <div>
      {/* Collapsed: Index Row */}
      <button
        type="button"
        onClick={() => setIsExpanded((e) => !e)}
        className="group relative flex min-h-[44px] w-full justify-between items-center gap-6 py-5 px-8 border-b border-border cursor-pointer text-left transition-colors duration-200 hover:bg-foreground/5"
        aria-expanded={isExpanded}
      >
        {/* Hover: 2px vertical bar on left edge (terminal-green, scale-y 0→100%) */}
        <span
          className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-[#10B981] transition-transform duration-200 group-hover:scale-y-100"
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          aria-hidden
        />
        <span className="hidden font-mono text-sm text-gray-400 shrink-0 sm:inline">
          {ticker}
        </span>
        <span className="font-sans text-xl font-bold text-foreground min-w-0 flex-1">
          {title}
        </span>
        <span className="hidden font-mono text-sm text-gray-400 shrink-0 sm:inline">
          {date}
        </span>
        {/* Micro-copy hint: visible on hover only */}
        <span
          className="font-mono text-[10px] uppercase tracking-widest text-gray-500 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {viewReportLabel}
        </span>
      </button>

      {/* Expanded: Deep Dive Viewport */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={expandSpring}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-b border-border bg-gray-50 dark:bg-black/30">
              {/* Left: Context & Tabs */}
              <div className="flex flex-col border-r border-border p-6">
                <p className="font-sans text-sm text-foreground/80 leading-relaxed mb-6">
                  {context}
                </p>
                <nav className="flex flex-col gap-1" aria-label="Document tabs">
                  {tabs.map((tab) => {
                    const isActive = tab.id === activeTabId;
                    const hasUrl = !!tab.url;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => hasUrl && setActiveTabId(tab.id)}
                        disabled={!hasUrl}
                        className={`
                          font-mono text-sm uppercase text-left min-h-[44px] py-2 px-2 -mx-2 transition-all duration-200 ease-snappy rounded-none flex items-center
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-terminal-green focus-visible:ring-inset
                          ${isActive ? "border-l-4 border-terminal-orange pl-3 text-foreground font-bold" : "pl-4 text-foreground/60"}
                          ${hasUrl ? "cursor-pointer hover:bg-foreground/10 hover:text-foreground" : "cursor-not-allowed opacity-50"}
                        `}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
              {/* Right: Document Viewport */}
              <div className="lg:col-span-2 p-6">
                {activeTabPdfUrl ? (
                  <iframe
                    src={activeTabPdfUrl}
                    title={activeTab?.label ?? "Document"}
                    className="w-full h-[400px] sm:h-[600px] border border-border bg-gray-900 rounded-none shadow-none"
                  />
                ) : (
                  <div className="w-full h-[400px] sm:h-[600px] border border-border bg-gray-900 rounded-none shadow-none flex items-center justify-center font-mono text-sm text-gray-500">
                    {noDocumentLabel}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
