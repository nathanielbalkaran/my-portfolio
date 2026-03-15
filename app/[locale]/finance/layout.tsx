import { SiteHeader } from "@/components/SiteHeader";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader activeLink="market research" />
      <div className="page-wrapper">{children}</div>
    </div>
  );
}
