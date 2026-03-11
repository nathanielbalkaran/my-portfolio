import { Navbar } from "@/components/Navbar";

export default function CapitalMarketsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">Capital Markets</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-finance-navy/70 sm:text-base">
          This is the finance track. Next step: render your stock pitches and
          investment theses from local MDX files.
        </p>
      </main>
    </>
  );
}

