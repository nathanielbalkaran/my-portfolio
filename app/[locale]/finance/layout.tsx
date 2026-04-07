import { SiteHeader } from "@/components/SiteHeader";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-clip text-foreground">
      <SiteHeader activeLink="projects" />
      <div className="page-wrapper">{children}</div>
    </div>
  );
}
