"use client";

import Link from "next/link";
import { FlyIn } from "@/components/FlyIn";

const pitches = [
  {
    ticker: "ATZ",
    title: "Aritzia — WCM Equity Report Challenge",
    date: "Feb 2026",
    pdfUrl: "/pdfs/aritzia.pdf"
  },
  {
    ticker: "LVMH",
    title: "LVMH - WCM Bear Bull Company Overview",
    date: "Mar 2026",
    pdfUrl: "/pdfs/lvmh.pdf"
  },
];

export default function FinancePage() {
  return (
    <main>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <FlyIn delay={0}>
          <h1
            className="font-serif text-3xl font-semibold tracking-tight text-[#0a192f] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading-serif)" }}
          >
            Pitches
          </h1>
          <p className="mt-2 font-serif text-base leading-relaxed text-[#0a192f]/70">
            My stock pitches and investment theses. Click a row to open the PDF in a new tab.
            All thoughts expressed are my own and not financial advice.
          </p>
        </FlyIn>

        {pitches.length === 0 ? (
          <FlyIn delay={0.08}>
            <p className="mt-12 font-serif text-sm text-[#0a192f]/60">No pitches yet.</p>
          </FlyIn>
        ) : (
          <FlyIn delay={0.1}>
          <div className="mt-10 overflow-hidden rounded-lg border border-[#0a192f]/10 bg-white">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#0a192f]/10 bg-[#0a192f]/[0.02]">
                  <th className="px-5 py-3 font-serif text-xs font-semibold uppercase tracking-wider text-[#0a192f]/70">
                    Ticker
                  </th>
                  <th className="px-5 py-3 font-serif text-xs font-semibold uppercase tracking-wider text-[#0a192f]/70">
                    Title
                  </th>
                  <th className="px-5 py-3 font-serif text-xs font-semibold uppercase tracking-wider text-[#0a192f]/70">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {pitches.map((p) => (
                  <tr
                    key={p.pdfUrl}
                    className="border-b border-[#0a192f]/05 transition-colors last:border-b-0 hover:bg-[#0a192f]/[0.02]"
                  >
                    <td colSpan={3} className="p-0">
                      <Link
                        href={p.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)] text-left no-underline"
                      >
                        <span className="px-5 py-3.5 font-serif text-sm font-medium text-[#0a192f]">
                          {p.ticker}
                        </span>
                        <span className="px-5 py-3.5 font-serif text-sm font-medium text-[#0a192f]">
                          {p.title}
                        </span>
                        <span className="px-5 py-3.5 font-serif text-sm text-[#0a192f]/60">
                          {p.date}
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </FlyIn>
        )}
      </div>
    </main>
  );
}
