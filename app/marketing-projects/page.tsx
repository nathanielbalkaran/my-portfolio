import { Navbar } from "@/components/Navbar";

export default function MarketingProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Marketing Projects
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-finance-navy/70 sm:text-base">
          This is the marketing track. Next step: render your marketing case
          studies from local MDX files.
        </p>
      </main>
    </>
  );
}
