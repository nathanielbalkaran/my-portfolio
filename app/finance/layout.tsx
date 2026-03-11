import { SiteHeader } from "@/components/SiteHeader";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-finance-navy">
      <SiteHeader activeLink="pitches" useSerifFont />
      {children}
    </div>
  );
}
