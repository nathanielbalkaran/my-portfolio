import { NextResponse } from "next/server";

export const revalidate = 300;

const FINNHUB_SYMBOLS = [
  { symbol: "NVDA", display: "NVDA" },
  { symbol: "AMD", display: "AMD" },
  { symbol: "PLTR", display: "PLTR" },
  { symbol: "HIMS", display: "HIMS" },
  { symbol: "BINANCE:BTCUSDT", display: "BTC" },
] as const;

type TickerResponseItem = {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
};

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    console.error("FINNHUB_API_KEY is not set");
    return NextResponse.json(
      { error: "FINNHUB_API_KEY is not configured" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const results: TickerResponseItem[] = await Promise.all(
      FINNHUB_SYMBOLS.map(async ({ symbol, display }) => {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
          {
            next: { revalidate: 300 },
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch quote for ${symbol}`);
        }

        const data = await res.json();

        const currentPrice = typeof data?.c === "number" ? data.c : undefined;
        const changePercent = typeof data?.dp === "number" ? data.dp : 0;

        const isPositive = changePercent >= 0;

        const price =
          currentPrice !== undefined
            ? currentPrice.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "0.00";

        const change = `${
          isPositive ? "+" : ""
        }${Math.abs(changePercent).toFixed(2)}%`;

        return {
          symbol: display,
          price,
          change,
          isPositive,
        };
      }),
    );

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching Finnhub quotes:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticker data" },
      {
        status: 500,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  }
}
