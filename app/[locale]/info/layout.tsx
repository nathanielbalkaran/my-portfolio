import { SiteHeader } from "@/components/SiteHeader";

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader activeLink="info" />
      <div className="page-wrapper">{children}</div>
    </div>
  );
}
